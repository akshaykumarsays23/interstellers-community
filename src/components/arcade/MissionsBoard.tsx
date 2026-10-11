'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { Target, CheckCircle2, Sparkles, Award, Lock, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MissionsBoard: React.FC = () => {
  const { missions, completeMission } = useApp();

  const dailyMissions = missions.filter((m) => m.type === 'daily');
  const weeklyMissions = missions.filter((m) => m.type === 'weekly');
  const secretMissions = missions.filter((m) => m.type === 'secret');

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold font-heading text-on-surface flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            FLIGHT MISSIONS & PROTOCOLS
          </h2>
          <p className="text-xs text-on-surface-variant">Complete daily, weekly, and classified secret missions to earn XP & Star Credits</p>
        </div>
      </div>

      {/* Daily Missions */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
          <span>🔥 TODAY'S DAILY MISSIONS</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {dailyMissions.map((m) => (
            <div
              key={m.id}
              className={cn(
                'p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3',
                m.isCompleted
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-surface-container border-outline-variant/40 hover:border-amber-500/40'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{m.icon}</span>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">{m.title}</h4>
                    <p className="text-xs text-on-surface-variant leading-snug">{m.description}</p>
                  </div>
                </div>
                {m.isCompleted ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Done
                  </span>
                ) : (
                  <button
                    onClick={() => completeMission(m.id)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-all shrink-0"
                  >
                    Claim
                  </button>
                )}
              </div>

              {/* Progress Bar & Rewards */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-outline-variant/30">
                <div className="flex items-center gap-3">
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> +{m.rewardXP} XP
                  </span>
                  <span className="text-cyan-400 font-bold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> +{m.rewardStarCredits} ⭐
                  </span>
                </div>
                <span className="text-on-surface-variant font-mono">
                  {m.progress}/{m.maxProgress}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Missions */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
          <span>⚡ WEEKLY GALACTIC MISSIONS</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {weeklyMissions.map((m) => (
            <div
              key={m.id}
              className={cn(
                'p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3',
                m.isCompleted
                  ? 'bg-purple-950/20 border-purple-500/30'
                  : 'bg-surface-container border-outline-variant/40 hover:border-purple-500/40'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{m.icon}</span>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">{m.title}</h4>
                    <p className="text-xs text-on-surface-variant leading-snug">{m.description}</p>
                  </div>
                </div>
                {m.isCompleted ? (
                  <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Done
                  </span>
                ) : (
                  <button
                    onClick={() => completeMission(m.id)}
                    className="px-3 py-1.5 rounded-xl bg-purple-500 text-white font-bold text-xs hover:bg-purple-400 transition-all shrink-0"
                  >
                    Claim
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-outline-variant/30">
                <div className="flex items-center gap-3">
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> +{m.rewardXP} XP
                  </span>
                  <span className="text-cyan-400 font-bold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> +{m.rewardStarCredits} ⭐
                  </span>
                </div>
                <span className="text-on-surface-variant font-mono">
                  {m.progress}/{m.maxProgress}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Secret Classified Missions */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
          <span>🚨 CLASSIFIED SECRET MISSIONS</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {secretMissions.map((m) => (
            <div
              key={m.id}
              className={cn(
                'p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3',
                m.secretUnlocked
                  ? 'bg-rose-950/20 border-rose-500/40'
                  : 'bg-surface-container/60 border-outline-variant/40 opacity-75'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{m.secretUnlocked ? m.icon : '🔐'}</span>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">
                      {m.secretUnlocked ? m.title : '🚨 CLASSIFIED SECRET MISSION'}
                    </h4>
                    <p className="text-xs text-on-surface-variant leading-snug">
                      {m.secretUnlocked ? m.description : 'Fulfill secret galactic criteria in the network to unlock!'}
                    </p>
                  </div>
                </div>
                {m.secretUnlocked ? (
                  <button
                    onClick={() => completeMission(m.id)}
                    className="px-3 py-1.5 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-400 transition-all shrink-0"
                  >
                    Claim
                  </button>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold flex items-center gap-1 shrink-0">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                )}
              </div>

              {m.secretUnlocked && (
                <div className="flex items-center justify-between text-xs pt-1 border-t border-outline-variant/30">
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 font-bold">+ {m.rewardXP} XP</span>
                    <span className="text-cyan-400 font-bold">+ {m.rewardStarCredits} ⭐</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
