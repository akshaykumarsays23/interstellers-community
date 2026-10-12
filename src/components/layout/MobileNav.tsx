'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';
import { MessageSquare, Users, Layers, Compass, Settings, Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const { chats, friendRequests } = useApp();

  const unreadChats = chats.reduce((acc, c) => acc + c.unreadCount, 0);
  const pendingRequestsCount = friendRequests.filter((r) => r.status === 'pending').length;

  const items = [
    { label: 'Feed', href: '/', icon: Compass, active: pathname === '/' || pathname === '/feed' },
    { label: 'Arcade', href: '/arcade', icon: Gamepad2, active: pathname.startsWith('/arcade') },
    {
      label: 'Fellows',
      href: '/messages',
      icon: MessageSquare,
      active: pathname.startsWith('/messages'),
      badge: unreadChats > 0 ? unreadChats : undefined,
    },
    {
      label: 'Friends',
      href: '/friends',
      icon: Users,
      active: pathname.startsWith('/friends'),
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
    },
    { label: 'Space House', href: '/groups', icon: Layers, active: pathname.startsWith('/groups') },
    { label: 'Settings', href: '/settings', icon: Settings, active: pathname.startsWith('/settings') },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050a22]/95 backdrop-blur-xl border-t border-cyan-500/35 shadow-[0_-4px_25px_rgba(0,240,255,0.15)] py-1.5 px-3 flex items-center justify-around">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center py-1 px-3 rounded-lg text-xs transition-colors relative min-w-[56px]',
              item.active
                ? 'text-cyan-300 font-bold drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]'
                : 'text-on-surface-variant hover:text-cyan-200'
            )}
          >
            <div className="relative">
              <Icon className={cn('w-5 h-5', item.active ? 'text-cyan-400' : 'text-slate-400')} />
              {item.badge !== undefined && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(0,240,255,0.5)]">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
