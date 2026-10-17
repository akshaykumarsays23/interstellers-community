'use client';

import React, { useEffect, useState } from 'react';
import { WELCOME_PAGE_IMAGES } from '@/lib/welcomeImages';
import { ChevronDown, ChevronUp, ImageOff, Rocket } from 'lucide-react';

interface WelcomeImageBannerProps {
  isBriefingExpanded: boolean;
  onToggleBriefing: () => void;
}

export const WelcomeImageBanner: React.FC<WelcomeImageBannerProps> = ({
  isBriefingExpanded,
  onToggleBriefing,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const images = WELCOME_PAGE_IMAGES;

  useEffect(() => {
    if (images.length === 0) return;

    setSelectedImageIndex(Math.floor(Math.random() * images.length));
  }, [images]);

  if (images.length === 0) return null;

  const selectedImage =
    selectedImageIndex === null ? null : images[selectedImageIndex];

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden mb-5 shadow-[0_0_40px_rgba(168,85,247,0.18)] border border-purple-500/20"
      style={{ aspectRatio: '16/9' }}
    >
      {selectedImage && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedImage}
            alt="Interstellers Welcome"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              console.error(`Failed to load welcome banner image: ${selectedImage}`);
              setImageLoaded(true);
            }}
            className={`absolute inset-0 w-full h-full object-contain object-center transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080918]/70 via-transparent to-[#080918]/20 pointer-events-none" />
        </>
      )}

      {!imageLoaded && (
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-purple-950/60 animate-pulse flex items-center justify-center">
          <ImageOff className="w-10 h-10 text-purple-400/40" />
        </div>
      )}

      <button
        type="button"
        onClick={onToggleBriefing}
        aria-expanded={isBriefingExpanded}
        aria-controls="galaxy-briefing"
        className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 flex items-center gap-1.5 whitespace-nowrap rounded-full border border-cyan-400/50 bg-slate-950/90 px-3.5 py-1.5 text-xs font-bold text-cyan-300 shadow-md backdrop-blur-md transition-all hover:border-cyan-300 hover:shadow-[0_0_15px_rgba(0,240,255,0.5)]"
      >
        <Rocket className="w-3.5 h-3.5 text-cyan-400" />
        <span>{isBriefingExpanded ? 'Hide Briefing' : 'Show Briefing'}</span>
        {isBriefingExpanded
          ? <ChevronUp className="w-3.5 h-3.5 text-cyan-300" />
          : <ChevronDown className="w-3.5 h-3.5 text-cyan-300" />}
      </button>
    </div>
  );
};
