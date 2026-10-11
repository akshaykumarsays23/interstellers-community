'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { Sparkles, ArrowLeft, RotateCcw, Clock, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemoryGalaxyGameProps {
  onBack: () => void;
}

interface CardItem {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const SYMBOLS_POOL = ['🚀', '🪐', '🌙', '☄️', '👽', '⭐', '🛰️', '🌌', '👾', '🌀'];

export const MemoryGalaxyGame: React.FC<MemoryGalaxyGameProps> = ({ onBack }) => {
  const { recordGameScore } = useApp();

  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Cosmic'>('Medium');
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [earnedXP, setEarnedXP] = useState<number>(0);
  const [earnedCredits, setEarnedCredits] = useState<number>(0);
  const [finalScore, setFinalScore] = useState<number>(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing') {
      timer = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [gameState]);

  const initGame = (diff: 'Easy' | 'Medium' | 'Cosmic' = difficulty) => {
    setDifficulty(diff);
    let pairCount = 6;
    if (diff === 'Medium') pairCount = 8;
    if (diff === 'Cosmic') pairCount = 10;

    const selectedSymbols = SYMBOLS_POOL.slice(0, pairCount);
    const combined = [...selectedSymbols, ...selectedSymbols];

    // Shuffle cards
    const shuffled = combined
      .sort(() => Math.random() - 0.5)
      .map((symbol, idx) => ({
        id: idx,
        symbol,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(shuffled);
    setFlippedIds([]);
    setMoves(0);
    setTimerSeconds(0);
    setGameState('playing');
  };

  const handleCardClick = (card: CardItem) => {
    if (gameState !== 'playing') return;
    if (card.isFlipped || card.isMatched || flippedIds.length >= 2) return;

    const nextCards = cards.map((c) => (c.id === card.id ? { ...c, isFlipped: true } : c));
    setCards(nextCards);

    const newFlipped = [...flippedIds, card.id];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const firstCard = nextCards.find((c) => c.id === newFlipped[0]);
      const secondCard = nextCards.find((c) => c.id === newFlipped[1]);

      if (firstCard && secondCard && firstCard.symbol === secondCard.symbol) {
        // MATCH!
        setTimeout(() => {
          const matchedCards = nextCards.map((c) =>
            c.id === firstCard.id || c.id === secondCard.id ? { ...c, isMatched: true } : c
          );
          setCards(matchedCards);
          setFlippedIds([]);

          // Check if all matched
          if (matchedCards.every((c) => c.isMatched)) {
            finishGame(moves + 1, timerSeconds);
          }
        }, 400);
      } else {
        // MISMATCH - Flip back
        setTimeout(() => {
          setCards(nextCards.map((c) => (newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c)));
          setFlippedIds([]);
        }, 900);
      }
    }
  };

  const finishGame = async (finalMoves: number, seconds: number) => {
    setGameState('finished');
    const calculatedScore = Math.max(200, 2000 - finalMoves * 30 - seconds * 15);
    setFinalScore(calculatedScore);

    const { xpEarned, starCreditsEarned } = await recordGameScore(
      'memory_galaxy',
      calculatedScore,
      `Matched all pairs in ${finalMoves} moves & ${seconds}s`
    );
    setEarnedXP(xpEarned);
    setEarnedCredits(starCreditsEarned);
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-3xl overflow-hidden border border-outline-variant/60 shadow-2xl">
      {/* Header */}
      <div className="p-4 bg-surface-container-low border-b border-outline-variant/60 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Arcade</span>
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          <h2 className="font-heading font-bold text-sm sm:text-base text-on-surface">🧠 MEMORY GALAXY</h2>
        </div>
        {gameState === 'playing' ? (
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="text-indigo-400">Moves: {moves}</span>
            <span className="text-amber-400 flex items-center gap-1 bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-500/30">
              <Clock className="w-3 h-3" /> {timerSeconds}s
            </span>
          </div>
        ) : (
          <span className="text-xs text-on-surface-variant">Difficulty: {difficulty}</span>
        )}
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-surface-container-low/60 relative">
        {/* Idle Start State */}
        {gameState === 'idle' && (
          <div className="flex flex-col items-center text-center max-w-md gap-4">
            <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xl mb-2 animate-bounce">
              <Sparkles className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-on-surface">Cosmic Memory Challenge</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Match celestial card pairs in minimum moves. Select your difficulty tier:
            </p>
            <div className="flex items-center gap-2 my-2">
              {(['Easy', 'Medium', 'Cosmic'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-xs font-bold transition-all border',
                    difficulty === diff
                      ? 'bg-indigo-500 text-white border-indigo-400 shadow-md'
                      : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/40 text-on-surface-variant'
                  )}
                >
                  {diff}
                </button>
              ))}
            </div>
            <button
              onClick={() => initGame()}
              className="mt-2 px-8 py-3 rounded-2xl bg-indigo-500 text-white font-extrabold text-sm hover:bg-indigo-400 transition-all shadow-xl hover:scale-105"
            >
              START MEMORY MATCH 🌌
            </button>
          </div>
        )}

        {/* Game Grid */}
        {gameState === 'playing' && (
          <div
            className={cn(
              'grid gap-3 max-w-lg w-full',
              difficulty === 'Easy' && 'grid-cols-4 sm:grid-cols-4',
              difficulty === 'Medium' && 'grid-cols-4 sm:grid-cols-4',
              difficulty === 'Cosmic' && 'grid-cols-5 sm:grid-cols-5'
            )}
          >
            {cards.map((card) => {
              const showSymbol = card.isFlipped || card.isMatched;

              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className={cn(
                    'aspect-square rounded-2xl border flex items-center justify-center text-3xl font-extrabold transition-all duration-300 transform select-none shadow-md',
                    showSymbol
                      ? 'bg-indigo-950/80 border-indigo-400 text-white scale-100 rotate-0'
                      : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/40 hover:scale-105 hover:border-indigo-500/50'
                  )}
                >
                  {showSymbol ? card.symbol : '❓'}
                </button>
              );
            })}
          </div>
        )}

        {/* Finished Screen */}
        {gameState === 'finished' && (
          <div className="flex flex-col items-center text-center max-w-md w-full p-6 bg-surface-container rounded-3xl border border-outline-variant/60 shadow-2xl">
            <h3 className="text-3xl font-black text-indigo-400 mb-2">🎉 ALL PAIRS MATCHED!</h3>
            <p className="text-xs text-on-surface-variant">Cosmic memory training completed</p>

            <div className="my-6 p-4 rounded-2xl bg-surface-container-high border border-white/10 w-full flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant">Total Moves</span>
                <span className="text-indigo-300 font-extrabold text-sm">{moves}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant">Time Taken</span>
                <span className="text-cyan-400 font-bold">{timerSeconds}s</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant">Calculated Score</span>
                <span className="text-amber-400 font-black text-lg font-mono">{finalScore}</span>
              </div>
              <div className="h-px bg-outline-variant/40 my-1" />
              <div className="flex justify-around items-center pt-1 text-xs">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Sparkles className="w-4 h-4" /> +{earnedXP} XP
                </div>
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                  <Award className="w-4 h-4" /> +{earnedCredits} ⭐
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full">
              <button
                onClick={() => initGame()}
                className="flex-1 py-3 rounded-2xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-hover transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> PLAY AGAIN
              </button>
              <button
                onClick={onBack}
                className="py-3 px-5 rounded-2xl bg-surface-container-high text-on-surface font-semibold text-xs border border-outline-variant/40"
              >
                ARCADE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
