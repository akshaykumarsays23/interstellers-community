'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { GameId, GameHistory } from '@/lib/types';
import { ReactionWarpGame } from './games/ReactionWarpGame';
import { AsteroidDodgeGame } from './games/AsteroidDodgeGame';
import { CosmicQuizGame } from './games/CosmicQuizGame';
import { AlienCodeGame } from './games/AlienCodeGame';
import { MemoryGalaxyGame } from './games/MemoryGalaxyGame';
import { LeaderboardsView } from './LeaderboardsView';
import { MissionsBoard } from './MissionsBoard';
import { AchievementsGallery } from './AchievementsGallery';
import { StarCreditsStore } from './StarCreditsStore';
import { CrewsView } from './CrewsView';

import {
  Gamepad2,
  Trophy,
  Target,
  Award,
  ShoppingBag,
  Shield,
  Zap,
  Sparkles,
  Flame,
  Radio,
  RotateCcw,
  Star,
  Play,
  Clock,
  Ghost,
  ChevronDown,
  ChevronUp,
  Crown,
  History,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Ordinal helper ────────────────────────────────────────────────
function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ── Game History Panel ────────────────────────────────────────────
const GameHistoryPanel: React.FC<{ history: GameHistory | undefined }> = ({ history }) => {
  if (!history || history.plays.length === 0) {
    return (
      <p className="text-[11px] text-on-surface-variant italic text-center py-2">
        No plays yet — be the first to set a record!
      </p>
    );
  }

  // Show newest plays first (up to 10)
  const reversed = [...history.plays].reverse().slice(0, 10);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 mb-1">
        <Crown className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-[11px] font-black text-amber-400">
          Best: {history.bestScore.toLocaleString()}
        </span>
        <span className="text-[10px] text-on-surface-variant ml-auto font-mono">
          {history.totalPlays} {history.totalPlays === 1 ? 'play' : 'plays'}
        </span>
      </div>
      <div className="flex flex-col gap-0.5 max-h-40 overflow-y-auto custom-scrollbar pr-0.5">
        {reversed.map((play) => {
          const date = new Date(play.timestamp);
          const dateStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
          const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
          return (
            <div
              key={play.attempt}
              className={cn(
                'flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[10px] border transition-all',
                play.isBest
                  ? 'bg-amber-500/10 border-amber-500/40 shadow-[0_0_8px_rgba(251,191,36,0.15)]'
                  : 'bg-surface-container-high border-outline-variant/30'
              )}
            >
              <span className="text-on-surface-variant font-medium">
                {ordinal(play.attempt)} play
              </span>
              <span
                className={cn(
                  'font-black font-mono',
                  play.isBest ? 'text-amber-400' : 'text-on-surface'
                )}
              >
                {play.score.toLocaleString()}
                {play.isBest && (
                  <span className="ml-1 text-[9px] text-amber-300 font-bold">👑 BEST</span>
                )}
              </span>
              <span className="text-on-surface-variant font-mono text-[9px]">
                {dateStr} {timeStr}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────
export const ArcadeDashboard: React.FC = () => {
  const { gamificationState, arcadeGames, gameHistory, claimDailyChallenge, restoreGhostOrbit, useEmergencyWarpPass } = useApp();

  const [activeTab, setActiveTab] = useState<'games' | 'leaderboard' | 'missions' | 'achievements' | 'shop' | 'crews'>('games');
  const [activeGameId, setActiveGameId] = useState<GameId | null>(null);
  const [dailyChallengeMessage, setDailyChallengeMessage] = useState<string | null>(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState<GameId | null>(null);

  const handleClaimChallenge = () => {
    const res = claimDailyChallenge(1500);
    setDailyChallengeMessage(res.message);
    setTimeout(() => setDailyChallengeMessage(null), 4000);
  };

  // If a game is launched, render the active game component
  if (activeGameId === 'reaction_warp') {
    return <ReactionWarpGame onBack={() => setActiveGameId(null)} />;
  }
  if (activeGameId === 'asteroid_dodge') {
    return <AsteroidDodgeGame onBack={() => setActiveGameId(null)} />;
  }
  if (activeGameId === 'cosmic_quiz') {
    return <CosmicQuizGame onBack={() => setActiveGameId(null)} />;
  }
  if (activeGameId === 'alien_code') {
    return <AlienCodeGame onBack={() => setActiveGameId(null)} />;
  }
  if (activeGameId === 'memory_galaxy') {
    return <MemoryGalaxyGame onBack={() => setActiveGameId(null)} />;
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Ghost Orbit Banner */}
      {gamificationState.isGhostOrbit && (
        <div className="p-4 rounded-3xl bg-rose-950/80 border-2 border-rose-500 text-rose-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl animate-bounce">
          <div className="flex items-center gap-3">
            <Ghost className="w-8 h-8 text-rose-400 shrink-0" />
            <div>
              <h4 className="text-sm font-black">👻 GHOST ORBIT DETECTED</h4>
              <p className="text-xs text-rose-300">Your account entered Ghost Orbit due to inactivity. Restore signal stability to reactivate full discovery!</p>
            </div>
          </div>
          <button
            onClick={restoreGhostOrbit}
            className="px-5 py-2 rounded-xl bg-rose-500 text-white font-black text-xs hover:bg-rose-400 transition-all shadow-md shrink-0"
          >
            Restore Orbit Signal 🛰️
          </button>
        </div>
      )}

      {/* Top Traveler HUD Bar */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-surface-container via-surface-container-high to-surface-container border border-outline-variant/60 shadow-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
        {/* Level & XP */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-black flex flex-col items-center justify-center shadow-md shrink-0">
            <span className="text-[10px] font-extrabold uppercase tracking-widest">LEVEL</span>
            <span className="text-2xl font-black font-mono leading-none">{gamificationState.travelerLevel}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between text-xs font-bold text-on-surface mb-1">
              <span>Traveler XP</span>
              <span className="text-amber-400 font-mono">
                {gamificationState.xp.toLocaleString()} / {gamificationState.xpToNextLevel.toLocaleString()} XP
              </span>
            </div>
            <div className="w-full sm:w-64 h-2 bg-slate-800 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full transition-all"
                style={{ width: `${Math.min(100, (gamificationState.xp / gamificationState.xpToNextLevel) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metrics Pill Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[10px] text-on-surface-variant font-semibold">Signal Strength</div>
              <div className="text-xs font-black text-emerald-400 font-mono">{gamificationState.signalStrength}%</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <div className="text-[10px] text-on-surface-variant font-semibold">Orbit Stability</div>
              <div className="text-xs font-black text-cyan-400 font-mono">{gamificationState.orbitStability}%</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <div className="text-[10px] text-on-surface-variant font-semibold">Streak</div>
                <div className="text-xs font-black text-amber-400 font-mono">{gamificationState.currentStreak} Days</div>
              </div>
            </div>
            {gamificationState.emergencyWarpPasses > 0 && (
              <button
                onClick={useEmergencyWarpPass}
                className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30 hover:bg-amber-500/40"
                title="Use Emergency Warp Pass"
              >
                Pass ({gamificationState.emergencyWarpPasses})
              </button>
            )}
          </div>

          <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex items-center gap-2.5">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] text-on-surface-variant font-semibold">Star Credits</div>
              <div className="text-xs font-black text-amber-400 font-mono">{gamificationState.starCredits} ⭐</div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Galaxy Challenge Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-indigo-950/60 to-cyan-950/60 border border-cyan-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-3xl shrink-0 shadow-md">
            🌠
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-extrabold uppercase tracking-wider">
                TODAY'S GALAXY CHALLENGE
              </span>
              <span className="text-xs text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Resets in 6h 14m
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">⚡ WARP REFLEX & REACTION SPEED</h3>
            <p className="text-xs text-slate-300">Achieve sub-250ms reaction speed to claim daily rewards (+350 XP & +150 ⭐)</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveGameId('reaction_warp')}
            className="px-6 py-3 rounded-2xl bg-cyan-500 text-black font-extrabold text-xs hover:bg-cyan-400 transition-all shadow-lg flex items-center gap-2 hover:scale-105"
          >
            <Play className="w-4 h-4 fill-black" /> PLAY CHALLENGE
          </button>
          {!gamificationState.hasClaimedDailyChallenge && (
            <button
              onClick={handleClaimChallenge}
              className="px-5 py-3 rounded-2xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-all shadow-lg"
            >
              Claim Reward ⭐
            </button>
          )}
        </div>
      </div>

      {dailyChallengeMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-bold text-xs animate-fadeIn">
          {dailyChallengeMessage}
        </div>
      )}

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-surface-container border border-outline-variant/60 overflow-x-auto custom-scrollbar">
        {[
          { id: 'games', label: '🎮 Arcade Games', icon: Gamepad2 },
          { id: 'leaderboard', label: '🏆 Leaderboard', icon: Trophy },
          { id: 'missions', label: '🎯 Missions', icon: Target },
          { id: 'achievements', label: '🏅 Achievements', icon: Award },
          { id: 'shop', label: '⭐ Credit Vault', icon: ShoppingBag },
          { id: 'crews', label: '👥 Crews', icon: Shield },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap flex items-center gap-2',
              activeTab === tab.id
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Views */}
      {activeTab === 'games' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {arcadeGames.map((game) => {
            const history = gameHistory[game.id];
            const hasHistory = history && history.plays.length > 0;
            const isExpanded = expandedHistoryId === game.id;

            return (
              <div
                key={game.id}
                className="p-5 rounded-3xl border border-outline-variant/60 bg-surface-container hover:border-primary/50 transition-all flex flex-col justify-between gap-4 shadow-sm group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-white/10 flex items-center justify-center text-3xl shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                    {game.icon}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase">
                      {game.badge}
                    </span>
                    <span className="text-[10px] text-on-surface-variant mt-1 font-mono">
                      {game.playsCount} Plays
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-on-surface">{game.name}</h3>
                  <p className="text-xs text-primary font-medium">{game.subtitle}</p>
                  <p className="text-xs text-on-surface-variant leading-relaxed mt-2">{game.description}</p>
                </div>

                {/* Score row: leaderboard best + personal best */}
                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/40 gap-2">
                  <div className="flex flex-col gap-0.5">
                    <div className="text-[10px] text-on-surface-variant font-semibold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-cyan-400" />
                      Galaxy Record
                    </div>
                    <div className="text-xs font-black text-amber-400 font-mono">
                      {game.highScore.toLocaleString()}
                    </div>
                  </div>

                  {hasHistory && (
                    <div className="flex flex-col gap-0.5 items-center">
                      <div className="text-[10px] text-on-surface-variant font-semibold flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-400" />
                        Your Best
                      </div>
                      <div className="text-xs font-black text-emerald-400 font-mono">
                        {history.bestScore.toLocaleString()}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setActiveGameId(game.id)}
                    className="px-5 py-2 rounded-2xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-hover transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-on-primary" /> PLAY
                  </button>
                </div>

                {/* History toggle button */}
                <button
                  onClick={() => setExpandedHistoryId(isExpanded ? null : game.id)}
                  className={cn(
                    'flex items-center justify-between w-full px-3 py-2 rounded-2xl text-[11px] font-bold border transition-all',
                    isExpanded
                      ? 'bg-surface-container-high border-outline-variant/60 text-on-surface'
                      : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:border-outline-variant/60'
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" />
                    {hasHistory
                      ? `Play History (${history.totalPlays})`
                      : 'No history yet'}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Expanded History Panel */}
                {isExpanded && (
                  <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/40">
                    <GameHistoryPanel history={history} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'leaderboard' && <LeaderboardsView />}
      {activeTab === 'missions' && <MissionsBoard />}
      {activeTab === 'achievements' && <AchievementsGallery />}
      {activeTab === 'shop' && <StarCreditsStore />}
      {activeTab === 'crews' && <CrewsView />}
    </div>
  );
};
