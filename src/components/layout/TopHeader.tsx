'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Avatar } from '@/components/common/Avatar';
import { NotificationDropdown } from '@/components/common/NotificationDropdown';
import { INTERSTELLERS_LOGO } from '@/lib/data';
import { Bot, Moon, Sun, Sparkles, PlusCircle, Share2, Telescope, Package, Play, Pause, Music, SkipBack, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMusic } from '@/lib/MusicContext';
import { MusicVisualizer } from '@/components/common/MusicVisualizer';

interface TopHeaderProps {
  title?: string;
  subtitle?: string;
  onNewPostClick?: () => void;
  onTelescopeClick?: () => void;
  onCapsuleClick?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  subtitle,
  onNewPostClick,
  onTelescopeClick,
  onCapsuleClick,
}) => {
  const {
    currentUser,
    settings,
    updateSettings,
    isAIPanelOpen,
    setIsAIPanelOpen,
    setIsShareModalOpen,
    openUserProfile,
  } = useApp();
  const { isPlaying, togglePlay, userPlayCount, totalPlayCount, currentSong, nextSong, prevSong } = useMusic();

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'light' ? 'dark' : 'light';
    updateSettings({ theme: nextTheme });
  };

  return (
    <header className="bg-surface-bright/95 backdrop-blur-md sticky top-0 z-30 border-b border-cyan-500/30 shadow-[0_4px_25px_rgba(0,240,255,0.12)] px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
      {/* Left: Profile Pic / Mobile Brand or Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Left top profile pic button */}
        <button
          onClick={() => openUserProfile(currentUser)}
          className="flex items-center gap-2 p-0.5 rounded-full ring-2 ring-cyan-400/50 hover:ring-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.35)] transition-all active:scale-95 shrink-0"
          title={`View Profile: ${currentUser.name}`}
        >
          <Avatar
            src={currentUser.avatar}
            name={currentUser.name}
            status="online"
            showStatus
            size="sm"
          />
        </button>

        <Link href="/" className="md:hidden flex items-center gap-2 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={INTERSTELLERS_LOGO} alt="Interstellers" className="w-8 h-8 rounded-lg object-cover shadow-[0_0_12px_rgba(0,240,255,0.4)]" />
          <span className="font-heading font-extrabold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent text-base">Interstellers</span>
        </Link>

        {title && (
          <div className="hidden sm:block min-w-0">
            <h1 className="font-heading font-bold text-lg text-on-surface truncate tracking-tight">{title}</h1>
            {subtitle && <p className="text-xs text-on-surface-variant truncate">{subtitle}</p>}
          </div>
        )}
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Quick Theme Music Controller (Active Across All Tabs) */}
        <div
          className={cn(
            'flex items-center gap-0.5 rounded-full border shadow-xs transition-all',
            isPlaying
              ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
              : 'bg-surface-container border-cyan-500/20'
          )}
        >
          {/* Prev */}
          <button
            onClick={prevSong}
            className="p-1.5 text-on-surface-variant hover:text-cyan-300 transition-colors rounded-full"
            title="Previous song"
          >
            <SkipBack className="w-3 h-3" />
          </button>

          {/* Play / Pause */}
          <button
            onClick={togglePlay}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold transition-all"
            title={
              isPlaying
                ? `Pause • ${currentSong.title} — ${currentSong.artist}`
                : `Play • ${currentSong.title} — ${currentSong.artist}`
            }
          >
            {isPlaying ? (
              <Pause className="w-3 h-3 fill-current text-cyan-400" />
            ) : (
              <Play className="w-3 h-3 fill-current text-on-surface-variant ml-0.5" />
            )}
            {/* Animated waveform visualizer */}
            <MusicVisualizer isPlaying={isPlaying} barCount={4} className="text-cyan-400 hidden sm:inline-flex" />
            <span className={cn('hidden sm:inline font-medium text-[11px] max-w-[100px] truncate', isPlaying ? 'text-cyan-300' : 'text-on-surface-variant')}>
              {currentSong.title}
            </span>
            {userPlayCount > 0 && (
              <span
                className="hidden lg:inline-flex items-center text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/20 px-1.5 py-0.5 rounded-full border border-cyan-400/30"
                title={`You listened ${userPlayCount} times`}
              >
                {userPlayCount}x
              </span>
            )}
            {isPlaying && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={nextSong}
            className="p-1.5 text-on-surface-variant hover:text-cyan-300 transition-colors rounded-full"
            title="Next song"
          >
            <SkipForward className="w-3 h-3" />
          </button>
        </div>

        {/* Share Link Button */}
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/15 via-purple-500/15 to-pink-500/15 text-cyan-300 border border-cyan-400/30 text-xs font-semibold hover:border-cyan-400/60 hover:shadow-[0_0_15px_rgba(0,240,255,0.25)] transition-all"
          title="Share website link with friends"
        >
          <Share2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Share Link</span>
        </button>

        {onTelescopeClick && (
          <button
            onClick={onTelescopeClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-400/40 hover:border-cyan-300 hover:shadow-[0_0_15px_rgba(0,240,255,0.35)] text-xs font-semibold transition-all"
            title="Scan the Galaxy with Telescope"
          >
            <Telescope className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden xl:inline">Telescope</span>
          </button>
        )}

        {onCapsuleClick && (
          <button
            onClick={onCapsuleClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-200 border border-purple-400/40 hover:border-purple-300 hover:shadow-[0_0_15px_rgba(168,85,247,0.35)] text-xs font-semibold transition-all"
            title="Seal Time Capsule Transmission"
          >
            <Package className="w-3.5 h-3.5 text-purple-300" />
            <span className="hidden xl:inline">Time Capsule</span>
          </button>
        )}

        {onNewPostClick && (
          <button
            onClick={onNewPostClick}
            className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-500 text-white text-xs font-bold hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>New Post</span>
          </button>
        )}

        <button
          onClick={() => setIsAIPanelOpen(!isAIPanelOpen)}
          className={cn(
            'p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all flex items-center gap-1',
            isAIPanelOpen && 'bg-primary-fixed text-primary'
          )}
          title="Toggle Anant"
        >
          <Bot className="w-5 h-5" />
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all"
          title={`Switch to ${settings.theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {settings.theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
        </button>

        <NotificationDropdown />

        <button
          onClick={() => openUserProfile(currentUser)}
          className="pl-1 transition-transform active:scale-95"
          title={`View Profile: ${currentUser.name}`}
        >
          <Avatar
            src={currentUser.avatar}
            name={currentUser.name}
            status="online"
            showStatus
            size="sm"
            className="ring-2 ring-primary/40 hover:ring-primary transition-all cursor-pointer"
          />
        </button>
      </div>
    </header>
  );
};
