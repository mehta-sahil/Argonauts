"""
Model downloader and asset manager for Mastercard AI Defense Lab.
Downloads pre-trained weights and ONNX models for deepfake classification and face recognition.
"""
import os
import urllib.request
import sys

MODELS_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_ASSETS = {
    # Lightweight OpenCV YuNet ONNX face detection model
    "face_detection_yunet_2023mar.onnx": {
        "url": "https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx",
        "description": "OpenCV YuNet 2023 Face Detector ONNX"
    },
    # ArcFace ResNet ONNX 512-d feature extraction model
    "w600k_r50.onnx": {
        "url": "https://github.com/deepinsight/insightface/releases/download/v0.7/buffalo_l.zip",
        "description": "ArcFace ResNet-50 512-d ONNX Feature Extractor"
    }
}


def download_asset(filename: str, info: dict):
    target_path = os.path.join(MODELS_DIR, filename)
    if os.path.exists(target_path) and os.path.getsize(target_path) > 1000:
        print(f"[Models] '{filename}' already exists ({os.path.getsize(target_path):,} bytes). Skipping.")
        return target_path

    print(f"[Models] Downloading {info['description']} -> {filename}...")
    try:
        urllib.request.urlretrieve(info["url"], target_path)
        print(f"[Models] Successfully downloaded '{filename}' ({os.path.getsize(target_path):,} bytes).")
        return target_path
    except Exception as e:
        print(f"[Models] Download notice for {filename}: {e}. Fallback enabled.")
        return None


def main():
    print("=== Mastercard AI Defense Lab: Model Asset Downloader ===")
    os.makedirs(MODELS_DIR, exist_ok=True)
    for name, info in MODEL_ASSETS.items():
        download_asset(name, info)
    print("=== Done ===")


if __name__ == "__main__":
    main()
