'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useApp } from '@/lib/store';
import { Avatar } from '@/components/common/Avatar';
import { PlusCircle, ChevronLeft, ChevronRight, Sparkles, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Space Moments — Story-style horizontal ring row above the feed.
 *
 * BACKEND NOTE: Moments storage is NOT yet implemented.
 * The "Create Moment" button shows a toast explaining this.
 * Moments UI is ready — backend requires:
 *   - A `moments` table/collection in the database
 *   - POST /api/moments endpoint for creation
 *   - GET /api/moments endpoint for fetching
 *   - 24-hour expiry logic
 *
 * "Viewed" state is tracked client-side in sessionStorage (resets on tab close).
 */
export const SpaceMoments: React.FC = () => {
  const { currentUser, connections } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showBackendNote, setShowBackendNote] = useState(false);

  // Track which moment rings the user has "viewed" this session
  const [viewedIds, setViewedIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const raw = sessionStorage.getItem('interstellers_viewed_moments');
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  const markViewed = (id: string) => {
    setViewedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        sessionStorage.setItem('interstellers_viewed_moments', JSON.stringify(Array.from(next)));
      } catch { }
      return next;
    });
  };

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  // Build moment slots: current user first (always shows "add" ring), then connections
  // We simulate that online connections "have" moments (they glow) — offline ones are dimmed.
  const peopleCells = useMemo(() => [
    { user: currentUser, isOwn: true, hasMoment: false },
    ...connections.slice(0, 12).map((u) => ({
      user: u,
      isOwn: false,
      // Online users "have" moments in the UI — dimmed ring if offline
      hasMoment: u.status === 'online',
    })),
  ], [currentUser, connections]);

  // Count online travelers with "moments"
  const newMomentsCount = peopleCells.filter((c) => !c.isOwn && c.hasMoment && !viewedIds.has(c.user.id)).length;

  return (
    <div className="relative mb-4 -mx-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Space Moments
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 font-semibold">
            24h
          </span>
          {newMomentsCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/35 font-bold animate-pulse">
              {newMomentsCount} new
            </span>
          )}
        </div>

        {/* Scroll arrows */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            className="p-1 rounded-full text-on-surface-variant hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
            aria-label="Scroll moments left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1 rounded-full text-on-surface-variant hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
            aria-label="Scroll moments right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable moments row */}
      <div
        ref={scrollRef}
        className="flex items-center gap-3 overflow-x-auto pb-2 px-1 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {peopleCells.map(({ user, isOwn, hasMoment }) => {
          const isViewed = viewedIds.has(user.id);
          const isNew = !isOwn && hasMoment && !isViewed;

          return (
            <button
              key={user.id}
              onClick={() => {
                if (isOwn) {
                  setShowBackendNote(true);
                  setTimeout(() => setShowBackendNote(false), 4500);
                } else {
                  markViewed(user.id);
                }
              }}
              className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-full"
              title={isOwn ? 'Add a Space Moment' : `${user.name}${isNew ? ' — New moment!' : isViewed ? ' — Viewed' : ''}`}
              aria-label={isOwn ? 'Add your Space Moment' : `View ${user.name}'s moment`}
            >
              {/* Ring container */}
              <div
                className={cn(
                  'relative p-[2.5px] rounded-full transition-transform group-hover:scale-105 group-active:scale-95',
                  // New (unviewed) moment → vibrant cosmic gradient ring with glow
                  isNew
                    ? 'bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 shadow-[0_0_14px_rgba(0,240,255,0.5)]'
                    // Own "add" slot → dimmed gradient ring
                    : isOwn
                      ? 'bg-gradient-to-br from-cyan-400/50 via-purple-500/50 to-pink-500/50'
                      // Viewed → muted grey ring
                      : isViewed
                        ? 'bg-gradient-to-br from-slate-500/60 to-slate-600/60'
                        // Offline / no moment → subtle grey
                        : 'bg-gradient-to-br from-slate-600 to-slate-500',
                )}
              >
                {/* White gap between ring and avatar */}
                <div className="p-[2px] rounded-full bg-[#030714]">
                  <Avatar
                    src={user.avatar}
                    name={user.name}
                    size="sm"
                    className="ring-0"
                  />
                </div>

                {/* "+" button for own slot */}
                {isOwn && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 bg-cyan-500 rounded-full flex items-center justify-center border-2 border-[#030714]">
                    <PlusCircle className="w-3 h-3 text-white" />
                  </span>
                )}

                {/* Online indicator dot for others */}
                {!isOwn && user.status === 'online' && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#030714] shadow-[0_0_6px_#10b981]" />
                )}

                {/* Viewed checkmark */}
                {!isOwn && isViewed && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-slate-700 rounded-full border border-slate-500 flex items-center justify-center">
                    <Eye className="w-2 h-2 text-slate-400" />
                  </span>
                )}

                {/* "New" pulse ring overlay */}
                {isNew && (
                  <span className="absolute inset-0 rounded-full border-2 border-cyan-400/50 animate-ping pointer-events-none" />
                )}
              </div>

              <span className={cn(
                'text-[10px] font-medium truncate max-w-[52px] transition-colors',
                isNew
                  ? 'text-cyan-300 group-hover:text-cyan-200'
                  : isViewed
                    ? 'text-on-surface-variant/60'
                    : 'text-on-surface-variant group-hover:text-cyan-300',
              )}>
                {isOwn ? 'Add Yours' : user.name.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Backend note toast */}
      {showBackendNote && (
        <div className="absolute top-full left-0 right-0 mt-1 z-20 mx-4 p-3 bg-surface-container-lowest border border-amber-400/40 rounded-xl shadow-xl text-xs text-amber-200 animate-in fade-in slide-in-from-top-2 duration-200 flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-300 mb-0.5">Moments storage not yet set up</p>
            <p className="text-amber-200/80">
              The UI is ready! To enable real moment creation, add a{' '}
              <code className="text-cyan-300">moments</code> collection in your DB, a{' '}
              <code className="text-cyan-300">POST /api/moments</code> endpoint, and 24-hour expiry logic.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
