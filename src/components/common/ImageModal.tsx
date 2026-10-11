'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, X, ExternalLink, Download, Lock, Maximize2 } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  src: string;
  alt?: string;
  title?: string;
  authorName?: string;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  src,
  alt = 'Photo view',
  title,
  authorName,
  onClose,
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleReset();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, scale]);

  if (!isOpen || !src) return null;

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setScale((prev) => Math.min(prev + 0.25, 4));
    } else {
      setScale((prev) => {
        const next = Math.max(prev - 0.25, 1);
        if (next === 1) setPosition({ x: 0, y: 0 });
        return next;
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = src;
    a.download = `interstellers_photo_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/92 backdrop-blur-lg flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-200 select-none overflow-hidden"
      onClick={onClose}
    >
      {/* Top Header Bar */}
      <div
        className="flex items-center justify-between z-10 w-full max-w-6xl mx-auto bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 text-white">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>High-Res Photo View</span>
          </div>
          {authorName && (
            <span className="text-xs text-slate-300 font-medium hidden sm:inline-block">
              Posted by <strong className="text-white">{authorName}</strong>
            </span>
          )}
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 1}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 transition-all"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-emerald-400 font-mono font-bold px-2 py-1 bg-black/60 rounded-lg border border-white/10 min-w-[52px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={scale >= 4}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 transition-all"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all text-xs font-semibold px-3 hidden sm:flex items-center gap-1"
            title="Reset Zoom (0)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          <div className="h-4 w-px bg-white/20 mx-1" />

          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
            title="Open Original Image in New Tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={handleDownload}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
            title="Download Image"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white transition-all ml-1"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden my-2 relative cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0, 0, 1)',
          }}
          className="max-h-[85vh] max-w-[95vw] object-contain rounded-xl shadow-2xl transition-all"
          draggable={false}
        />
      </div>

      {/* Footer Info / Controls Guide */}
      <div
        className="w-full max-w-xl mx-auto text-center z-10 bg-black/50 backdrop-blur-md py-2 px-4 rounded-xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[11px] text-slate-300 flex items-center justify-center gap-3">
          <span>🔍 <strong>Scroll Wheel / Buttons</strong> to zoom</span>
          <span>•</span>
          <span>✋ <strong>Click & Drag</strong> to pan photo</span>
          <span>•</span>
          <span>Press <strong>ESC</strong> to exit</span>
        </p>
      </div>
    </div>
  );
};
