'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WELCOME_PAGE_IMAGES } from '@/lib/welcomeImages';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';

/**
 * WelcomeImageBanner
 * Displays a full-width rotating banner of welcome images on the homepage.
 * - Auto-advances every 5 seconds
 * - Manual prev/next arrows
 * - Dot indicators
 * - Smooth crossfade transition
 * - Pauses on hover
 * - Falls back gracefully when no images are available
 */
export const WelcomeImageBanner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loaded, setLoaded] = useState<boolean[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const images = WELCOME_PAGE_IMAGES;
  const total = images.length;

  // Initialise the loaded state array
  useEffect(() => {
    setLoaded(new Array(total).fill(false));
  }, [total]);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(((index % total) + total) % total);
  }, [total]);

  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  // Auto-advance timer
  useEffect(() => {
    if (total <= 1 || isPaused) return;
    timerRef.current = setInterval(goNext, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [total, isPaused, goNext]);

  const markLoaded = (i: number) => {
    setLoaded((prev) => {
      const next = [...prev];
      next[i] = true;
      return next;
    });
  };

  // No images available
  if (total === 0) return null;

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden mb-5 group shadow-[0_0_40px_rgba(168,85,247,0.18)] border border-purple-500/20"
      style={{ aspectRatio: '16/7', maxHeight: '340px' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Image stack ── */}
      {images.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === currentIndex ? 1 : 0, zIndex: i === currentIndex ? 1 : 0 }}
          aria-hidden={i !== currentIndex}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={`Interstellers Welcome ${i + 1}`}
            onLoad={() => markLoaded(i)}
            onError={() => markLoaded(i)}
            className={`w-full h-full object-cover object-center transition-opacity duration-500 ${
              loaded[i] ? 'opacity-100' : 'opacity-0'
            }`}
            draggable={false}
          />

          {/* Gradient overlay for cosmic feel */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080918]/70 via-transparent to-[#080918]/20 pointer-events-none" />
        </div>
      ))}

      {/* ── Placeholder shimmer while first image loads ── */}
      {!loaded[currentIndex] && (
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-purple-950/60 animate-pulse flex items-center justify-center">
          <ImageOff className="w-10 h-10 text-purple-400/40" />
        </div>
      )}

      {/* ── Prev / Next arrows (appear on hover) ── */}
      {total > 1 && (
        <>
          <button
            onClick={goPrev}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goNext}
            aria-label="Next image"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* ── Dot indicators ── */}
      {total > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to image ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? 'w-6 h-2 bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}

      {/* ── Image counter (top-right) ── */}
      <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-[11px] font-semibold text-white/80">
        {currentIndex + 1} / {total}
      </div>
    </div>
  );
};
