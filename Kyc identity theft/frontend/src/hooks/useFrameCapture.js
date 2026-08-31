import { useRef, useCallback } from 'react';

export const useFrameCapture = () => {
  const canvasRef = useRef(null);

  const captureFrame = useCallback((videoElement, quality = 0.7) => {
    if (!videoElement || videoElement.readyState < 2) {
      return null;
    }

    if (!canvasRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      canvasRef.current = canvas;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Draw current video frame to canvas
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Export base64 JPEG
    const base64Data = canvas.toDataURL('image/jpeg', quality);
    return base64Data;
  }, []);

  return {
    captureFrame
  };
};
