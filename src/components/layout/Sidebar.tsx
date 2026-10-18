'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Avatar } from '@/components/common/Avatar';
import { INTERSTELLERS_LOGO } from '@/lib/data';
import {
  MessageSquare,
  Users,
  Layers,
  Settings,
  Compass,
  Bot,
  LogOut,
  Sparkles,
  ShieldCheck,
  Share2,
  Mic,
  Gamepad2,
  Radio,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const {
    currentUser,
    isAIPanelOpen,
    setIsAIPanelOpen,
    setIsNovaVoiceOpen,
    setIsShareModalOpen,
    logout,
    chats,
    friendRequests,
    openUserProfile,
  } = useApp();

  const unreadChats = chats.reduce((acc, c) => acc + c.unreadCount, 0);
  const pendingRequestsCount = friendRequests.filter((r) => r.status === 'pending').length;

  const navItems = [
    {
      label: 'Feed & Discover',
      href: '/',
      icon: Compass,
      active: pathname === '/' || pathname === '/feed',
    },
    {
      label: 'Interstellers Arcade',
      href: '/arcade',
      icon: Gamepad2,
      active: pathname.startsWith('/arcade'),
      badge: 'HOT 🔥',
    },
    {
      label: 'Fellows',
      href: '/messages',
      icon: MessageSquare,
      active: pathname.startsWith('/messages'),
      badge: unreadChats > 0 ? unreadChats : undefined,
    },
    {
      label: 'Friends & Directory',
      href: '/friends',
      icon: Users,
      active: pathname.startsWith('/friends'),
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
    },
    {
      label: 'Space Stations',
      href: '/stations',
      icon: Radio,
      active: pathname.startsWith('/stations'),
    },
    {
      label: 'Space House',
      href: '/groups',
      icon: Layers,
      active: pathname.startsWith('/groups'),
      badge: 'Houses 🏰',
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings,
      active: pathname.startsWith('/settings'),
    },
  ];

  return (
    <aside className="hidden md:flex flex-col h-full w-[280px] bg-surface-container-low border-r border-cyan-500/25 shadow-[4px_0_25px_rgba(0,240,255,0.08)] py-6 px-4 shrink-0 z-20">
      {/* Brand Header */}
      <Link href="/" className="flex items-center gap-3 mb-6 px-2 group">
        <div className="relative shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={INTERSTELLERS_LOGO}
            alt="Interstellers Logo"
            className="w-11 h-11 rounded-xl object-cover shadow-[0_0_15px_rgba(0,240,255,0.4)] group-hover:scale-105 transition-transform"
          />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border-2 border-[#040817] shadow-[0_0_8px_#00f0ff] animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-1">
            <h1 className="font-heading font-extrabold text-lg bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400 bg-clip-text text-transparent tracking-tight">Interstellers</h1>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-[11px] text-cyan-300/80 flex items-center gap-1 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
            Galactic Network
          </p>
        </div>
      </Link>

      {/* High-Contrast Cosmic Quote Banner */}
      <div className="mb-5 mx-1 p-3.5 bg-gradient-to-br from-purple-950/80 via-slate-900/95 to-cyan-950/60 rounded-2xl border border-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.3)] relative overflow-hidden group">
        <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase tracking-wider font-black text-amber-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>Cosmic Axiom</span>
        </div>
        <p className="text-[12px] text-amber-300 dark:text-amber-300 font-extrabold italic leading-snug drop-shadow-[0_0_10px_rgba(251,191,36,0.45)]">
          &ldquo;Time is never coming back, remember time is never...&rdquo;
        </p>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 flex flex-col space-y-1.5">
        <div className="px-3 py-1 text-[11px] font-bold text-cyan-400/80 uppercase tracking-wider">
          Main Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all group active:scale-[0.98]',
                item.active
                  ? 'bg-gradient-to-r from-cyan-500/20 via-purple-500/15 to-transparent text-cyan-300 font-bold border-l-4 border-cyan-400 shadow-[inset_0_0_15px_rgba(0,240,255,0.15)]'
                  : 'text-on-surface-variant hover:text-cyan-200 hover:bg-cyan-500/10'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-5 h-5 transition-colors',
                    item.active
                      ? 'text-cyan-400 drop-shadow-[0_0_8px_#00f0ff]'
                      : 'text-on-surface-variant group-hover:text-cyan-300'
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-500 text-white shadow-[0_0_12px_rgba(0,240,255,0.4)]">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Share Link & AI Tools */}
        <div className="pt-3 mt-2 border-t border-outline-variant/40 space-y-1.5">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm text-on-surface-variant hover:text-primary hover:bg-surface-container-high/60 transition-all group"
          >
            <div className="flex items-center gap-3">
              <Share2 className="w-5 h-5 text-social-blue" />
              <span>Share Website Link</span>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={() => setIsAIPanelOpen(!isAIPanelOpen)}
            className={cn(
              'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all group',
              isAIPanelOpen
                ? 'bg-gradient-to-r from-primary-container/20 to-social-blue/15 text-primary border border-primary/20 shadow-xs'
                : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high/60'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-lg bg-primary text-on-primary shadow-xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold">Nova Assistant</span>
            </div>
            <span className="text-[10px] text-primary font-bold">
              {isAIPanelOpen ? 'Active' : 'Open'}
            </span>
          </button>

          <button
            onClick={() => setIsNovaVoiceOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm text-cyan-300 bg-gradient-to-r from-purple-950/60 via-indigo-950/60 to-cyan-950/60 hover:from-purple-900/80 hover:to-cyan-900/80 border border-cyan-500/30 transition-all shadow-md group animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-lg bg-cyan-500 text-black shadow-xs">
                <Mic className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold">Nova Voice Live</span>
            </div>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 uppercase tracking-widest">
              Live 🎙️
            </span>
          </button>
        </div>
      </nav>

      {/* Bottom Profile Summary & Sign Out */}
      <div className="pt-4 border-t border-outline-variant/60 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => openUserProfile(currentUser)}
          className="flex items-center gap-3 hover:opacity-85 transition-opacity min-w-0 flex-1 text-left"
          title={`View Profile: ${currentUser.name}`}
        >
          <Avatar
            src={currentUser.avatar}
            name={currentUser.name}
            status="online"
            showStatus
            size="md"
            className="ring-2 ring-primary/30 hover:ring-primary transition-all"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-on-surface truncate">{currentUser.name}</p>
            <p className="text-xs text-on-surface-variant truncate">@{currentUser.handle}</p>
          </div>
        </button>

        <button
          onClick={logout}
          className="p-2 text-on-surface-variant hover:text-error hover:bg-surface-container-high rounded-lg transition-colors"
          title="Sign Out to Landing Page"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
