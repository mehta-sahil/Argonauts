import React, { useEffect, useRef } from 'react';

export const FaceMeshOverlay = ({ landmarks, width = 640, height = 480 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    if (!landmarks || landmarks.length === 0) return;

    // Draw landmark points
    ctx.fillStyle = '#00FFFF';
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
    ctx.lineWidth = 1;

    // Draw eye rings
    const leftEye = [33, 160, 158, 133, 153, 144, 33];
    const rightEye = [362, 385, 387, 263, 373, 380, 362];
    const lips = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 61];

    const drawLoop = (indices, color) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      indices.forEach((idx, i) => {
        if (landmarks[idx]) {
          const x = landmarks[idx].x * width;
          const y = landmarks[idx].y * height;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    };

    drawLoop(leftEye, '#10B981');
    drawLoop(rightEye, '#10B981');
    drawLoop(lips, '#F79E1B');

    // Draw key subset of landmarks
    for (let i = 0; i < landmarks.length; i += 4) {
      const pt = landmarks[i];
      const x = pt.x * width;
      const y = pt.y * height;

      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [landmarks, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
};
