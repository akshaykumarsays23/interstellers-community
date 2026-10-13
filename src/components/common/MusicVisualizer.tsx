'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface MusicVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
  className?: string;
}

/**
 * Pure CSS/JS animated waveform visualizer bars.
 * Only animates when isPlaying is true — no audio processing required.
 */
export const MusicVisualizer: React.FC<MusicVisualizerProps> = ({
  isPlaying,
  barCount = 4,
  className,
}) => {
  const bars = Array.from({ length: barCount });

  return (
    <span
      className={cn('inline-flex items-end gap-[2px] h-3', className)}
      aria-hidden="true"
      title={isPlaying ? 'Music playing' : 'Music paused'}
    >
      {bars.map((_, i) => (
        <span
          key={i}
          className={cn(
            'w-[3px] rounded-full bg-current origin-bottom transition-transform',
            isPlaying ? 'animate-visualizer-bar' : 'h-[3px]',
          )}
          style={
            isPlaying
              ? {
                  height: '100%',
                  animationDelay: `${i * 0.12}s`,
                  animationDuration: `${0.5 + (i % 3) * 0.15}s`,
                }
              : { height: '3px' }
          }
        />
      ))}
    </span>
  );
};
