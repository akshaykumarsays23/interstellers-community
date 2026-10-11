'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/lib/store';
import { Zap, RotateCcw, Award, ArrowLeft, ShieldAlert, Sparkles, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReactionWarpGameProps {
  onBack: () => void;
}

type GameState = 'idle' | 'countdown' | 'waiting' | 'ready' | 'result' | 'false_start';

export const ReactionWarpGame: React.FC<ReactionWarpGameProps> = ({ onBack }) => {
  const { recordGameScore } = useApp();
  const [gameState, setGameState] = useState<GameState>('idle');
  const [countdown, setCountdown] = useState<number>(3);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [earnedXP, setEarnedXP] = useState<number>(0);
  const [earnedCredits, setEarnedCredits] = useState<number>(0);

  const startTimeRef = useRef<number>(0);
  const timerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerTimeoutRef.current) clearTimeout(timerTimeoutRef.current);
    };
  }, []);

  const startGame = () => {
    setReactionTime(null);
    setGameState('countdown');
    setCountdown(3);

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        setGameState('waiting');
        scheduleWarpSignal();
      }
    }, 800);
  };

  const scheduleWarpSignal = () => {
    const randomDelay = Math.floor(Math.random() * 2700) + 1800; // 1.8s to 4.5s delay
    timerTimeoutRef.current = setTimeout(() => {
      startTimeRef.current = performance.now();
      setGameState('ready');
    }, randomDelay);
  };

  const handleAction = async () => {
    if (gameState === 'idle') {
      startGame();
      return;
    }

    if (gameState === 'countdown' || gameState === 'waiting') {
      // FALSE WARP PENALTY
      if (timerTimeoutRef.current) clearTimeout(timerTimeoutRef.current);
      setGameState('false_start');
      return;
    }

    if (gameState === 'ready') {
      const endTime = performance.now();
      const elapsed = Math.round(endTime - startTimeRef.current);
      setReactionTime(elapsed);
      setGameState('result');

      if (!bestTime || elapsed < bestTime) {
        setBestTime(elapsed);
      }

      // Record score & earn rewards
      const { xpEarned, starCreditsEarned } = await recordGameScore('reaction_warp', elapsed, `${elapsed} ms reaction time`);
      setEarnedXP(xpEarned);
      setEarnedCredits(starCreditsEarned);
    }
  };

  const getRating = (ms: number) => {
    if (ms < 200) return { label: '⚡ Quantum Speed (Godlike)', color: 'text-cyan-400 border-cyan-400/50 bg-cyan-950/40' };
    if (ms < 270) return { label: '🚀 Warp Pilot (Pro)', color: 'text-emerald-400 border-emerald-400/50 bg-emerald-950/40' };
    if (ms < 370) return { label: '🛰️ Sub-Light Flight (Good)', color: 'text-amber-400 border-amber-400/50 bg-amber-950/40' };
    return { label: '☄️ Cosmic Drift (Average)', color: 'text-purple-400 border-purple-400/50 bg-purple-950/40' };
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-3xl overflow-hidden border border-outline-variant/60 shadow-2xl">
      {/* Header Bar */}
      <div className="p-4 bg-surface-container-low border-b border-outline-variant/60 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Arcade</span>
        </button>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
          <h2 className="font-heading font-bold text-sm sm:text-base text-on-surface">⚡ REACTION WARP</h2>
        </div>
        {bestTime ? (
          <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/40 px-3 py-1 rounded-full border border-amber-500/30">
            <Trophy className="w-3.5 h-3.5" />
            <span>Best: {bestTime} ms</span>
          </div>
        ) : (
          <span className="text-xs text-on-surface-variant">Best: -- ms</span>
        )}
      </div>

      {/* Main Interactive Warp Screen */}
      <div
        onClick={handleAction}
        className={cn(
          'flex-1 flex flex-col items-center justify-center p-6 text-center select-none cursor-pointer transition-all duration-300 relative overflow-hidden',
          gameState === 'ready' && 'bg-gradient-to-br from-cyan-600 via-indigo-600 to-purple-700 animate-pulse shadow-[inset_0_0_80px_rgba(34,211,238,0.8)]',
          gameState === 'waiting' && 'bg-slate-950 text-cyan-300',
          gameState === 'false_start' && 'bg-rose-950/90 text-rose-200 border-4 border-rose-500',
          gameState === 'result' && 'bg-surface-bright',
          gameState === 'idle' && 'bg-surface-container-low/80'
        )}
      >
        {/* Idle State */}
        {gameState === 'idle' && (
          <div className="flex flex-col items-center gap-4 max-w-md">
            <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg animate-bounce">
              <Zap className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-on-surface">Ready to test your warp speed?</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Click anywhere when you see the bright <strong className="text-cyan-400">🚀 WARP NOW!</strong> signal.
              Clicking early triggers a False Warp penalty.
            </p>
            <button className="mt-2 px-8 py-3 rounded-2xl bg-cyan-500 text-black font-extrabold text-sm hover:bg-cyan-400 transition-all shadow-lg hover:scale-105">
              START REACTION WARP ⚡
            </button>
          </div>
        )}

        {/* Countdown */}
        {gameState === 'countdown' && (
          <div className="flex flex-col items-center gap-3">
            <span className="text-7xl font-extrabold text-cyan-400 animate-ping">{countdown}</span>
            <p className="text-sm text-cyan-200 font-semibold tracking-widest uppercase">Prepare your triggers...</p>
          </div>
        )}

        {/* Waiting for Signal */}
        {gameState === 'waiting' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-cyan-400/30 border-t-cyan-400 animate-spin" />
            <h3 className="text-2xl font-black text-cyan-300 tracking-wider">WAIT FOR WARP...</h3>
            <p className="text-xs text-cyan-400/70 font-mono">Do not click until signal flashes!</p>
          </div>
        )}

        {/* READY WARP SIGNAL! */}
        {gameState === 'ready' && (
          <div className="flex flex-col items-center gap-4 animate-bounce">
            <h1 className="text-5xl sm:text-7xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]">
              🚀 WARP NOW!
            </h1>
            <p className="text-lg text-cyan-100 font-extrabold tracking-widest uppercase">TAP / CLICK IMMEDIATELY!</p>
          </div>
        )}

        {/* False Start Penalty */}
        {gameState === 'false_start' && (
          <div className="flex flex-col items-center gap-3 max-w-sm">
            <ShieldAlert className="w-16 h-16 text-rose-400 animate-bounce" />
            <h3 className="text-2xl font-black text-rose-300">⚠️ FALSE WARP — PENALTY!</h3>
            <p className="text-xs text-rose-200">You clicked before the Warp signal appeared! Attempt invalidated.</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              className="mt-4 px-6 py-2.5 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-400 transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        )}

        {/* Result Screen */}
        {gameState === 'result' && reactionTime && (
          <div className="flex flex-col items-center gap-4 max-w-md w-full bg-surface-container p-6 rounded-3xl border border-outline-variant/60 shadow-xl">
            <span className="text-xs text-on-surface-variant uppercase font-bold tracking-widest">Reaction Speed</span>
            <div className="text-6xl font-black text-primary font-mono tracking-tight">
              {reactionTime} <span className="text-2xl text-on-surface-variant font-normal">ms</span>
            </div>

            {/* Rating badge */}
            <div className={cn('px-4 py-1.5 rounded-full border text-xs font-bold', getRating(reactionTime).color)}>
              {getRating(reactionTime).label}
            </div>

            {/* Earned Rewards */}
            <div className="flex items-center gap-4 py-3 px-6 bg-surface-container-high rounded-2xl border border-white/10 w-full justify-around mt-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="text-xs text-on-surface-variant font-semibold">XP Earned</div>
                  <div className="text-sm font-bold text-amber-400">+{earnedXP} XP</div>
                </div>
              </div>
              <div className="h-8 w-px bg-outline-variant/50" />
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-cyan-400" />
                <div>
                  <div className="text-xs text-on-surface-variant font-semibold">Star Credits</div>
                  <div className="text-sm font-bold text-cyan-400">+{earnedCredits} ⭐</div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 w-full mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startGame();
                }}
                className="flex-1 py-3 rounded-2xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-hover transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                PLAY AGAIN
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBack();
                }}
                className="py-3 px-5 rounded-2xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-semibold text-xs border border-outline-variant/40"
              >
                BACK TO ARCADE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
