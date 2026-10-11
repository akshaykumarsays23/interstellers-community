'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { Trophy, CheckCircle2, Lock, Sparkles, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

export const AchievementsGallery: React.FC = () => {
  const { achievements, unlockAchievement } = useApp();

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold font-heading text-on-surface flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            GALACTIC ACHIEVEMENTS & CRESTS
          </h2>
          <p className="text-xs text-on-surface-variant">Unlock achievements across games, social signals, and streaks</p>
        </div>
        <div className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-extrabold text-xs">
          Unlocked: {unlockedCount} / {achievements.length}
        </div>
      </div>

      {/* Grid of Achievements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {achievements.map((ach) => (
          <div
            key={ach.id}
            onClick={() => {
              if (!ach.isUnlocked) unlockAchievement(ach.id);
            }}
            className={cn(
              'p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative overflow-hidden group cursor-pointer',
              ach.isUnlocked
                ? 'bg-gradient-to-br from-amber-950/20 via-surface-container to-surface-container border-amber-500/40 shadow-md'
                : 'bg-surface-container/60 border-outline-variant/40 opacity-70 hover:opacity-100 hover:border-amber-500/30'
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border shrink-0',
                    ach.isUnlocked
                      ? 'bg-amber-500/20 border-amber-500/50 shadow-xs'
                      : 'bg-surface-container-high border-white/10 grayscale'
                  )}
                >
                  {ach.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                    {ach.title}
                  </h4>
                  <p className="text-xs text-on-surface-variant leading-snug">{ach.description}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-outline-variant/30">
              <div className="flex items-center gap-3">
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> +{ach.rewardXP} XP
                </span>
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> +{ach.rewardStarCredits} ⭐
                </span>
              </div>
              {ach.isUnlocked ? (
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked
                </span>
              ) : (
                <span className="text-[10px] font-bold text-on-surface-variant flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Locked
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
