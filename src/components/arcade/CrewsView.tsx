'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { Shield, Users, Sparkles, Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export const CrewsView: React.FC = () => {
  const { crews, toggleJoinCrew } = useApp();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-heading text-on-surface flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            GALACTIC CREWS & SQUADRONS
          </h2>
          <p className="text-xs text-on-surface-variant">Team up with fellow travelers, pool crew XP, and conquer crew leaderboards</p>
        </div>

        <button className="px-4 py-2 rounded-2xl bg-cyan-500 text-black font-extrabold text-xs hover:bg-cyan-400 transition-all flex items-center gap-1.5 shrink-0 shadow-md">
          <Plus className="w-4 h-4" /> Create New Crew
        </button>
      </div>

      {/* Grid of Crews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {crews.map((crew) => (
          <div
            key={crew.id}
            className={cn(
              'p-5 rounded-3xl border transition-all flex flex-col justify-between gap-4 bg-surface-container',
              crew.isJoined ? 'border-cyan-500/50 ring-1 ring-cyan-500/30' : 'border-outline-variant/40 hover:border-cyan-500/30'
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-cyan-500/30 flex items-center justify-center text-3xl shadow-sm">
                  {crew.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface">{crew.name}</h3>
                  <p className="text-xs text-cyan-400 font-semibold">{crew.tagline}</p>
                </div>
              </div>

              <button
                onClick={() => toggleJoinCrew(crew.id)}
                className={cn(
                  'px-4 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shrink-0',
                  crew.isJoined
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'bg-surface-container-high hover:bg-surface-bright text-on-surface border border-outline-variant/40'
                )}
              >
                {crew.isJoined ? <Check className="w-3.5 h-3.5" /> : null}
                {crew.isJoined ? 'Joined Crew' : 'Join Crew'}
              </button>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">{crew.description}</p>

            <div className="flex items-center justify-between text-xs pt-3 border-t border-outline-variant/30 text-on-surface-variant">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 font-semibold">
                  <Users className="w-3.5 h-3.5 text-social-blue" /> {crew.membersCount} Members
                </span>
                <span className="flex items-center gap-1 font-bold text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" /> {crew.totalXP.toLocaleString()} XP Pool
                </span>
              </div>
              <span className="text-[10px]">Leader: @{crew.leaderHandle}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
