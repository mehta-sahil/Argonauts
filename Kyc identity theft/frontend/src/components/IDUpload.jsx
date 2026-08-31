import React, { useState, useRef } from 'react';
import { Upload, FileCheck, AlertCircle, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

export const IDUpload = ({ onIDUploaded, isSessionActive }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [faceCrop, setFaceCrop] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please upload a valid JPEG, PNG, or WebP image of an ID card.');
      return;
    }

    setError(null);
    setIsUploading(true);

    // Create local object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Same-origin relative path. In dev, Vite proxies /api to the backend
      // (see vite.config.js); in production CloudFront routes /api/* to the ALB.
      // VITE_API_BASE can point at a backend on another origin if needed.
      const apiBase = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');
      const response = await fetch(`${apiBase}/api/upload-id`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to detect a face on the ID document.');
      }

      const data = await response.json();
      setFaceCrop(data.face_crop_base64);
      setSessionId(data.session_id);
      
      if (onIDUploaded) {
        onIDUploaded({
          sessionId: data.session_id,
          faceCropBase64: data.face_crop_base64,
          confidence: data.confidence
        });
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Error communicating with the verification server.');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const createSyntheticSampleID = () => {
    // Generate a clean demo canvas ID photo for instant zero-friction judging
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');

    // Background card gradient
    const grad = ctx.createLinearGradient(0, 0, 480, 320);
    grad.addColorStop(0, '#16213E');
    grad.addColorStop(1, '#0F0F23');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 480, 320);

    // Border
    ctx.strokeStyle = '#2E3856';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, 464, 304);

    // Mastercard Header
    ctx.fillStyle = '#EB001B';
    ctx.beginPath();
    ctx.arc(420, 40, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F79E1B';
    ctx.beginPath();
    ctx.arc(442, 40, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText('IDENTITY CARD', 30, 45);

    // Face Silhouette / Photo Box
    ctx.fillStyle = '#1F2440';
    ctx.fillRect(30, 80, 140, 180);
    ctx.strokeStyle = '#F79E1B';
    ctx.strokeRect(30, 80, 140, 180);

    // Draw stylized face
    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.arc(100, 150, 40, 0, Math.PI * 2); // Head
    ctx.fill();
    ctx.beginPath();
    ctx.arc(100, 245, 60, Math.PI, 0); // Shoulders
    ctx.fill();

    // Eyes and mouth for detector
    ctx.fillStyle = '#0F0F23';
    ctx.beginPath();
    ctx.arc(88, 145, 4, 0, Math.PI * 2);
    ctx.arc(112, 145, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(100, 165, 10, 0, Math.PI);
    ctx.stroke();

    // Text details
    ctx.fillStyle = '#94A3B8';
    ctx.font = '12px "Fira Code", monospace';
    ctx.fillText('NAME: JAINIL G.', 190, 110);
    ctx.fillText('ID NO: MC-8924-X99', 190, 145);
    ctx.fillText('DOB:   1998-04-12', 190, 180);
    ctx.fillText('CLASS: TRUSTED CITIZEN', 190, 215);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'demo_id_card.png', { type: 'image/png' });
        handleFileSelect(file);
      }
    }, 'image/png');
  };

  return (
    <div className="bg-navy-card/90 rounded-2xl border border-navy-border p-4 sm:p-6 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-mc-red/10 border border-mc-red/30 flex items-center justify-center text-mc-red font-mono font-bold text-sm">
            01
          </div>
          <div>
            <h2 className="text-base font-bold text-white">ID Document Baseline</h2>
            <p className="text-xs text-slate-400 font-mono">Phase 1: Biometric Reference Extraction</p>
          </div>
        </div>

        {!faceCrop && (
          <button
            type="button"
            onClick={createSyntheticSampleID}
            className="flex items-center space-x-1.5 text-xs bg-navy-light hover:bg-navy-border text-mc-amber hover:text-white px-3 py-1.5 rounded-lg border border-mc-amber/30 transition-all cursor-pointer font-mono"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Sample ID</span>
          </button>
        )}
      </div>

      {!faceCrop ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileSelect(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[200px] sm:min-h-[220px] ${
            isDragging 
              ? 'border-mc-amber bg-mc-amber/10 scale-[1.01]' 
              : 'border-navy-border hover:border-slate-500 bg-navy-dark/60 hover:bg-navy-light/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />

          <div className="w-14 h-14 rounded-2xl bg-navy-light border border-navy-border flex items-center justify-center mb-3 text-slate-300 shadow-inner group-hover:scale-105 transition-transform">
            {isUploading ? (
              <div className="w-6 h-6 border-2 border-mc-amber border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-7 h-7 text-mc-amber" />
            )}
          </div>

          <p className="text-sm font-semibold text-slate-200 mb-1">
            {isUploading ? 'Extracting Facial ArcFace Embedding...' : 'Drop ID document photo here or click to browse'}
          </p>
          <p className="text-xs text-slate-400 font-mono">
            Supports Driver's License, Passport, Aadhaar (JPG, PNG, WebP)
          </p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-navy-dark/90 border border-emerald-500/30">
          <div className="flex items-center space-x-4">
            {/* Cropped Face Preview */}
            <div className="relative">
              <img
                src={`data:image/jpeg;base64,${faceCrop}`}
                alt="Extracted Face Reference"
                className="w-20 h-20 rounded-xl object-cover border-2 border-emerald-500/80 shadow-lg shadow-emerald-500/20"
              />
              <span className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-navy-dark p-0.5 rounded-full">
                <FileCheck className="w-4 h-4" />
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-emerald-400">Baseline Face Extracted</span>
                <span className="bg-emerald-950 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-800">
                  512-d EMBEDDING
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Session ID: <span className="text-slate-300">{sessionId?.substring(0, 13)}...</span>
              </p>
              <button
                type="button"
                onClick={() => {
                  setFaceCrop(null);
                  setPreviewUrl(null);
                  setSessionId(null);
                }}
                disabled={isSessionActive}
                className="text-xs text-mc-amber hover:underline font-mono mt-1 cursor-pointer disabled:opacity-50"
              >
                Change document
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-center space-x-2 text-xs text-mc-red bg-mc-red/10 border border-mc-red/30 p-2.5 rounded-lg font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
