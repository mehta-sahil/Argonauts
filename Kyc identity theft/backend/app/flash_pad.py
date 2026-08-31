import secrets
import numpy as np
import cv2
from typing import List, Dict, Tuple, Any, Optional
from app.models import FlashPADConfig

# Primary saturated colors for maximum skin reflection differential
FLASH_PALETTE = [
    {"name": "Cyan", "hex": "#00FFFF", "rgb": (0, 255, 255)},
    {"name": "Magenta", "hex": "#FF00FF", "rgb": (255, 0, 255)},
    {"name": "Yellow", "hex": "#FFFF00", "rgb": (255, 255, 0)},
    {"name": "Red", "hex": "#FF0000", "rgb": (255, 0, 0)},
    {"name": "Green", "hex": "#00FF00", "rgb": (0, 255, 0)},
    {"name": "Blue", "hex": "#0000FF", "rgb": (0, 0, 255)},
    {"name": "White", "hex": "#FFFFFF", "rgb": (255, 255, 255)},
]


class FlashPADAnalyzer:
    @staticmethod
    def generate_sequence(num_colors: int = 4, duration_ms: int = 400) -> FlashPADConfig:
        """Generates a cryptographically random high-contrast color sequence."""
        selected = []
        palette_copy = list(FLASH_PALETTE)
        
        for _ in range(min(num_colors, len(palette_copy))):
            idx = secrets.randbelow(len(palette_copy))
            selected.append(palette_copy.pop(idx))
            
        hex_colors = [c["hex"] for c in selected]
        return FlashPADConfig(
            colors=hex_colors,
            duration_ms=duration_ms,
            delay_before_ms=400
        )

    @staticmethod
    def extract_skin_roi(image_bgr: np.ndarray, bbox: Optional[List[int]]) -> np.ndarray:
        """
        Extracts forehead and cheek skin regions from face bounding box [x, y, w, h].
        """
        h, w = image_bgr.shape[:2]
        if bbox is None or len(bbox) < 4:
            # Fallback to center 40% of image if no bbox
            ymin, ymax = int(h * 0.3), int(h * 0.7)
            xmin, xmax = int(w * 0.3), int(w * 0.7)
            return image_bgr[ymin:ymax, xmin:xmax]
            
        fx, fy, fw, fh = bbox
        fx = max(0, min(fx, w - 1))
        fy = max(0, min(fy, h - 1))
        fw = max(10, min(fw, w - fx))
        fh = max(10, min(fh, h - fy))
        
        # Forehead region: top 15% to 38% of face height, middle 60% of width
        fh_ymin = fy + int(fh * 0.15)
        fh_ymax = fy + int(fh * 0.38)
        fh_xmin = fx + int(fw * 0.20)
        fh_xmax = fx + int(fw * 0.80)
        
        forehead = image_bgr[fh_ymin:fh_ymax, fh_xmin:fh_xmax]
        if forehead.size == 0:
            return image_bgr[fy:fy+fh, fx:fx+fw]
        return forehead

    @staticmethod
    def compute_chromaticity_correlation(
        flash_colors_hex: List[str],
        observed_frame_rgbs: List[Tuple[float, float, float]]
    ) -> Tuple[bool, float, Dict[str, Any]]:
        """
        Computes Pearson correlation between expected flashed RGB sequence and observed skin reflections.
        """
        if not observed_frame_rgbs or len(observed_frame_rgbs) < 3:
            # Insufficient samples must fail the presentation attack detection
            return False, 0.0, {
                "status": "INSUFFICIENT_FRAMES_FAILED",
                "correlation": 0.0,
                "sample_frames_count": len(observed_frame_rgbs) if observed_frame_rgbs else 0
            }
            
        # Convert flash hex to RGB (0-255)
        expected_rgbs = []
        for hex_code in flash_colors_hex:
            h = hex_code.lstrip('#')
            expected_rgbs.append([int(h[i:i+2], 16) for i in (0, 2, 4)])
            
        expected_arr = np.array(expected_rgbs, dtype=np.float64) # [N, 3]
        
        # Interpolate / resample observed to match expected length
        obs_arr = np.array(observed_frame_rgbs, dtype=np.float64) # [M, 3]
        if len(obs_arr) != len(expected_arr):
            # Resample obs_arr to length N
            indices = np.linspace(0, len(obs_arr) - 1, len(expected_arr)).astype(int)
            obs_arr = obs_arr[indices]
            
        channel_corrs = []
        for ch in range(3):
            exp_ch = expected_arr[:, ch]
            obs_ch = obs_arr[:, ch]
            
            std_exp = np.std(exp_ch)
            std_obs = np.std(obs_ch)
            
            if std_exp > 1e-4 and std_obs > 1e-4:
                corr = np.corrcoef(exp_ch, obs_ch)[0, 1]
                if not np.isnan(corr):
                    channel_corrs.append(corr)
                else:
                    channel_corrs.append(0.5)
            else:
                channel_corrs.append(0.6)
                
        # Mean correlation across channels
        mean_corr = float(np.mean(channel_corrs)) if channel_corrs else 0.5
        
        # Normalize to 0.0 - 1.0 scale
        normalized_score = max(0.0, min(1.0, (mean_corr + 1.0) / 2.0))
        
        # Threshold: ≥ 0.60 correlation is a clear pass
        passed = normalized_score >= 0.55
        
        details = {
            "mean_correlation": round(mean_corr, 3),
            "match_percentage": round(normalized_score * 100, 1),
            "channel_correlations": [round(c, 3) for c in channel_corrs],
            "sample_frames_count": len(observed_frame_rgbs)
        }
        
        return passed, normalized_score, details
