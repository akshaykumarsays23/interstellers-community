'use client';

import React, { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { PostCard } from '@/components/feed/PostCard';
import type { Post } from '@/lib/types';
import { cn } from '@/lib/utils';

type BoardId = 'all_time' | 'houses' | 'weekly' | 'singers' | 'dancers' | 'challenge';
type HouseId = 'marvel' | 'dc' | 'pokemon' | 'power_rangers';
type LeaderboardEntry = {
  rank: number;
  score: number;
  house: HouseId | null;
  name?: string;
  handle?: string;
  avatar?: string;
  memberCount?: number;
  isCurrent?: boolean;
};

const HOUSE_NAMES: Record<HouseId, string> = {
  marvel: 'Marvel House',
  dc: 'DC House',
  pokemon: 'Pokémon House',
  power_rangers: 'Power Rangers House',
};

const BOARDS: { id: BoardId; label: string }[] = [
  { id: 'all_time', label: 'All-time' },
  { id: 'houses', label: 'Four Houses' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'singers', label: 'Cosmic Singers' },
  { id: 'dancers', label: 'Cosmic Dancers' },
  { id: 'challenge', label: 'House Challenge' },
];

export const LeaderboardsView: React.FC = () => {
  const [activeBoard, setActiveBoard] = useState<BoardId>('all_time');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [performances, setPerformances] = useState<Post[]>([]);
  const [performanceError, setPerformanceError] = useState<string | null>(null);
  const [performancesLoading, setPerformancesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/arcade?type=community_leaderboard&board=${activeBoard}`,
          { cache: 'no-store', signal: controller.signal }
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Leaderboard could not be loaded.');
        setEntries(data.entries);
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === 'AbortError') return;
        setError(loadError instanceof Error ? loadError.message : 'Leaderboard could not be loaded.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [activeBoard]);

  useEffect(() => {
    if (activeBoard !== 'singers' && activeBoard !== 'dancers') {
      setPerformances([]);
      setPerformanceError(null);
      return;
    }
    const controller = new AbortController();
    const category = activeBoard === 'singers' ? 'singing' : 'dancing';
    const load = async () => {
      setPerformancesLoading(true);
      setPerformanceError(null);
      try {
        const response = await fetch(`/api/posts?category=${category}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Performances could not be loaded.');
        setPerformances(data.posts);
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === 'AbortError') return;
        setPerformanceError(loadError instanceof Error ? loadError.message : 'Performances could not be loaded.');
      } finally {
        if (!controller.signal.aborted) setPerformancesLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [activeBoard]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-on-surface">
            <Trophy className="h-5 w-5 text-amber-400" />
            GALACTIC LEADERBOARDS & RANKS
          </h2>
          <p className="text-xs text-on-surface-variant">
            Rankings are calculated from persisted eligible point transactions.
            Weekly totals start Monday at 00:00 UTC.
          </p>
        </div>

        <div className="flex gap-1.5 overflow-x-auto rounded-2xl border border-outline-variant/40 bg-surface-container p-1 custom-scrollbar">
          {BOARDS.map((board) => (
            <button
              key={board.id}
              type="button"
              onClick={() => setActiveBoard(board.id)}
              className={cn(
                'whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all',
                activeBoard === board.id
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              )}
            >
              {board.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </p>
      )}
      {(activeBoard === 'singers' || activeBoard === 'dancers') && (
        <section className="space-y-3" aria-label={activeBoard === 'singers' ? 'Cosmic Singer performances' : 'Cosmic Dancer performances'}>
          <h3 className="font-heading text-sm font-bold text-on-surface">
            {activeBoard === 'singers' ? 'Cosmic Singer performances' : 'Cosmic Dancer performances'}
          </h3>
          {performanceError && (
            <p role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {performanceError}
            </p>
          )}
          {performancesLoading ? (
            <p role="status" className="py-6 text-center text-sm text-on-surface-variant">Loading performances...</p>
          ) : performances.length === 0 && !performanceError ? (
            <p className="rounded-2xl border border-outline-variant/40 bg-surface-container p-6 text-center text-sm text-on-surface-variant">
              No eligible performances have been shared yet.
            </p>
          ) : performances.map((post) => <PostCard key={post.id} post={post} />)}
        </section>
      )}
      {loading ? (
        <p role="status" className="py-8 text-center text-sm text-on-surface-variant">Loading leaderboard...</p>
      ) : !error && entries.length === 0 ? (
        <p className="rounded-2xl border border-outline-variant/40 bg-surface-container p-8 text-center text-sm text-on-surface-variant">
          No eligible point activity has been recorded for this leaderboard yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {entries.map((entry) => {
            const isHouseEntry = activeBoard === 'houses' || activeBoard === 'challenge';
            const houseName = entry.house ? HOUSE_NAMES[entry.house] : null;
            return (
              <div
                key={entry.house || `${activeBoard}-${entry.rank}`}
                className={cn(
                  'flex items-center justify-between gap-4 rounded-2xl border p-4 transition-all',
                  entry.isCurrent
                    ? 'border-primary/40 bg-gradient-to-r from-primary-container/20 via-surface-container to-social-blue/10 ring-1 ring-primary/30'
                    : 'border-outline-variant/40 bg-surface-container hover:bg-surface-container-high'
                )}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3.5">
                  <span className={cn(
                    'w-12 shrink-0 text-center font-mono text-sm font-black',
                    entry.rank === 1 ? 'text-amber-400' : 'text-on-surface-variant'
                  )}>
                    #{entry.rank}
                  </span>
                  {isHouseEntry ? (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-outline-variant/50 bg-surface-container-high text-lg">
                      {entry.house === 'marvel' ? '🛡️' :
                        entry.house === 'dc' ? '🦇' :
                          entry.house === 'pokemon' ? '⚡' : '🦖'}
                    </div>
                  ) : (
                    <Avatar src={entry.avatar} name={entry.name || 'Community member'} size="md" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-bold text-on-surface">
                        {isHouseEntry ? houseName : entry.name}
                      </h3>
                      {entry.isCurrent && (
                        <span className="rounded-md bg-primary px-2 py-0.5 text-[9px] font-extrabold uppercase text-on-primary">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
                      {!isHouseEntry && entry.handle && <span>@{entry.handle}</span>}
                      {!isHouseEntry && houseName && <Badge variant="cosmic" size="sm">{houseName}</Badge>}
                      {isHouseEntry && entry.memberCount !== undefined && (
                        <span>{entry.memberCount.toLocaleString()} members</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[10px] font-medium uppercase text-on-surface-variant">
                    {activeBoard === 'houses' || activeBoard === 'challenge' ? 'House points' : 'Points'}
                  </div>
                  <div className="font-mono text-sm font-black text-primary">
                    {entry.score.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
