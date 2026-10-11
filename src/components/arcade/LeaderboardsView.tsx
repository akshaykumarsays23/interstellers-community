'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Trophy, Users, Shield, Calendar, Award } from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { cn } from '@/lib/utils';

export const LeaderboardsView: React.FC = () => {
  const { leaderboard, currentUser, gamificationState } = useApp();
  const [activeTab, setActiveTab] = useState<'global' | 'friends' | 'crew' | 'weekly' | 'season'>('global');

  // Insert or sync currentUser in leaderboard display
  const myEntry = {
    rank: 1,
    userId: currentUser.id,
    name: currentUser.name,
    handle: currentUser.handle,
    avatar: currentUser.avatar,
    travelerLevel: gamificationState.travelerLevel,
    score: gamificationState.xp * 2 + 12000,
    starCredits: gamificationState.starCredits,
    streak: gamificationState.currentStreak,
    badge: '👑 Star Captain',
    crewName: '🚀 Space Wolves',
  };

  const list = [myEntry, ...leaderboard.filter((l) => l.userId !== currentUser.id)].sort((a, b) => b.score - a.score);
  list.forEach((item, idx) => {
    item.rank = idx + 1;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-heading text-on-surface flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            GALACTIC LEADERBOARDS & RANKS
          </h2>
          <p className="text-xs text-on-surface-variant">Real-time score rankings across the Interstellers galaxy</p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface-container border border-outline-variant/40 overflow-x-auto custom-scrollbar">
          {[
            { id: 'global', label: 'Global 🌌', icon: Trophy },
            { id: 'friends', label: 'Friends 👥', icon: Users },
            { id: 'crew', label: 'Crew 🚀', icon: Shield },
            { id: 'weekly', label: 'Weekly 📅', icon: Calendar },
            { id: 'season', label: 'Season 🏆', icon: Award },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="flex flex-col gap-2.5">
        {list.map((entry) => {
          const isMe = entry.userId === currentUser.id;

          let rankBadge = `#${entry.rank}`;
          if (entry.rank === 1) rankBadge = '🥇 1st';
          if (entry.rank === 2) rankBadge = '🥈 2nd';
          if (entry.rank === 3) rankBadge = '🥉 3rd';

          return (
            <div
              key={entry.userId}
              className={cn(
                'p-4 rounded-2xl border transition-all flex items-center justify-between gap-4',
                isMe
                  ? 'bg-gradient-to-r from-primary-container/20 via-surface-container to-social-blue/10 border-primary/40 ring-1 ring-primary/30 shadow-md'
                  : 'bg-surface-container border-outline-variant/40 hover:bg-surface-container-high'
              )}
            >
              {/* Rank & Profile */}
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <span
                  className={cn(
                    'w-12 text-center text-sm font-black font-mono shrink-0',
                    entry.rank === 1 && 'text-amber-400 text-base',
                    entry.rank === 2 && 'text-slate-300 text-base',
                    entry.rank === 3 && 'text-amber-600 text-base',
                    entry.rank > 3 && 'text-on-surface-variant'
                  )}
                >
                  {rankBadge}
                </span>

                <Avatar src={entry.avatar} name={entry.name} size="md" />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-on-surface truncate">{entry.name}</h4>
                    {isMe && (
                      <span className="px-2 py-0.5 rounded-md bg-primary text-on-primary text-[9px] font-extrabold uppercase">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant truncate">
                    <span>@{entry.handle}</span>
                    <span>•</span>
                    <span className="text-amber-400 font-semibold">Lvl {entry.travelerLevel}</span>
                    {entry.crewName && (
                      <>
                        <span>•</span>
                        <span className="text-cyan-400">{entry.crewName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 shrink-0 text-right">
                <div className="hidden sm:block">
                  <div className="text-[10px] text-on-surface-variant font-medium uppercase">Streak</div>
                  <div className="text-xs font-extrabold text-amber-400">{entry.streak} Days 🔥</div>
                </div>

                <div>
                  <div className="text-[10px] text-on-surface-variant font-medium uppercase">Score</div>
                  <div className="text-sm sm:text-base font-black text-primary font-mono">{entry.score.toLocaleString()}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
