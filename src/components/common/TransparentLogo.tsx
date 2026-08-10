'use client';

import React, { useEffect, useRef, useState } from 'react';
import { INTERSTELLERS_LOGO } from '@/lib/data';

interface TransparentLogoProps {
  className?: string;
  alt?: string;
}

export const TransparentLogo: React.FC<TransparentLogoProps> = ({
  className = '',
  alt = 'Interstellers Logo',
}) => {
  const [transparentSrc, setTransparentSrc] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = INTERSTELLERS_LOGO;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Remove dark / black background pixels by setting alpha channel smoothly
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Calculate brightness
          const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
          
          if (brightness < 30) {
            // Pure / near black -> completely transparent
            data[i + 3] = 0;
          } else if (brightness < 60) {
            // Smooth edge feathering
            const alphaRatio = (brightness - 30) / 30;
            data[i + 3] = Math.round(data[i + 3] * alphaRatio);
          }
        }

        ctx.putImageData(imgData, 0, 0);
        setTransparentSrc(canvas.toDataURL('image/png'));
      } catch (err) {
        console.warn('Canvas transparency fallback:', err);
      }
    };
  }, []);

  return (
    <div className="relative inline-block select-none pointer-events-none">
      {/* Glow aura behind the transparent logo */}
      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-110 -z-10" />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={transparentSrc || INTERSTELLERS_LOGO}
        alt={alt}
        className={`${className} object-contain transition-all duration-300 ${
          !transparentSrc ? 'mix-blend-screen' : ''
        }`}
        style={{
          filter: 'drop-shadow(0 0 25px rgba(126, 87, 194, 0.45)) drop-shadow(0 0 50px rgba(79, 70, 229, 0.3))',
        }}
      />
    </div>
  );
};
