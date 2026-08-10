'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';
import { MessageSquare, Users, Layers, Compass, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const { chats, friendRequests } = useApp();

  const unreadChats = chats.reduce((acc, c) => acc + c.unreadCount, 0);
  const pendingRequestsCount = friendRequests.filter((r) => r.status === 'pending').length;

  const items = [
    { label: 'Feed', href: '/', icon: Compass, active: pathname === '/' || pathname === '/feed' },
    {
      label: 'Messages',
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
    { label: 'Groups', href: '/groups', icon: Layers, active: pathname.startsWith('/groups') },
    { label: 'Settings', href: '/settings', icon: Settings, active: pathname.startsWith('/settings') },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-low/95 backdrop-blur-lg border-t border-outline-variant/60 py-1.5 px-3 flex items-center justify-around shadow-lg">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center py-1 px-3 rounded-lg text-xs transition-colors relative min-w-[56px]',
              item.active
                ? 'text-primary font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            )}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge !== undefined && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-primary text-on-primary text-[10px] font-bold rounded-full flex items-center justify-center">
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
