'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useApp } from '@/lib/store';
import { Zap, Radio, Users, MessageSquare, Star, Flame } from 'lucide-react';

interface TickerEvent {
  id: string;
  icon: React.ReactNode;
  text: string;
  color: string;
}

function buildTickerEvents(
  posts: ReturnType<typeof useApp>['posts'],
  connections: ReturnType<typeof useApp>['connections'],
  notifications: ReturnType<typeof useApp>['notifications'],
  chats: ReturnType<typeof useApp>['chats'],
  activeDevicesCount: number,
): TickerEvent[] {
  const events: TickerEvent[] = [];

  // Online travelers count
  if (activeDevicesCount > 0) {
    events.push({
      id: 'online',
      icon: <Users className="w-3 h-3 shrink-0" />,
      text: `${activeDevicesCount} traveler${activeDevicesCount !== 1 ? 's' : ''} online right now`,
      color: 'text-emerald-400',
    });
  }

  // Recent posts
  const recentPosts = [...posts].slice(0, 3);
  recentPosts.forEach((post, i) => {
    events.push({
      id: `post_${post.id}_${i}`,
      icon: <Zap className="w-3 h-3 shrink-0" />,
      text: `${post.author.name} posted in Galaxy Feed`,
      color: 'text-cyan-400',
    });
  });

  // Active connections
  const onlineConnections = connections.filter((u) => u.status === 'online').slice(0, 3);
  onlineConnections.forEach((user, i) => {
    events.push({
      id: `conn_${user.id}_${i}`,
      icon: <Star className="w-3 h-3 shrink-0" />,
      text: `${user.name} is active on Interstellers`,
      color: 'text-amber-400',
    });
  });

  // Unread notifications
  const unread = notifications.filter((n) => !n.isRead).slice(0, 2);
  unread.forEach((notif, i) => {
    events.push({
      id: `notif_${notif.id}_${i}`,
      icon: <Radio className="w-3 h-3 shrink-0 animate-pulse" />,
      text: notif.title,
      color: 'text-purple-400',
    });
  });

  // Chats with messages
  const activeChatCount = chats.filter((c) => c.messages.length > 0).length;
  if (activeChatCount > 0) {
    events.push({
      id: 'chats_active',
      icon: <MessageSquare className="w-3 h-3 shrink-0" />,
      text: `${activeChatCount} active transmissions in Fellows`,
      color: 'text-indigo-400',
    });
  }

  // Cosmic axiom quote always appended
  events.push({
    id: 'axiom',
    icon: <Flame className="w-3 h-3 shrink-0 text-amber-400" />,
    text: '"Time is never coming back, remember time is never..." — Interstellers',
    color: 'text-amber-300',
  });

  // Duplicate for seamless infinite scroll
  return [...events, ...events];
}

export const ActivityTicker: React.FC = () => {
  const { posts, connections, notifications, chats, activeDevicesCount } = useApp();
  const tickerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const posRef = useRef<number>(0);
  const [isPaused, setIsPaused] = useState(false);

  const events = useMemo(
    () => buildTickerEvents(posts, connections, notifications, chats, activeDevicesCount),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [posts.length, connections.length, notifications.length, chats.length, activeDevicesCount],
  );

  useEffect(() => {
    const el = tickerRef.current;
    if (!el) return;

    const speed = 0.6; // px per frame — slow and readable

    const tick = () => {
      if (!isPaused && el) {
        posRef.current -= speed;
        const half = el.scrollWidth / 2;
        if (Math.abs(posRef.current) >= half) {
          posRef.current = 0;
        }
        el.style.transform = `translateX(${posRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPaused]);

  if (events.length === 0) {
    return (
      <div className="hidden lg:flex items-center gap-2 text-[11px] text-on-surface-variant/70 px-2">
        <Radio className="w-3 h-3 animate-pulse text-cyan-400/50" />
        <span>Galaxy quiet — no activity yet</span>
      </div>
    );
  }

  return (
    <div
      className="hidden lg:flex flex-1 items-center overflow-hidden max-w-xs xl:max-w-sm mx-3 relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Live activity ticker"
      role="marquee"
    >
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[rgba(8,16,42,0.9)] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[rgba(8,16,42,0.9)] to-transparent z-10 pointer-events-none" />

      <div
        ref={tickerRef}
        className="flex items-center gap-0 will-change-transform"
        style={{ whiteSpace: 'nowrap' }}
      >
        {events.map((event, idx) => (
          <span
            key={`${event.id}-${idx}`}
            className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-3 ${event.color}`}
          >
            {event.icon}
            <span>{event.text}</span>
            <span className="text-cyan-500/40 mx-1 text-xs">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
};
