'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { TrendingUp, Users, Sparkles, Calendar, ArrowUpRight } from 'lucide-react';

export const TrendingPanel: React.FC = () => {
  const { connections, groups, setActiveGroupId } = useApp();

  const trendingTopics = [
    { tag: '#CorporateModern', postsCount: '1.4k posts', category: 'Design System' },
    { tag: '#NovaAssistant', postsCount: '980 posts', category: 'AI Tools' },
    { tag: '#NextAppRouter', postsCount: '850 posts', category: 'Engineering' },
    { tag: '#TownHall2026', postsCount: '520 posts', category: 'Events' },
  ];

  return (
    <div className="space-y-6">
      {/* Trending Topics Card */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-4 shadow-card">
        <div className="flex items-center gap-2 mb-3.5 pb-2 border-b border-outline-variant/40">
          <div className="p-1.5 rounded-lg bg-primary-fixed text-primary">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h3 className="font-heading font-semibold text-sm text-on-surface">Trending in Galaxy</h3>
        </div>

        <div className="space-y-3">
          {trendingTopics.map((topic, i) => (
            <div key={i} className="flex items-center justify-between group cursor-pointer">
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase font-semibold tracking-wider">
                  {topic.category}
                </span>
                <p className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors">
                  {topic.tag}
                </p>
                <span className="text-[11px] text-on-surface-variant/80">{topic.postsCount}</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-on-surface-variant group-hover:text-primary transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Spaces / Groups */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-4 shadow-card">
        <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-outline-variant/40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-semibold text-sm text-on-surface">Popular Spaces</h3>
          </div>
          <Link href="/groups" className="text-xs text-primary hover:underline font-medium">
            Explore
          </Link>
        </div>

        <div className="space-y-2.5">
          {groups.slice(0, 3).map((grp) => (
            <Link
              key={grp.id}
              href="/groups"
              onClick={() => setActiveGroupId(grp.id)}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-container-low transition-colors border border-transparent hover:border-outline-variant/40"
            >
              <div className="min-w-0 pr-2">
                <p className="text-xs font-semibold text-on-surface truncate">#{grp.name}</p>
                <p className="text-[11px] text-on-surface-variant truncate">{grp.membersCount} members</p>
              </div>
              <Badge variant="primary" size="sm">
                Join
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {/* Online Explorers */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-4 shadow-card">
        <div className="flex items-center gap-2 mb-3.5 pb-2 border-b border-outline-variant/40">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="font-heading font-semibold text-sm text-on-surface">Active Contacts</h3>
        </div>

        <div className="space-y-2.5">
          {connections.slice(0, 4).map((conn) => (
            <div key={conn.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar src={conn.avatar} name={conn.name} status={conn.status} showStatus size="sm" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-on-surface truncate">{conn.name}</p>
                  <p className="text-[10px] text-on-surface-variant truncate">{conn.role}</p>
                </div>
              </div>
              <Link
                href="/messages"
                className="text-[11px] text-primary hover:underline font-semibold"
              >
                Chat
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
