'use client';

import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Volume1,
  VolumeX,
  Repeat,
  Music,
  Plus,
  Minus,
  Sparkles,
  Radio,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMusic } from '@/lib/MusicContext';

export const RightSidebarMusicPlayer: React.FC = () => {
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    isRepeat,
    autoplayBlocked,
    togglePlay,
    restartSong,
    seekMusic,
    updateVolume,
    increaseVolume,
    decreaseVolume,
    toggleRepeat,
    formatTime,
  } = useMusic();

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    seekMusic(targetTime);
  };

  return (
    <div className="bg-gradient-to-b from-surface-container-lowest via-surface-container/95 to-surface-container-lowest rounded-2xl border border-primary/25 p-4 shadow-card relative overflow-hidden group">
      {/* Ambient background glow when playing */}
      {isPlaying && (
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-social-blue/15 to-purple-500/10 rounded-2xl blur-sm pointer-events-none -z-10 animate-pulse" />
      )}

      {/* Top Bar: Title & Cosmic Badge */}
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-outline-variant/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary text-on-primary shadow-xs">
            <Radio className={cn('w-4 h-4', isPlaying && 'animate-spin')} />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-on-surface leading-tight">
              Website Theme
            </h3>
            <p className="text-[10px] text-on-surface-variant font-medium">
              Official Galactic Soundtrack
            </p>
          </div>
        </div>

        {/* Repeat Setting Badge */}
        <button
          type="button"
          onClick={toggleRepeat}
          title={isRepeat ? 'Repeat Setting: ON (Song loops forever across all pages)' : 'Repeat Setting: OFF'}
          className={cn(
            'flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all shadow-2xs',
            isRepeat
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              : 'bg-surface-variant text-on-surface-variant/60 border border-outline-variant/30 hover:text-on-surface'
          )}
        >
          <Repeat className={cn('w-3 h-3', isRepeat && 'text-emerald-500')} />
          <span>{isRepeat ? 'Repeat: ON' : 'Repeat: OFF'}</span>
        </button>
      </div>

      {/* Track Details Card */}
      <div className="flex items-center gap-3 mb-3 p-2.5 bg-surface-container rounded-xl border border-outline-variant/30">
        <div
          className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 shadow-sm relative overflow-hidden',
            isPlaying
              ? 'bg-gradient-to-br from-primary to-social-blue text-white ring-2 ring-primary/40'
              : 'bg-surface-container-highest text-on-surface-variant'
          )}
        >
          <Music className={cn('w-5 h-5 transition-transform duration-700', isPlaying && 'scale-110')} />
          {isPlaying && (
            <span className="absolute inset-0 bg-white/15 animate-ping rounded-xl pointer-events-none" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-heading font-bold text-sm text-on-surface truncate">
              Forever Young
            </h4>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-primary/15 text-primary border border-primary/25">
              <Sparkles className="w-2.5 h-2.5" />
              Theme
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant truncate font-medium mt-0.5">
            Alphaville • Interstellers Anthem
          </p>
        </div>
      </div>

      {/* Autoplay Status / Equalizer */}
      <div className="flex items-center justify-between text-[11px] text-on-surface-variant mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <div className="flex items-end gap-0.5 h-3">
            <span
              className={cn(
                'w-1 rounded-full bg-primary transition-all duration-300',
                isPlaying ? 'h-3 animate-pulse' : 'h-1'
              )}
            />
            <span
              className={cn(
                'w-1 rounded-full bg-social-blue transition-all duration-300',
                isPlaying ? 'h-2 animate-bounce' : 'h-1'
              )}
            />
            <span
              className={cn(
                'w-1 rounded-full bg-purple-500 transition-all duration-300',
                isPlaying ? 'h-3.5 animate-pulse' : 'h-1'
              )}
            />
            <span
              className={cn(
                'w-1 rounded-full bg-emerald-500 transition-all duration-300',
                isPlaying ? 'h-2 animate-bounce' : 'h-1'
              )}
            />
          </div>
          <span className="font-medium text-[10px]">
            {isPlaying ? 'Playing Across Galaxy' : autoplayBlocked ? 'Tap Play or Scroll' : 'Theme Paused'}
          </span>
        </div>

        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
          Persistent ∞
        </span>
      </div>

      {/* Scrubber Progress Slider */}
      <div className="space-y-1 mb-3">
        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
          />
        </div>
        <div className="flex justify-between items-center text-[10px] font-mono tabular-nums text-on-surface-variant px-0.5">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Primary Playback Controls */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {/* Restart Track */}
        <button
          type="button"
          onClick={restartSong}
          className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors active:scale-95"
          title="Restart from beginning"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Big Central Play / Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95',
            isPlaying
              ? 'bg-primary text-on-primary hover:bg-primary-hover shadow-primary/20'
              : 'bg-gradient-to-r from-primary via-indigo-600 to-social-blue text-white hover:opacity-95 shadow-md animate-pulse'
          )}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause Forever Young</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Play Forever Young</span>
            </>
          )}
        </button>

        {/* Repeat Toggle Button */}
        <button
          type="button"
          onClick={toggleRepeat}
          className={cn(
            'p-2 rounded-xl transition-all active:scale-95',
            isRepeat
              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'
          )}
          title={isRepeat ? 'Repeat is ON (Click to turn OFF)' : 'Repeat is OFF (Click to turn ON)'}
        >
          <Repeat className="w-4 h-4" />
        </button>
      </div>

      {/* Volume Section */}
      <div className="pt-2 border-t border-outline-variant/40">
        <div className="flex items-center justify-between text-[11px] mb-1.5 px-0.5">
          <span className="flex items-center gap-1.5 font-semibold text-on-surface-variant text-[10px]">
            {volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-error" />
            ) : volume < 0.5 ? (
              <Volume1 className="w-3.5 h-3.5 text-primary" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-primary" />
            )}
            <span>Theme Volume</span>
          </span>
          <span className="font-mono font-bold text-primary text-[10px] tabular-nums">
            {Math.round(volume * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Reduce Volume Button */}
          <button
            type="button"
            onClick={decreaseVolume}
            disabled={volume <= 0}
            title="Reduce Volume (-10%)"
            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-surface-container-highest/80 hover:bg-surface-container-highest active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-on-surface border border-outline-variant/40 transition-all"
          >
            <Minus className="w-3.5 h-3.5 text-on-surface-variant" />
            <span className="text-[11px]">Vol -</span>
          </button>

          {/* Volume Slider */}
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => updateVolume(parseFloat(e.target.value))}
            className="w-20 h-1 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
            title={`Volume: ${Math.round(volume * 100)}%`}
          />

          {/* Increase Volume Button */}
          <button
            type="button"
            onClick={increaseVolume}
            disabled={volume >= 1}
            title="Increase Volume (+10%)"
            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-primary/15 hover:bg-primary/25 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-primary border border-primary/30 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-[11px]">Vol +</span>
          </button>
        </div>
      </div>
    </div>
  );
};
