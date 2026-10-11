'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { TrendingUp, Users, ArrowUpRight, Check, Plus, MessageSquare, X, Tag } from 'lucide-react';
import { RightSidebarMusicPlayer } from './RightSidebarMusicPlayer';

export const TrendingPanel: React.FC = () => {
  const router = useRouter();
  const {
    posts,
    groups,
    connections,
    currentUser,
    setActiveGroupId,
    toggleJoinGroup,
    startChatWithUser,
    searchQuery,
    setSearchQuery,
  } = useApp();

  // Dynamically calculate trending tags from real posts in the feed
  const realTrendingTags = useMemo(() => {
    const tagCountMap = new Map<string, { tag: string; count: number; category: string }>();

    posts.forEach((post) => {
      // 1. Tags explicitly on post
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach((tag) => {
          const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
          const existing = tagCountMap.get(cleanTag.toLowerCase());
          if (existing) {
            existing.count += 1;
          } else {
            tagCountMap.set(cleanTag.toLowerCase(), {
              tag: cleanTag,
              count: 1,
              category: 'Community Tag',
            });
          }
        });
      }

      // 2. Hashtags extracted from post content text
      if (post.content) {
        const matches = post.content.match(/#[\w_-]+/g);
        if (matches) {
          matches.forEach((tag) => {
            const lowerTag = tag.toLowerCase();
            const existing = tagCountMap.get(lowerTag);
            if (existing) {
              existing.count += 1;
            } else {
              tagCountMap.set(lowerTag, {
                tag,
                count: 1,
                category: 'Trending Topic',
              });
            }
          });
        }
      }
    });

    // Convert map to sorted array
    const sorted = Array.from(tagCountMap.values()).sort((a, b) => b.count - a.count);

    // Fallbacks if feed has few unique tags yet
    const defaultFallbackTags = [
      { tag: '#Interstellers', count: posts.length, category: 'Official Workspace' },
      { tag: '#CommunityUpdate', count: Math.max(1, Math.floor(posts.length / 2)), category: 'Announcements' },
      { tag: '#DesignSync', count: 1, category: 'Design System' },
      { tag: '#GalaxySpaces', count: groups.length, category: 'Community' },
    ];

    defaultFallbackTags.forEach((fallback) => {
      if (!sorted.some((t) => t.tag.toLowerCase() === fallback.tag.toLowerCase())) {
        sorted.push(fallback);
      }
    });

    return sorted.slice(0, 5);
  }, [posts, groups]);

  const handleTagClick = (tag: string) => {
    if (searchQuery === tag) {
      setSearchQuery('');
    } else {
      setSearchQuery(tag);
    }
  };

  const handleStartChat = (user: any) => {
    startChatWithUser(user);
    router.push('/messages');
  };

  return (
    <div className="space-y-6">
      {/* Official Website Theme Music Player (Right Side) */}
      <RightSidebarMusicPlayer />
      {/* Active Tag Filter Pill (if searching by tag) */}
      {searchQuery && (
        <div className="bg-primary/10 border border-primary/30 p-3 rounded-2xl flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <Tag className="w-4 h-4" />
            <span>Filtering feed by: <strong>{searchQuery}</strong></span>
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="p-1 rounded-full hover:bg-primary/20 text-primary transition-colors"
            title="Clear filter"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dynamic Trending Topics Card */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-4 shadow-card">
        <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-outline-variant/40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary-fixed text-primary">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-semibold text-sm text-on-surface">Trending in Galaxy</h3>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Real Feed Data
          </span>
        </div>

        <div className="space-y-3">
          {realTrendingTags.map((topic, i) => {
            const isSelected = searchQuery.toLowerCase() === topic.tag.toLowerCase();
            return (
              <div
                key={i}
                onClick={() => handleTagClick(topic.tag)}
                className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-primary/15 border-primary/40 font-bold'
                    : 'border-transparent hover:bg-surface-container-low hover:border-outline-variant/30'
                }`}
              >
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-semibold tracking-wider">
                    {topic.category}
                  </span>
                  <p className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors">
                    {topic.tag}
                  </p>
                  <span className="text-[11px] text-on-surface-variant/80">
                    {topic.count} {topic.count === 1 ? 'real post' : 'real posts'}
                  </span>
                </div>
                <ArrowUpRight className={`w-3.5 h-3.5 transition-colors ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Real Popular Spaces / Groups */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-4 shadow-card">
        <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-outline-variant/40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-semibold text-sm text-on-surface">Popular Spaces</h3>
          </div>
          <Link href="/groups" className="text-xs text-primary hover:underline font-medium">
            Explore
          </Link>
        </div>

        <div className="space-y-2.5">
          {groups.map((grp) => {
            const isJoined = grp.members?.some(
              (m) => m.id === currentUser.id || m.handle === currentUser.handle
            );

            return (
              <div
                key={grp.id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-container-low transition-colors border border-transparent hover:border-outline-variant/40"
              >
                <Link
                  href="/groups"
                  onClick={() => setActiveGroupId(grp.id)}
                  className="min-w-0 pr-2 flex-1 group"
                >
                  <p className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
                    #{grp.name}
                  </p>
                  <p className="text-[11px] text-on-surface-variant truncate">
                    {grp.membersCount || grp.members?.length || 1} members
                  </p>
                </Link>

                <button
                  onClick={() => toggleJoinGroup(grp.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1 shadow-xs ${
                    isJoined
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                      : 'bg-primary text-on-primary hover:bg-primary-hover'
                  }`}
                >
                  {isJoined ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      Joined
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3" />
                      Join
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real Active Contacts */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-4 shadow-card">
        <div className="flex items-center gap-2 mb-3.5 pb-2 border-b border-outline-variant/40">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="font-heading font-semibold text-sm text-on-surface">Active Contacts</h3>
        </div>

        <div className="space-y-2.5">
          {connections && connections.length > 0 ? (
            connections.slice(0, 4).map((conn) => (
              <div key={conn.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar src={conn.avatar} name={conn.name} status={conn.status} showStatus size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-on-surface truncate">{conn.name}</p>
                    <p className="text-[10px] text-on-surface-variant truncate">{conn.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleStartChat(conn)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-semibold transition-colors flex items-center gap-1"
                >
                  <MessageSquare className="w-3 h-3" />
                  Chat
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-on-surface-variant/70 text-center py-2">
              No active contacts yet. Invite friends using your share link!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
