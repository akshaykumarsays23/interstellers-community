'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Bell, CheckCheck, Trash2, Heart, MessageSquare, UserPlus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadNotificationsCount, markNotificationAsRead, markAllNotificationsAsRead, clearNotification } = useApp();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />;
      case 'comment':
      case 'message':
        return <MessageSquare className="w-3.5 h-3.5 text-primary" />;
      case 'friend_request':
        return <UserPlus className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative p-2.5 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all',
          isOpen && 'bg-surface-container-high text-primary'
        )}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-on-primary text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadNotificationsCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-container-lowest border border-outline-variant/60 rounded-xl shadow-floating z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3.5 bg-surface-container-low border-b border-outline-variant/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-on-surface text-sm">Notifications</h3>
              {unreadNotificationsCount > 0 && (
                <Badge variant="primary" size="sm">
                  {unreadNotificationsCount} new
                </Badge>
              )}
            </div>
            {unreadNotificationsCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y divide-outline-variant/30 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-on-surface-variant text-sm">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationAsRead(notif.id)}
                  className={cn(
                    'p-3.5 flex items-start gap-3 hover:bg-surface-container-low transition-colors cursor-pointer group relative',
                    !notif.isRead && 'bg-primary-fixed/20'
                  )}
                >
                  <div className="relative shrink-0 mt-0.5">
                    {notif.user ? (
                      <Avatar src={notif.user.avatar} name={notif.user.name} size="sm" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 bg-surface rounded-full p-0.5 shadow-xs border border-outline-variant/40">
                      {getIcon(notif.type)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-xs font-semibold text-on-surface line-clamp-1">{notif.title}</p>
                    <p className="text-xs text-on-surface-variant line-clamp-2 mt-0.5">{notif.message}</p>
                    <span className="text-[10px] text-on-surface-variant/70 mt-1 block">{notif.timestamp}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(notif.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-on-surface-variant hover:text-error transition-all rounded"
                    title="Dismiss"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {!notif.isRead && (
                    <span className="absolute top-4 right-3 w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
