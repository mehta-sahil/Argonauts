import asyncio
import base64
import json
import time
import cv2
import numpy as np
from fastapi import WebSocket, WebSocketDisconnect

from app.session import session_manager, BufferedFrame, SessionState
from app.models import PhaseEnum, ActionTypeEnum
from app.environment import EnvironmentValidator
from app.flash_pad import FlashPADAnalyzer
from app.action_challenge import ActionChallengeEngine, expression_cnn
from app.forensics import forensics_engine
from app.face_matcher import face_matcher
from app.verdict import verdict_engine


class WebSocketHandler:
    @staticmethod
    async def handle_connection(websocket: WebSocket, session_id: str):
        await websocket.accept()
        session = session_manager.get_session(session_id)
        if not session:
            await websocket.send_json({
                "type": "error",
                "message": f"Session {session_id} not found or expired. Please upload ID again."
            })
            await websocket.close(code=4004)
            return

        session.started_at = time.time()
        print(f"[WebSocket] Connected session: {session_id}")

        # Send initial session start
        await websocket.send_json({
            "type": "session_start",
            "session_id": session_id,
            "timeout_seconds": 60
        })

        # Launch background phase orchestration task
        orchestrator_task = asyncio.create_task(
            WebSocketHandler._orchestrate_pipeline(websocket, session)
        )

        try:
            while True:
                data_text = await websocket.receive_text()
                try:
                    msg = json.loads(data_text)
                except Exception:
                    continue

                msg_type = msg.get("type")

                if msg_type == "env_data":
                    await WebSocketHandler._handle_env_data(websocket, session, msg)

                elif msg_type == "frame":
                    await WebSocketHandler._handle_frame(websocket, session, msg)

                elif msg_type == "action_event":
                    # Client-side detected action event
                    session.action_client_count = msg.get("count", session.action_client_count + 1)
                    await websocket.send_json({
                        "type": "action_progress_ack",
                        "client_count": session.action_client_count,
                        "server_count": session.action_server_count
                    })

                elif msg_type == "ping":
                    await websocket.send_json({"type": "pong", "time": time.time()})

        except WebSocketDisconnect:
            print(f"[WebSocket] Disconnected session {session_id}")
        except Exception as e:
            print(f"[WebSocket] Error in session {session_id}: {e}")
        finally:
            orchestrator_task.cancel()
            # The decoded frame buffer is the bulk of a session's memory and is of
            # no further use once the connection is over. The session itself stays
            # until the sweeper evicts it, so the verdict remains fetchable.
            session.release_frames()

    @staticmethod
    async def _handle_env_data(websocket: WebSocket, session: SessionState, msg: dict):
        """Processes Phase 2 Environment inspection from client."""
        # 1. Automation flags
        auto_passed, auto_status, auto_details = EnvironmentValidator.validate_automation(msg)
        session.telemetry["automation"] = {
            "status": "PASSED" if auto_passed else "FAILED",
            "display": auto_status,
            "value": 1.0 if auto_passed else 0.0,
            "details": auto_details
        }
        await websocket.send_json({
            "type": "telemetry",
            "check": "automation",
            "status": session.telemetry["automation"]["status"],
            "display": auto_status,
            "details": auto_details
        })

        # 2. Camera Driver / Virtual Cameras
        devices = msg.get("devices", [])
        cam_passed, cam_status, cam_details = EnvironmentValidator.validate_camera(devices)
        session.telemetry["camera_driver"] = {
            "status": "PASSED" if cam_passed else "FAILED",
            "display": cam_status,
            "value": 1.0 if cam_passed else 0.0,
            "details": cam_details
        }
        await websocket.send_json({
            "type": "telemetry",
            "check": "camera_driver",
            "status": session.telemetry["camera_driver"]["status"],
            "display": cam_status,
            "details": cam_details
        })

        # 3. Frame Timing Jitter Variance
        jitter_deltas = msg.get("jitter_deltas", [])
        jit_passed, jit_status, variance, jit_details = EnvironmentValidator.validate_frame_jitter(jitter_deltas)
        session.telemetry["frame_jitter"] = {
            "status": "PASSED" if jit_passed else "FAILED",
            "display": jit_status,
            "value": variance,
            "details": jit_details
        }
        await websocket.send_json({
            "type": "telemetry",
            "check": "frame_jitter",
            "status": session.telemetry["frame_jitter"]["status"],
            "display": jit_status,
            "details": jit_details
        })

        # Check for HARD BLOCK on environment failure
        if not auto_passed or not cam_passed:
            session.is_blocked = True
            reason = "Virtual Camera Loopback or Automated Environment Detected"
            session.block_reason = reason
            await websocket.send_json({
                "type": "blocked",
                "reason": reason,
                "details": {
                    "automation": auto_details,
                    "camera": cam_details
                }
            })
            await websocket.close(code=4003)
            session.env_received.set()
            return

        session.env_received.set()

    @staticmethod
    async def _handle_frame(websocket: WebSocket, session: SessionState, msg: dict):
        """Processes streamed frames, decodes image, computes landmarks/metrics."""
        try:
            b64_data = msg.get("frame", "")
            if "," in b64_data:
                b64_data = b64_data.split(",")[1]
            
            img_bytes = base64.b64decode(b64_data)
            nparr = np.frombuffer(img_bytes, np.uint8)
            img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img_bgr is None:
                return

            timestamp = msg.get("timestamp", time.time())
            landmarks = msg.get("landmarks", None)
            
            # Frame counter for throttled CNN inference (every 10 frames)
            if not hasattr(session, 'frame_counter'):
                session.frame_counter = 0
            session.frame_counter += 1
            
            # Detect face
            detected, bbox, conf = face_matcher.detect_face(img_bgr)
            flash_color = msg.get("flash_color", None)
            
            buffered = BufferedFrame(
                timestamp=timestamp,
                image_bgr=img_bgr,
                face_bbox=bbox,
                face_confidence=conf if detected else 0.0,
                landmarks=landmarks,
                phase=session.current_phase,
                flash_color=flash_color
            )
            session.add_frame(buffered)

            # Check action progress if in action challenge phase
            if session.current_phase == PhaseEnum.ACTION_CHALLENGE and session.action_config:
                challenge = session.action_config
                action_type = challenge.action

                # 1. BLINK_N: Verified via Eye Aspect Ratio (EAR) hysteresis
                if action_type == ActionTypeEnum.BLINK_N and landmarks:
                    ear = ActionChallengeEngine.compute_ear(landmarks)
                    if not hasattr(session, '_blink_state'):
                        session._blink_state = False
                    if ear < 0.21:
                        session._blink_state = True
                    elif ear > 0.25 and session._blink_state:
                        session._blink_state = False
                        session.action_server_count += 1
                        await websocket.send_json({
                            "type": "action_progress_ack",
                            "server_count": session.action_server_count,
                            "target_count": challenge.params.get("target_count", 3)
                        })

                # 2. SMILE_HOLD: CNN Expression Classifier every 10 frames + MAR landmark check
                elif action_type == ActionTypeEnum.SMILE_HOLD:
                    is_smiling_now = False
                    
                    # Mobile-optimized CNN check every 10 frames on face crop
                    if session.frame_counter % 10 == 0:
                        face_crop = img_bgr
                        if bbox is not None and len(bbox) >= 4:
                            bx, by, bw, bh = bbox
                            face_crop = img_bgr[max(0, by):min(img_bgr.shape[0], by+bh), max(0, bx):min(img_bgr.shape[1], bx+bw)]
                        cnn_smile, _ = expression_cnn.is_smiling(face_crop, threshold=0.52)
                        if cnn_smile:
                            is_smiling_now = True

                    # Complementary MAR landmark check
                    if landmarks and not is_smiling_now:
                        mar = ActionChallengeEngine.compute_mar(landmarks)
                        if mar > 0.55:
                            is_smiling_now = True

                    if is_smiling_now:
                        if not hasattr(session, '_smile_start') or session._smile_start is None:
                            session._smile_start = time.time()
                        elapsed = time.time() - session._smile_start
                        req_hold = challenge.params.get("hold_seconds", 1.5)
                        if elapsed >= req_hold and session.action_server_count == 0:
                            session.action_server_count = 1
                            await websocket.send_json({
                                "type": "action_progress_ack",
                                "server_count": 1,
                                "target_count": 1
                            })
                    else:
                        session._smile_start = None

                # 3. EYEBROW_RAISE: CNN Expression Classifier every 10 frames + landmark ratio check
                elif action_type == ActionTypeEnum.EYEBROW_RAISE:
                    brow_detected = False
                    
                    # Mobile-optimized CNN check every 10 frames on face crop
                    if session.frame_counter % 10 == 0:
                        face_crop = img_bgr
                        if bbox is not None and len(bbox) >= 4:
                            bx, by, bw, bh = bbox
                            face_crop = img_bgr[max(0, by):min(img_bgr.shape[0], by+bh), max(0, bx):min(img_bgr.shape[1], bx+bw)]
                        cnn_brow, _ = expression_cnn.is_eyebrow_raised(face_crop, threshold=0.48)
                        if cnn_brow:
                            brow_detected = True

                    # Complementary vertical distance ratio check
                    if landmarks and not brow_detected:
                        if not hasattr(session, '_eyebrow_baselines'):
                            session._eyebrow_baselines = []
                        _, dist = ActionChallengeEngine.compute_eyebrow_raise(landmarks, None)
                        if len(session._eyebrow_baselines) < 5:
                            session._eyebrow_baselines.append(dist)
                        else:
                            base_dist = float(np.mean(session._eyebrow_baselines))
                            ratio, _ = ActionChallengeEngine.compute_eyebrow_raise(landmarks, base_dist)
                            if ratio >= challenge.params.get("ratio_threshold", 1.25):
                                brow_detected = True

                    if brow_detected and session.action_server_count == 0:
                        session.action_server_count = 1
                        await websocket.send_json({
                            "type": "action_progress_ack",
                            "server_count": 1,
                            "target_count": 1
                        })

                # 4. HEAD_TURN: Yaw rotation angle check
                elif action_type == ActionTypeEnum.HEAD_TURN and landmarks:
                    yaw = ActionChallengeEngine.compute_head_yaw(landmarks)
                    direction = challenge.params.get("direction", "LEFT")
                    thresh = challenge.params.get("yaw_threshold_deg", 18.0)
                    turned = (direction == "LEFT" and yaw < -thresh) or (direction == "RIGHT" and yaw > thresh)
                    if turned and session.action_server_count == 0:
                        session.action_server_count = 1
                        await websocket.send_json({
                            "type": "action_progress_ack",
                            "server_count": 1,
                            "target_count": 1
                        })

        except Exception as e:
            pass

    @staticmethod
    async def _orchestrate_pipeline(websocket: WebSocket, session: SessionState):
        """Sequential phase state machine orchestration."""
        try:
            # Phase 2: Environment Gate
            session.current_phase = PhaseEnum.ENVIRONMENT_CHECK
            await websocket.send_json({
                "type": "phase_change",
                "phase": PhaseEnum.ENVIRONMENT_CHECK,
                "title": "Phase 2: Client Environment & Integrity Gate",
                "instruction": "Inspecting browser environment, camera driver, and frame delivery timing..."
            })

            # Wait for the client's env_data rather than sleeping a fixed 2.5s.
            # Jitter sampling needs ~30 video frames, which is ~2s on a 15fps
            # camera — a blind sleep let the gate advance first, so a block
            # landed in the middle of the flash phase instead of here.
            try:
                await asyncio.wait_for(session.env_received.wait(), timeout=8.0)
            except asyncio.TimeoutError:
                # Fails closed: no environment report means the gate is unproven.
                session.telemetry["automation"] = {
                    "status": "FAILED",
                    "display": "NO ENVIRONMENT REPORT",
                    "value": 0.0,
                    "details": {"reason": "client sent no env_data within 8s"}
                }
                await websocket.send_json({
                    "type": "telemetry",
                    "check": "automation",
                    "status": "FAILED",
                    "display": "NO ENVIRONMENT REPORT",
                    "details": {"reason": "client sent no env_data within 8s"}
                })

            if session.is_blocked:
                return

            # Phase 3: Optical Flash-PAD Challenge (400ms Synchronized Sequence)
            session.current_phase = PhaseEnum.FLASH_PAD
            flash_config = FlashPADAnalyzer.generate_sequence(num_colors=4, duration_ms=400)
            session.flash_config = flash_config
            
            await websocket.send_json({
                "type": "phase_change",
                "phase": PhaseEnum.FLASH_PAD,
                "title": "Phase 3: Optical Flash-PAD Liveness",
                "instruction": "Screen flashing synchronized color sequence. Measuring skin chromaticity reflections...",
                "config": {
                    "colors": flash_config.colors,
                    "duration_ms": flash_config.duration_ms,
                    "delay_before_ms": flash_config.delay_before_ms
                }
            })

            # Wait for flash sequence to complete on client (400ms delay + 4*400ms + 300ms buffer = 2.3s)
            total_flash_wait = (flash_config.delay_before_ms + len(flash_config.colors) * flash_config.duration_ms + 300) / 1000.0
            await asyncio.sleep(total_flash_wait)

            # Analyze skin reflections from frames recorded during FLASH_PAD phase
            flash_frames = [f for f in session.frame_buffer if f.phase == PhaseEnum.FLASH_PAD]
            if len(flash_frames) < 3:
                flash_frames = session.get_recent_frames(count=16)

            observed_rgbs = []
            frames_with_face = 0
            for f in flash_frames:
                skin_roi = FlashPADAnalyzer.extract_skin_roi(f.image_bgr, f.face_bbox)
                if skin_roi.size > 0:
                    frames_with_face += 1
                    mean_bgr = cv2.mean(skin_roi)[:3]
                    observed_rgbs.append((mean_bgr[2], mean_bgr[1], mean_bgr[0])) # RGB

            flash_passed, corr_score, flash_details = FlashPADAnalyzer.compute_chromaticity_correlation(
                flash_config.colors,
                observed_rgbs
            )
            
            # Say which of the two failure modes happened. "no face was visible"
            # and "the reflection did not track the sequence" are different
            # problems and the operator should not have to guess which.
            flash_details = {
                **flash_details,
                "frames_examined": len(flash_frames),
                "frames_with_face": frames_with_face,
            }
            if not flash_passed and frames_with_face < 3:
                pct_display = f"NO FACE VISIBLE ({frames_with_face}/{len(flash_frames)} frames)"
            elif flash_passed:
                pct_display = f"{corr_score * 100:.1f}% MATCH"
            else:
                pct_display = "MISMATCH (UNAUTHENTIC REFLECTION)"
            session.telemetry["flash_pad"] = {
                "status": "PASSED" if flash_passed else "FAILED",
                "display": pct_display,
                "value": corr_score,
                "details": flash_details
            }
            await websocket.send_json({
                "type": "telemetry",
                "check": "flash_pad",
                "status": session.telemetry["flash_pad"]["status"],
                "display": pct_display,
                "details": flash_details
            })

            # Phase 4: Dynamic Action Challenge (CNN + Landmarks)
            session.current_phase = PhaseEnum.ACTION_CHALLENGE
            action_config = ActionChallengeEngine.generate_challenge()
            session.action_config = action_config
            session.action_server_count = 0
            session.action_client_count = 0

            await websocket.send_json({
                "type": "phase_change",
                "phase": PhaseEnum.ACTION_CHALLENGE,
                "title": "Phase 4: Dynamic Action Challenge",
                "instruction": action_config.prompt,
                "challenge": {
                    "action": action_config.action,
                    "prompt": action_config.prompt,
                    "params": action_config.params,
                    "timeout_s": action_config.timeout_s
                }
            })

            # Wait for action completion with dynamic polling (up to 6.5s)
            target = action_config.params.get("target_count", 1)
            timeout_limit = 6.5
            start_time = time.time()
            
            while (time.time() - start_time) < timeout_limit:
                if action_config.action == ActionTypeEnum.BLINK_N:
                    if session.action_server_count >= target or session.action_client_count >= target:
                        break
                else:
                    if session.action_server_count >= 1 or session.action_client_count >= 1:
                        break
                await asyncio.sleep(0.2)

            # Evaluate pass/fail authentically based on user performance
            if action_config.action == ActionTypeEnum.BLINK_N:
                action_passed = (session.action_server_count >= target) or (session.action_client_count >= target)
                actual_count = max(session.action_server_count, session.action_client_count)
            else:
                action_passed = (session.action_server_count >= 1) or (session.action_client_count >= 1)
                actual_count = 1 if action_passed else 0

            action_status_text = "PASSED" if action_passed else "FAILED"
            session.telemetry["action_challenge"] = {
                "status": "PASSED" if action_passed else "FAILED",
                "display": f"{action_status_text} ({action_config.prompt})",
                "value": 1.0 if action_passed else 0.0,
                "details": {
                    "prompt": action_config.prompt,
                    "action": action_config.action,
                    "target_count": target,
                    "server_count": session.action_server_count,
                    "client_count": session.action_client_count,
                    "completed": action_passed
                }
            }
            await websocket.send_json({
                "type": "telemetry",
                "check": "action_challenge",
                "status": session.telemetry["action_challenge"]["status"],
                "display": session.telemetry["action_challenge"]["display"],
                "details": session.telemetry["action_challenge"]["details"]
            })

            # Phase 5: Deepfake Forensics (Sobel, 2D FFT, CNN Classifier)
            session.current_phase = PhaseEnum.FORENSICS
            await websocket.send_json({
                "type": "phase_change",
                "phase": PhaseEnum.FORENSICS,
                "title": "Phase 5: Forensic AI Analysis",
                "instruction": "Computing Sobel boundary gradients and 2D FFT spectral decomposition..."
            })

            best_frame = session.get_best_face_frame()
            best_img = best_frame.image_bgr if best_frame else None
            best_bbox = best_frame.face_bbox if best_frame else None

            # 1. Sobel Boundary Residual
            sobel_score, sobel_status, sobel_details = forensics_engine.compute_sobel_residual(best_img, best_bbox)
            session.telemetry["sobel_residual"] = {
                "status": "PASSED" if sobel_score < 0.20 else "WARNING",
                "display": f"{sobel_score:.2f} ({sobel_status})",
                "value": sobel_score,
                "details": sobel_details
            }
            await websocket.send_json({
                "type": "telemetry",
                "check": "sobel_residual",
                "status": session.telemetry["sobel_residual"]["status"],
                "display": session.telemetry["sobel_residual"]["display"],
                "details": sobel_details
            })
            await asyncio.sleep(0.6)

            # 2. 2D FFT Periodic Grid Anomaly
            fft_score, fft_status, fft_details = forensics_engine.compute_fft_anomaly(best_img)
            session.telemetry["fft_grid"] = {
                "status": "PASSED" if fft_score < 0.20 else "WARNING",
                "display": fft_status,
                "value": fft_score,
                "details": fft_details
            }
            await websocket.send_json({
                "type": "telemetry",
                "check": "fft_grid",
                "status": session.telemetry["fft_grid"]["status"],
                "display": fft_status,
                "details": fft_details
            })
            await asyncio.sleep(0.6)

            # 3. AI Fake Classifier Probability Score
            recent_imgs = [f.image_bgr for f in session.get_recent_frames(5)]
            fake_score, fake_status, fake_details = forensics_engine.classify_deepfake(
                recent_imgs,
                sobel_score,
                fft_score
            )
            session.telemetry["ai_fake_score"] = {
                "status": "PASSED" if fake_score < 0.20 else "FAILED",
                "display": f"{fake_score:.2f} (LOW RISK)" if fake_score < 0.20 else f"{fake_score:.2f} (HIGH RISK)",
                "value": fake_score,
                "details": fake_details
            }
            await websocket.send_json({
                "type": "telemetry",
                "check": "ai_fake_score",
                "status": session.telemetry["ai_fake_score"]["status"],
                "display": session.telemetry["ai_fake_score"]["display"],
                "details": fake_details
            })
            await asyncio.sleep(0.6)

            # Phase 6: Identity Matching (1:1 ArcFace Cosine Similarity)
            session.current_phase = PhaseEnum.FACE_MATCH
            await websocket.send_json({
                "type": "phase_change",
                "phase": PhaseEnum.FACE_MATCH,
                "title": "Phase 6: 1:1 Identity Matching",
                "instruction": "Matching live face embedding against ID document baseline..."
            })

            live_embedding = face_matcher.generate_embedding(best_img) if best_img is not None else None
            similarity = 0.0
            if session.id_embedding is not None and live_embedding is not None:
                similarity = face_matcher.compute_cosine_similarity(session.id_embedding, live_embedding)

            sim_passed = similarity >= 0.85
            sim_display = f"{similarity * 100:.1f}% SIMILARITY"
            session.telemetry["face_match"] = {
                "status": "PASSED" if sim_passed else "FAILED",
                "display": sim_display,
                "value": similarity,
                "details": {"threshold": 0.85, "cosine_similarity": round(similarity, 4)}
            }
            await websocket.send_json({
                "type": "telemetry",
                "check": "face_match",
                "status": session.telemetry["face_match"]["status"],
                "display": sim_display,
                "details": {"cosine_similarity": round(similarity, 4)}
            })
            await asyncio.sleep(1.0)

            # Phase 7: Final Verdict Engine
            session.current_phase = PhaseEnum.VERDICT
            report = verdict_engine.evaluate(session)
            
            await websocket.send_json({
                "type": "verdict",
                "result": report.result,
                "risk_level": report.risk_level,
                "summary": report.summary_message,
                "fraud_flags": report.fraud_flags,
                "duration_seconds": report.duration_seconds,
                "report": report.model_dump()
            })

        except asyncio.CancelledError:
            pass
        except Exception as e:
            print(f"[Orchestrator] Error: {e}")
            await websocket.send_json({
                "type": "error",
                "message": f"Pipeline processing error: {str(e)}"
            })
