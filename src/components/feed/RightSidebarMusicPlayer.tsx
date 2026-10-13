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
  SkipBack,
  SkipForward,
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
    currentSong,
    currentSongIndex,
    playlist,
    togglePlay,
    restartSong,
    seekMusic,
    updateVolume,
    increaseVolume,
    decreaseVolume,
    toggleRepeat,
    nextSong,
    prevSong,
    jumpToSong,
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
            <h4 className="font-heading font-black text-sm text-white truncate drop-shadow-sm max-w-[140px]">
              {currentSong.title}
            </h4>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-400/40 shrink-0">
              <Zap className="w-2.5 h-2.5 text-amber-300" />
              Live
            </span>
          </div>
          <p className="text-[11px] text-cyan-200/90 truncate font-semibold mt-0.5">
            {currentSong.artist}
          </p>
          <p className="text-[9px] text-slate-400 font-medium mt-0.5">
            Track {currentSongIndex + 1} of {playlist.length}
          </p>
        </div>
      </div>

      {/* Listening Frequency & Play Count Display */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* User's Personal Play Count */}
        <div
          className="flex items-center gap-2 p-2.5 bg-gradient-to-r from-purple-900/30 to-purple-800/20 rounded-xl border border-purple-500/30 relative overflow-hidden transition-all hover:border-purple-400"
          title={`You have listened ${userPlayCount} times (${currentUser?.name || 'Your Account'})`}
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
          className="flex items-center gap-2 p-2.5 bg-gradient-to-r from-cyan-900/30 to-cyan-800/20 rounded-xl border border-cyan-500/30 relative overflow-hidden transition-all hover:border-cyan-400"
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

      {/* Animated Waveform Visualizer + Status */}
      <div className="flex items-center justify-between text-[11px] mb-2 px-1">
        <div className="flex items-center gap-2">
          {/* 8-bar cosmic equalizer — only animates when playing */}
          <div className="flex items-end gap-[2px] h-4" aria-hidden="true" aria-label={isPlaying ? 'Music playing' : 'Music paused'}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <span
                key={i}
                className={cn(
                  'w-[3px] rounded-full origin-bottom',
                  i % 3 === 0 ? 'bg-cyan-400' : i % 3 === 1 ? 'bg-purple-400' : 'bg-pink-400',
                  isPlaying ? 'animate-visualizer-bar' : ''
                )}
                style={
                  isPlaying
                    ? {
                        height: '100%',
                        animationDelay: `${i * 0.085}s`,
                        animationDuration: `${0.45 + (i % 4) * 0.12}s`,
                      }
                    : { height: '2px' }
                }
              />
            ))}
          </div>
          <span className="font-bold text-[10px] text-cyan-200">
            {isPlaying
              ? 'Streaming Galaxy Resonance'
              : autoplayBlocked
              ? 'Tap Play or Scroll'
              : 'Theme Paused'}
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

      {/* Primary Playback Controls — prev / play-pause / next */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {/* Prev Track */}
        <button
          type="button"
          onClick={prevSong}
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all active:scale-95 border border-white/10"
          title="Previous song"
        >
          <SkipBack className="w-4 h-4" />
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
              <Pause className="w-4 h-4 fill-current shrink-0" />
              <span className="truncate max-w-[90px]">{currentSong.title}</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current ml-0.5 shrink-0" />
              <span className="truncate max-w-[90px]">{currentSong.title}</span>
            </>
          )}
        </button>

        {/* Next Track */}
        <button
          type="button"
          onClick={nextSong}
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all active:scale-95 border border-white/10"
          title="Next song"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Restart & Repeat row */}
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={restartSong}
          className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all active:scale-95 border border-white/10 text-xs font-semibold"
          title="Restart from beginning"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart</span>
        </button>

        <button
          type="button"
          onClick={toggleRepeat}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl transition-all active:scale-95 border text-xs font-semibold',
            isRepeat
              ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/50 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
              : 'bg-white/10 text-slate-300 hover:text-white border-white/10 hover:bg-white/20'
          )}
          title={isRepeat ? 'Repeat is ON (Click to turn OFF)' : 'Repeat is OFF (Click to turn ON)'}
        >
          <Repeat className="w-3.5 h-3.5" />
          <span>{isRepeat ? 'Loop On' : 'Loop Off'}</span>
        </button>
      </div>

      {/* Playlist mini-scroll */}
      <div className="mb-3 max-h-24 overflow-y-auto custom-scrollbar space-y-1">
        {playlist.slice(0, 6).map((song, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => jumpToSong(idx)}
            className={cn(
              'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all text-[10px]',
              idx === currentSongIndex
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/30'
                : 'hover:bg-white/10 text-slate-400 hover:text-slate-200'
            )}
          >
            <span className="shrink-0 w-4 text-right font-mono text-slate-500">{idx + 1}</span>
            <span className="truncate flex-1 font-medium">{song.title}</span>
            {idx === currentSongIndex && isPlaying && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
            )}
          </button>
        ))}
        {playlist.length > 6 && (
          <p className="text-center text-[9px] text-slate-500 py-1">+{playlist.length - 6} more tracks</p>
        )}
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
