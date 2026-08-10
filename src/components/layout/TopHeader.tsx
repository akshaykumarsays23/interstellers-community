'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Avatar } from '@/components/common/Avatar';
import { NotificationDropdown } from '@/components/common/NotificationDropdown';
import { INTERSTELLERS_LOGO } from '@/lib/data';
import { Search, Bot, Moon, Sun, Sparkles, PlusCircle, Share2, ShieldCheck, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopHeaderProps {
  title?: string;
  subtitle?: string;
  onNewPostClick?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ title, subtitle, onNewPostClick }) => {
  const {
    currentUser,
    settings,
    updateSettings,
    searchQuery,
    setSearchQuery,
    isAIPanelOpen,
    setIsAIPanelOpen,
    setIsShareModalOpen,
    setIsApprovalsModalOpen,
    pendingRegistrationsCount,
    isAdmin,
  } = useApp();

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'light' ? 'dark' : 'light';
    updateSettings({ theme: nextTheme });
  };

  return (
    <header className="bg-surface-bright/95 backdrop-blur-md sticky top-0 z-30 border-b border-outline-variant/60 px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
      {/* Left: Mobile Brand or Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <Link href="/" className="md:hidden flex items-center gap-2 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={INTERSTELLERS_LOGO} alt="Interstellers" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-heading font-bold text-primary text-base">Interstellers</span>
        </Link>

        {title && (
          <div className="hidden sm:block min-w-0">
            <h1 className="font-heading font-bold text-lg text-on-surface truncate">{title}</h1>
            {subtitle && <p className="text-xs text-on-surface-variant truncate">{subtitle}</p>}
          </div>
        )}
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md mx-auto hidden sm:block">
        <div className="relative">
          <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search interstellar posts, spaces..."
            className="w-full bg-surface-container rounded-full py-2 pl-9 pr-4 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant border border-transparent focus:border-primary focus:bg-surface-bright focus:ring-2 focus:ring-primary/20 transition-all outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant hover:text-primary"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Host Approvals Queue Trigger (for Akshay) */}
        {isAdmin && (
          <button
            onClick={() => setIsApprovalsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all relative"
            title="Member Access Approvals"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Approvals</span>
            {pendingRegistrationsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {pendingRegistrationsCount}
              </span>
            )}
          </button>
        )}

        {/* Share Link Button */}
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-social-blue/15 text-primary border border-primary/25 text-xs font-semibold hover:bg-primary/20 transition-all shadow-xs"
          title="Share website link with friends"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Share Link</span>
        </button>

        {onNewPostClick && (
          <button
            onClick={onNewPostClick}
            className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-on-primary text-xs font-semibold hover:bg-primary-hover shadow-xs transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Post</span>
          </button>
        )}

        <button
          onClick={() => setIsAIPanelOpen(!isAIPanelOpen)}
          className={cn(
            'p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all flex items-center gap-1',
            isAIPanelOpen && 'bg-primary-fixed text-primary'
          )}
          title="Toggle Nova AI Assistant"
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

        <Link href="/settings" className="pl-1">
          <Avatar
            src={currentUser.avatar}
            name={currentUser.name}
            status="online"
            showStatus
            size="sm"
            className="ring-2 ring-primary/20 hover:ring-primary transition-all"
          />
        </Link>
      </div>
    </header>
  );
};
