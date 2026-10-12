'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { PostComposer } from './PostComposer';
import { SpaceTravelerBriefing } from './SpaceTravelerBriefing';
import { PublicVideoTransmission } from './PublicVideoTransmission';
import { PostCard } from './PostCard';
import { TrendingPanel } from './TrendingPanel';
import { Compass, Sparkles, Filter, Bookmark, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export const FeedView: React.FC = () => {
  const { posts, searchQuery } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'popular' | 'saved'>('all');

  const filteredPosts = posts.filter((post) => {
    // Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchContent = post.content.toLowerCase().includes(q);
      const matchAuthor = post.author.name.toLowerCase().includes(q);
      const matchTag = post.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchContent && !matchAuthor && !matchTag) return false;
    }

    if (activeTab === 'saved') return post.isBookmarked;
    if (activeTab === 'popular') return post.likes > 50;
    return true;
  });

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
        {/* Main Posts Feed Column (expanded to fill all available width) */}
        <div className="flex-1 min-w-0">
          {/* Space Traveler Flight Briefing */}
          <SpaceTravelerBriefing />

          {/* Live Public Video Transmission */}
          <PublicVideoTransmission />

          {/* Post Composer */}
          <PostComposer />

          {/* Feed Filter Tabs */}
          <div className="flex items-center justify-between mb-4 bg-surface-container-low p-1.5 rounded-xl border border-cyan-500/25 shadow-[0_0_15px_rgba(0,240,255,0.08)]">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('all')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  activeTab === 'all'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 font-bold border border-cyan-400/40 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                    : 'text-on-surface-variant hover:text-cyan-300'
                )}
              >
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>All Updates</span>
              </button>

              <button
                onClick={() => setActiveTab('popular')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  activeTab === 'popular'
                    ? 'bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-300 font-bold border border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'text-on-surface-variant hover:text-amber-300'
                )}
              >
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Popular</span>
              </button>

              <button
                onClick={() => setActiveTab('saved')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  activeTab === 'saved'
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-200 font-bold border border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                    : 'text-on-surface-variant hover:text-purple-300'
                )}
              >
                <Bookmark className="w-3.5 h-3.5 text-purple-400" />
                <span>Saved</span>
              </button>
            </div>

            <span className="text-xs font-mono text-cyan-300/80 hidden sm:inline px-2">
              {filteredPosts.length} posts
            </span>
          </div>

          {/* Posts List */}
          {filteredPosts.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-12 text-center shadow-card">
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-3 animate-bounce" />
              <h3 className="font-heading font-semibold text-base text-on-surface mb-1">No posts found</h3>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                {searchQuery
                  ? `No matches found for "${searchQuery}". Try refining your query.`
                  : 'Be the first to share an update across the galaxy!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>

        {/* Right Trending & Activity Column */}
        <div className="hidden lg:block w-80 xl:w-96 shrink-0">
          <div className="sticky top-24">
            <TrendingPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

