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
  UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const {
    currentUser,
    isAIPanelOpen,
    setIsAIPanelOpen,
    setIsShareModalOpen,
    setIsApprovalsModalOpen,
    pendingRegistrationsCount,
    isAdmin,
    logout,
    chats,
    friendRequests,
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
      label: 'Messages',
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
      label: 'Group Hub & Spaces',
      href: '/groups',
      icon: Layers,
      active: pathname.startsWith('/groups'),
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings,
      active: pathname.startsWith('/settings'),
    },
  ];

  return (
    <aside className="hidden md:flex flex-col h-full w-[280px] bg-surface-container-low border-r border-outline-variant/60 py-6 px-4 shrink-0 z-20 shadow-xs">
      {/* Brand Header */}
      <Link href="/" className="flex items-center gap-3 mb-6 px-2 group">
        <div className="relative shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={INTERSTELLERS_LOGO}
            alt="Interstellers Logo"
            className="w-11 h-11 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
          />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-surface-container-low animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-1">
            <h1 className="font-heading font-bold text-lg text-primary tracking-tight">Interstellers</h1>
            <ShieldCheck className="w-4 h-4 text-social-blue" />
          </div>
          <p className="text-[11px] text-on-surface-variant flex items-center gap-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Galactic Network
          </p>
        </div>
      </Link>

      {/* Quote Banner */}
      <div className="mb-5 mx-1 p-3 bg-surface-container rounded-xl border border-outline-variant/40">
        <p className="text-[11px] text-primary italic font-medium leading-tight">
          &ldquo;Time is never coming back, remember time is never...&rdquo;
        </p>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 flex flex-col space-y-1.5">
        <div className="px-3 py-1 text-[11px] font-semibold text-on-surface-variant/70 uppercase tracking-wider">
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
                  ? 'bg-surface-container-high text-primary font-semibold border-l-4 border-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-5 h-5 transition-colors',
                    item.active ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-primary text-on-primary shadow-xs">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Admin Approvals Queue (for Akshay) */}
        {isAdmin && (
          <button
            onClick={() => setIsApprovalsModalOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm text-amber-800 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 transition-all group"
          >
            <div className="flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-amber-600" />
              <span className="font-semibold">Host Approvals</span>
            </div>
            {pendingRegistrationsCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-600 text-white animate-pulse">
                {pendingRegistrationsCount}
              </span>
            )}
          </button>
        )}

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
        </div>
      </nav>

      {/* Bottom Profile Summary & Sign Out */}
      <div className="pt-4 border-t border-outline-variant/60 flex items-center justify-between px-1">
        <Link
          href="/settings"
          className="flex items-center gap-3 hover:opacity-85 transition-opacity min-w-0 flex-1"
        >
          <Avatar
            src={currentUser.avatar}
            name={currentUser.name}
            status="online"
            showStatus
            size="md"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-on-surface truncate">{currentUser.name}</p>
            <p className="text-xs text-on-surface-variant truncate">@{currentUser.handle}</p>
          </div>
        </Link>

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
