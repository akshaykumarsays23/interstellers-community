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
  Headphones,
  Flame,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMusic } from '@/lib/MusicContext';
import { useApp } from '@/lib/store';

export const RightSidebarMusicPlayer: React.FC = () => {
  const { currentUser } = useApp();
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    isRepeat,
    autoplayBlocked,
    userPlayCount,
    totalPlayCount,
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
    <div className="relative rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-[#090b20] via-[#140c34] to-[#04182b] p-4 text-white shadow-[0_0_35px_rgba(139,92,246,0.35)] overflow-hidden group">
      {/* Cosmic Nebula Glow & Particles */}
      <div className="absolute -top-16 -left-16 w-40 h-40 bg-purple-600/30 rounded-full blur-2xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-cyan-500/25 rounded-full blur-2xl pointer-events-none -z-10 animate-pulse" />
      {isPlaying && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-pink-500/10 pointer-events-none -z-10 animate-pulse" />
      )}

      {/* Top Bar: Title & Cosmic Badge */}
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)]">
            <Radio className={cn('w-4 h-4', isPlaying && 'animate-spin')} />
          </div>
          <div>
            <h3 className="font-heading font-black text-xs sm:text-sm tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-200 to-pink-300 leading-tight">
              Cosmic Soundtrack
            </h3>
            <p className="text-[10px] text-cyan-200/80 font-medium flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
              Interstellar Anthem
            </p>
          </div>
        </div>

        {/* Repeat Setting Badge */}
        <button
          type="button"
          onClick={toggleRepeat}
          title={isRepeat ? 'Repeat Setting: ON (Loops endlessly)' : 'Repeat Setting: OFF'}
          className={cn(
            'flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all shadow-sm',
            isRepeat
              ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
              : 'bg-white/10 text-slate-300 border border-white/15 hover:text-white hover:bg-white/15'
          )}
        >
          <Repeat className={cn('w-3 h-3', isRepeat && 'text-emerald-300')} />
          <span>{isRepeat ? 'Loop: ON' : 'Loop: OFF'}</span>
        </button>
      </div>

      {/* Track Details Card */}
      <div className="flex items-center gap-3 mb-3 p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 shadow-md relative overflow-hidden',
            isPlaying
              ? 'bg-gradient-to-br from-cyan-500 via-purple-600 to-pink-500 text-white ring-2 ring-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
              : 'bg-slate-800 text-slate-400 border border-white/10'
          )}
        >
          <Music className={cn('w-6 h-6 transition-transform duration-700', isPlaying && 'scale-110')} />
          {isPlaying && (
            <span className="absolute inset-0 bg-white/20 animate-ping rounded-xl pointer-events-none" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-heading font-black text-sm text-white truncate drop-shadow-sm">
              Forever Young
            </h4>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-400/40">
              <Zap className="w-2.5 h-2.5 text-amber-300" />
              Theme
            </span>
          </div>
          <p className="text-[11px] text-cyan-200/90 truncate font-semibold mt-0.5">
            Alphaville • Interstellers Anthem
          </p>
        </div>
      </div>

      {/* Listening Frequency & Play Count Display */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* User's Personal Play Count */}
        <div
          className="flex items-center gap-2 p-2.5 bg-gradient-to-r from-purple-900/30 to-purple-800/20 rounded-xl border border-purple-500/30 relative overflow-hidden group/user-stat transition-all hover:border-purple-400"
          title={`You have listened to this song ${userPlayCount} times (${currentUser?.name || 'Your Account'})`}
        >
          <div className="w-8 h-8 rounded-lg bg-purple-500/25 text-purple-300 flex items-center justify-center shrink-0 shadow-inner">
            <Headphones className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-purple-200 font-semibold leading-none block truncate">
              Your Listens
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono font-black text-sm text-white tabular-nums">
                {userPlayCount}
              </span>
              <span className="text-[9px] text-purple-300/80 font-normal">
                {userPlayCount === 1 ? 'time' : 'times'}
              </span>
            </div>
          </div>
        </div>

        {/* Global Galaxy Total Play Count */}
        <div
          className="flex items-center gap-2 p-2.5 bg-gradient-to-r from-cyan-900/30 to-cyan-800/20 rounded-xl border border-cyan-500/30 relative overflow-hidden group/global-stat transition-all hover:border-cyan-400"
          title={`All galactic travelers combined have played this anthem ${totalPlayCount} times`}
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500/25 text-cyan-300 flex items-center justify-center shrink-0 shadow-inner">
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-cyan-200 font-semibold leading-none block truncate">
              Galaxy Plays
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono font-black text-sm text-cyan-200 tabular-nums">
                {totalPlayCount}
              </span>
              <span className="text-[9px] text-cyan-300/80 font-normal">
                total
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Autoplay Status & 8-Bar Cosmic Equalizer */}
      <div className="flex items-center justify-between text-[11px] mb-2 px-1">
        <div className="flex items-center gap-2">
          {/* Cosmic Multi-Bar Equalizer */}
          <div className="flex items-end gap-1 h-3.5">
            <span className={cn('w-1 rounded-full bg-cyan-400 transition-all duration-300', isPlaying ? 'h-3 animate-pulse' : 'h-1')} />
            <span className={cn('w-1 rounded-full bg-purple-400 transition-all duration-300', isPlaying ? 'h-2 animate-bounce' : 'h-1')} />
            <span className={cn('w-1 rounded-full bg-pink-400 transition-all duration-300', isPlaying ? 'h-3.5 animate-pulse' : 'h-1')} />
            <span className={cn('w-1 rounded-full bg-amber-400 transition-all duration-300', isPlaying ? 'h-2.5 animate-bounce' : 'h-1')} />
            <span className={cn('w-1 rounded-full bg-emerald-400 transition-all duration-300', isPlaying ? 'h-3 animate-pulse' : 'h-1')} />
          </div>
          <span className="font-bold text-[10px] text-cyan-200">
            {isPlaying ? 'Streaming Galaxy Resonance' : autoplayBlocked ? 'Tap Play or Scroll' : 'Theme Paused'}
          </span>
        </div>

        <span className="text-[10px] text-emerald-300 font-black bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/40">
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
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
          />
        </div>
        <div className="flex justify-between items-center text-[10px] font-mono tabular-nums text-slate-300 px-0.5 font-bold">
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
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all active:scale-95 border border-white/10"
          title="Restart from beginning"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Big Central Play / Pause Button with Cosmic Glow */}
        <button
          type="button"
          onClick={togglePlay}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-black text-xs transition-all shadow-md active:scale-95',
            isPlaying
              ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(217,70,239,0.5)] border border-pink-400/40'
              : 'bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 text-white hover:opacity-95 shadow-[0_0_20px_rgba(6,182,212,0.5)] border border-cyan-400/40 animate-pulse'
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
            'p-2.5 rounded-xl transition-all active:scale-95 border',
            isRepeat
              ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/50 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
              : 'bg-white/10 text-slate-300 hover:text-white border-white/10 hover:bg-white/20'
          )}
          title={isRepeat ? 'Repeat is ON (Click to turn OFF)' : 'Repeat is OFF (Click to turn ON)'}
        >
          <Repeat className="w-4 h-4" />
        </button>
      </div>

      {/* Volume Section */}
      <div className="pt-2.5 border-t border-cyan-500/20">
        <div className="flex items-center justify-between text-[11px] mb-1.5 px-0.5">
          <span className="flex items-center gap-1.5 font-bold text-cyan-200 text-[10px]">
            {volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            ) : volume < 0.5 ? (
              <Volume1 className="w-3.5 h-3.5 text-cyan-300" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-cyan-300" />
            )}
            <span>Cosmic Volume</span>
          </span>
          <span className="font-mono font-black text-cyan-300 text-[10px] tabular-nums">
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
            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-slate-200 border border-white/10 transition-all"
          >
            <Minus className="w-3.5 h-3.5 text-slate-300" />
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
            className="w-20 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            title={`Volume: ${Math.round(volume * 100)}%`}
          />

          {/* Increase Volume Button */}
          <button
            type="button"
            onClick={increaseVolume}
            disabled={volume >= 1}
            title="Increase Volume (+10%)"
            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-cyan-500/25 hover:bg-cyan-500/35 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-cyan-300 border border-cyan-400/40 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-[11px]">Vol +</span>
          </button>
        </div>
      </div>
    </div>
  );
};
