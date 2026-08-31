import { useState, useEffect, useRef, useCallback } from 'react';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';

export const useMediaPipe = (videoRef) => {
  const [isReady, setIsReady] = useState(false);
  const [landmarks, setLandmarks] = useState(null);
  const [ear, setEar] = useState(0.3);
  const [mar, setMar] = useState(0.2);
  const [yaw, setYaw] = useState(0.0);
  const [browRatio, setBrowRatio] = useState(1.0);
  const [neuralSmile, setNeuralSmile] = useState(0.0);
  const [neuralBrow, setNeuralBrow] = useState(0.0);
  const [actionCount, setActionCount] = useState(0);

  const landmarkerRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const blinkStateRef = useRef(false);
  const smileStartRef = useRef(null);
  const browBaselinesRef = useRef([]);

  // Initialize MediaPipe FaceLandmarker WASM with Neural Blendshapes
  useEffect(() => {
    let isMounted = true;

    const initMediaPipe = async () => {
      try {
        const fileset = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm"
        );
        
        const faceLandmarker = await FaceLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: true,
          minFaceDetectionConfidence: 0.5,
          minFacePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        if (isMounted) {
          landmarkerRef.current = faceLandmarker;
          setIsReady(true);
          console.log("[MediaPipe] FaceLandmarker & Neural Blendshapes successfully initialized.");
        }
      } catch (err) {
        console.warn("[MediaPipe] Initialization fallback note:", err);
        setIsReady(true); // Allow fallback operation
      }
    };

    initMediaPipe();

    return () => {
      isMounted = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  // Compute EAR (Eye Aspect Ratio)
  const computeEar = useCallback((pts) => {
    if (!pts || pts.length < 400) return 0.3;
    const calcEye = (indices) => {
      const p = indices.map(i => pts[i]);
      const v1 = Math.hypot(p[1].x - p[5].x, p[1].y - p[5].y);
      const v2 = Math.hypot(p[2].x - p[4].x, p[2].y - p[4].y);
      const h = Math.hypot(p[0].x - p[3].x, p[0].y - p[3].y);
      return h > 0 ? (v1 + v2) / (2.0 * h) : 0.3;
    };
    const lEar = calcEye([33, 160, 158, 133, 153, 144]);
    const rEar = calcEye([362, 385, 387, 263, 373, 380]);
    return (lEar + rEar) / 2.0;
  }, []);

  // Compute MAR (Mouth Aspect Ratio)
  const computeMar = useCallback((pts) => {
    if (!pts || pts.length < 300) return 0.2;
    const pUpper = pts[13];
    const pLower = pts[14];
    const pLeft = pts[61];
    const pRight = pts[291];
    const v = Math.hypot(pUpper.x - pLower.x, pUpper.y - pLower.y);
    const h = Math.hypot(pLeft.x - pRight.x, pLeft.y - pRight.y);
    return h > 0 ? v / h : 0.2;
  }, []);

  // Compute Head Yaw
  const computeYaw = useCallback((pts) => {
    if (!pts || pts.length < 455) return 0.0;
    const nose = pts[1].x;
    const lCheek = pts[234].x;
    const rCheek = pts[454].x;
    const width = rCheek - lCheek;
    if (Math.abs(width) < 1e-4) return 0.0;
    const mid = (lCheek + rCheek) / 2.0;
    return ((nose - mid) / (width / 2.0)) * 45.0;
  }, []);

  // Compute Eyebrow-to-Eye Distance
  const computeEyebrowDistance = useCallback((pts) => {
    if (!pts || pts.length < 387) return 0.05;
    const lBrow = pts[70].y;
    const lEye = pts[159].y;
    const rBrow = pts[300].y;
    const rEye = pts[386].y;
    return ((lEye - lBrow) + (rEye - rBrow)) / 2.0;
  }, []);

  // Main Landmark & Neural Blendshapes Tracking Loop
  const detectFrame = useCallback((activeAction, onActionEvent) => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !landmarkerRef.current) {
      return;
    }

    try {
      const now = performance.now();
      const results = landmarkerRef.current.detectForVideo(video, now);

      if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
        const facePts = results.faceLandmarks[0];
        setLandmarks(facePts);

        const curEar = computeEar(facePts);
        const curMar = computeMar(facePts);
        const curYaw = computeYaw(facePts);
        const curDist = computeEyebrowDistance(facePts);

        // Update eyebrow baseline
        if (browBaselinesRef.current.length < 10) {
          browBaselinesRef.current.push(curDist);
        }
        const baseDist = browBaselinesRef.current.reduce((a, b) => a + b, 0) / (browBaselinesRef.current.length || 1);
        const curRatio = baseDist > 1e-4 ? curDist / baseDist : 1.0;

        setEar(curEar);
        setMar(curMar);
        setYaw(curYaw);
        setBrowRatio(curRatio);

        // Neural Blendshapes activations from CNN
        let blendSmile = 0.0;
        let blendBrow = 0.0;
        if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
          const categories = results.faceBlendshapes[0].categories || [];
          const scoreMap = {};
          for (let i = 0; i < categories.length; i++) {
            scoreMap[categories[i].categoryName] = categories[i].score;
          }
          blendSmile = ((scoreMap['mouthSmileLeft'] || 0) + (scoreMap['mouthSmileRight'] || 0)) / 2.0;
          blendBrow = ((scoreMap['browInnerUp'] || 0) + (scoreMap['browOuterUpLeft'] || 0) + (scoreMap['browOuterUpRight'] || 0)) / 3.0;
          setNeuralSmile(blendSmile);
          setNeuralBrow(blendBrow);
        }

        // Action detection logic
        if (activeAction?.action === "BLINK_N") {
          if (curEar < 0.21) {
            blinkStateRef.current = true;
          } else if (curEar > 0.25 && blinkStateRef.current) {
            blinkStateRef.current = false;
            setActionCount(prev => {
              const next = prev + 1;
              if (onActionEvent) onActionEvent({ action: "BLINK", count: next });
              return next;
            });
          }
        } else if (activeAction?.action === "SMILE_HOLD") {
          // Trigger if CNN blendshape smile is active OR mouth aspect ratio expanded
          const isSmiling = blendSmile >= 0.45 || curMar > 0.55;
          if (isSmiling) {
            if (!smileStartRef.current) smileStartRef.current = Date.now();
            const elapsed = (Date.now() - smileStartRef.current) / 1000;
            if (elapsed >= (activeAction.params?.hold_seconds || 1.5)) {
              setActionCount(1);
              if (onActionEvent) onActionEvent({ action: "SMILE", count: 1 });
            }
          } else {
            smileStartRef.current = null;
          }
        } else if (activeAction?.action === "EYEBROW_RAISE") {
          // Trigger if CNN blendshape brow is active OR vertical distance ratio >= 1.22
          const isRaised = blendBrow >= 0.40 || curRatio >= 1.22;
          if (isRaised) {
            setActionCount(1);
            if (onActionEvent) onActionEvent({ action: "EYEBROW_RAISE", count: 1 });
          }
        } else if (activeAction?.action === "HEAD_TURN") {
          const dir = activeAction.params?.direction || "LEFT";
          const turned = (dir === "LEFT" && curYaw < -18) || (dir === "RIGHT" && curYaw > 18);
          if (turned) {
            setActionCount(1);
            if (onActionEvent) onActionEvent({ action: "HEAD_TURN", direction: dir });
          }
        }
      }
    } catch (e) {
      // frame detect catch
    }
  }, [videoRef, computeEar, computeMar, computeYaw, computeEyebrowDistance]);

  const resetCount = useCallback(() => {
    setActionCount(0);
    blinkStateRef.current = false;
    smileStartRef.current = null;
    browBaselinesRef.current = [];
  }, []);

  return {
    isReady,
    landmarks,
    ear,
    mar,
    yaw,
    browRatio,
    neuralSmile,
    neuralBrow,
    actionCount,
    detectFrame,
    resetCount
  };
};
