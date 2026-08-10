'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import {
  UserPlus,
  Users,
  Search,
  MessageSquare,
  Check,
  X,
  Sparkles,
  Building,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const FriendsDirectory: React.FC = () => {
  const {
    connections,
    friendRequests,
    acceptFriendRequest,
    declineFriendRequest,
    setActiveChatId,
    setIsShareModalOpen,
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'online'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConnections = connections.filter((user) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = user.name.toLowerCase().includes(q);
      const matchRole = user.role.toLowerCase().includes(q);
      const matchCompany = user.company?.toLowerCase().includes(q);
      if (!matchName && !matchRole && !matchCompany) return false;
    }

    if (filter === 'online') return user.status === 'online';
    return true;
  });

  const pendingRequests = friendRequests.filter((r) => r.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Pending Friend Requests Section */}
      {pendingRequests.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary text-on-primary">
                <UserPlus className="w-4 h-4" />
              </div>
              <h2 className="font-heading font-bold text-lg sm:text-xl text-on-surface">
                Pending Requests
              </h2>
              <span className="px-2 py-0.5 text-xs font-bold bg-error text-on-error rounded-full">
                {pendingRequests.length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-4 flex items-center gap-4 shadow-card hover:shadow-card-hover transition-all"
              >
                <Avatar src={req.user.avatar} name={req.user.name} size="xl" className="shrink-0" />

                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-sm text-on-surface truncate">
                    {req.user.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant truncate">
                    {req.user.role} {req.user.company ? `at ${req.user.company}` : ''}
                  </p>
                  <p className="text-[11px] text-tertiary flex items-center gap-1 mt-1 font-medium">
                    <Users className="w-3 h-3" />
                    <span>{req.mutualFriends} mutual connections</span>
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => acceptFriendRequest(req.id)}
                    className="flex items-center justify-center gap-1 bg-primary text-on-primary hover:bg-primary-hover text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => declineFriendRequest(req.id)}
                    className="flex items-center justify-center gap-1 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Connections Directory */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/40">
          <div>
            <h2 className="font-heading font-bold text-lg sm:text-xl text-on-surface">
              Connections ({connections.length})
            </h2>
            <p className="text-xs text-on-surface-variant">Your verified galactic network</p>
          </div>

          {/* Search, Filter, and Invite Button */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-on-primary hover:bg-primary-hover text-xs font-semibold shadow-xs transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Invite Friends</span>
            </button>

            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search directory..."
                className="w-full bg-surface-container rounded-full py-1.5 pl-8 pr-3 text-xs text-on-surface border border-outline-variant/40 focus:border-primary outline-none"
              />
            </div>

            <div className="flex gap-1">
              <button
                onClick={() => setFilter('all')}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-semibold transition-colors',
                  filter === 'all'
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                )}
              >
                All
              </button>
              <button
                onClick={() => setFilter('online')}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-semibold transition-colors',
                  filter === 'online'
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                )}
              >
                Online
              </button>
            </div>
          </div>
        </div>

        {/* Members Grid */}
        {filteredConnections.length === 0 ? (
          <div className="p-12 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/60 space-y-3">
            <Users className="w-10 h-10 text-primary/40 mx-auto" />
            <h3 className="text-base font-semibold text-on-surface">No other connections yet</h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              Share your official Interstellers link with your friends so they can register and connect with you!
            </p>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Website Link</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConnections.map((user) => (
              <div
                key={user.id}
                className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div className="flex items-start gap-3.5 mb-3">
                  <Avatar
                    src={user.avatar}
                    name={user.name}
                    status={user.status}
                    showStatus
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <h3 className="font-heading font-semibold text-sm text-on-surface truncate">
                        {user.name}
                      </h3>
                      {user.isVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-social-blue fill-social-blue/20" />
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant truncate">{user.role}</p>
                    {user.company && (
                      <p className="text-[11px] text-on-surface-variant/80 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-primary" />
                        <span>{user.company}</span>
                      </p>
                    )}
                  </div>
                </div>

                {user.bio && (
                  <p className="text-xs text-on-surface-variant line-clamp-2 mb-4 leading-relaxed bg-surface-container-low/40 p-2.5 rounded-xl border border-outline-variant/30">
                    {user.bio}
                  </p>
                )}

                <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between">
                  <span className="text-[11px] text-on-surface-variant font-medium">
                    Host Admin
                  </span>

                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Invite</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
