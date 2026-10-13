'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { Avatar } from '@/components/common/Avatar';
import { Users, Wifi, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * OnlineTravelersWidget — Shows currently online community members.
 * Uses real presence info from the app store (user.status field).
 *
 * NOTE: status is currently set client-side. For true real-time presence,
 * integrate a server-sent event or WebSocket endpoint that pushes status changes.
 * The activeDevicesCount comes from the /api/visitors polling endpoint (every 10s).
 */
export const OnlineTravelersWidget: React.FC = () => {
  const { connections, currentUser, activeDevicesCount, openUserProfile } = useApp();

  const onlineUsers = [
    ...(currentUser.status === 'online' ? [currentUser] : []),
    ...connections.filter((u) => u.status === 'online'),
  ].slice(0, 8);

  const awayUsers = connections.filter((u) => u.status === 'away').slice(0, 3);

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-cyan-500/25 p-4 shadow-card mb-4 overflow-hidden relative">
      {/* Background cosmic glow */}
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-emerald-500/8 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
          <h3 className="font-heading font-bold text-sm text-on-surface">Online Travelers</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse" />
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
            {activeDevicesCount} online
          </span>
        </div>
      </div>

      {onlineUsers.length === 0 ? (
        <div className="py-4 text-center">
          <Users className="w-6 h-6 text-on-surface-variant/40 mx-auto mb-2" />
          <p className="text-xs text-on-surface-variant">No travelers currently online.</p>
          <p className="text-[10px] text-on-surface-variant/60 mt-1">
            Real-time presence requires WebSocket/SSE infrastructure.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {onlineUsers.map((user, idx) => (
            <button
              key={user.id}
              onClick={() => openUserProfile(user)}
              className="w-full flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-surface-container transition-all group text-left"
              title={`View ${user.name}'s profile`}
            >
              <div className="relative shrink-0">
                <Avatar src={user.avatar} name={user.name} size="xs" />
                {/* Presence dot with pulse */}
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#030714] animate-presence-pulse"
                  title="Online now"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-xs font-semibold text-on-surface truncate group-hover:text-cyan-300 transition-colors',
                  idx === 0 && 'text-cyan-200', // current user accent
                )}>
                  {user.name}{idx === 0 && user.id === currentUser.id ? ' (You)' : ''}
                </p>
                <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <Circle className="w-1.5 h-1.5 fill-emerald-400 text-emerald-400" />
                  {user.customStatus || 'Active now'}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Away users section */}
      {awayUsers.length > 0 && (
        <div className="mt-3 pt-3 border-t border-outline-variant/30">
          <p className="text-[10px] text-on-surface-variant/60 font-semibold uppercase tracking-wider mb-1.5">Away</p>
          <div className="flex gap-2 flex-wrap">
            {awayUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => openUserProfile(user)}
                className="relative group"
                title={`${user.name} — Away`}
              >
                <Avatar src={user.avatar} name={user.name} size="xs" className="opacity-60 group-hover:opacity-80 transition-opacity" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-[#030714]" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer note */}
      <p className="text-[10px] text-on-surface-variant/50 mt-3 text-center leading-snug">
        Updates every 10s via device tracker
      </p>
    </div>
  );
};
