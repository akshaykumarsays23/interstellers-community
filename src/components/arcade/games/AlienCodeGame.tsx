'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Cpu, ArrowLeft, CheckCircle2, XCircle, Sparkles, Award, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlienCodeGameProps {
  onBack: () => void;
}

interface Puzzle {
  id: number;
  levelName: 'Easy' | 'Medium' | 'Hard' | 'Cosmic';
  prompt: string;
  sequence: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

const PUZZLES: Puzzle[] = [
  {
    id: 1,
    levelName: 'Easy',
    prompt: 'Find the next number in the alien warp sequence:',
    sequence: '2  •  4  •  8  •  16  •  [ ? ]',
    options: ['24', '32', '64', '20'],
    correctAnswer: '32',
    explanation: 'Each number doubles the previous term (2^n pattern).',
  },
  {
    id: 2,
    levelName: 'Easy',
    prompt: 'Decipher the recurring cosmic symbol pattern:',
    sequence: '🚀  •  🪐  •  🚀  •  🪐  •  [ ? ]',
    options: ['👽', '🚀', '🪐', '⭐'],
    correctAnswer: '🚀',
    explanation: 'Alternating sequence of Rocket and Planet symbols.',
  },
  {
    id: 3,
    levelName: 'Medium',
    prompt: 'Solve the Fibonacci space signal equation:',
    sequence: '1  •  1  •  2  •  3  •  5  •  8  •  [ ? ]',
    options: ['11', '12', '13', '15'],
    correctAnswer: '13',
    explanation: 'Fibonacci sequence: 5 + 8 = 13.',
  },
  {
    id: 4,
    levelName: 'Medium',
    prompt: 'Complete the prime number orbital coordinate:',
    sequence: '2  •  3  •  5  •  7  •  11  •  [ ? ]',
    options: ['13', '14', '15', '17'],
    correctAnswer: '13',
    explanation: 'Sequence of prime numbers.',
  },
  {
    id: 5,
    levelName: 'Hard',
    prompt: 'Calculate the exponential power of Gargantua:',
    sequence: '3  •  9  •  27  •  81  •  [ ? ]',
    options: ['162', '243', '324', '108'],
    correctAnswer: '243',
    explanation: 'Powers of 3 (3^5 = 243).',
  },
  {
    id: 6,
    levelName: 'Cosmic',
    prompt: 'Decrypt the 5D Tesseract binary matrix:',
    sequence: '101  •  110  •  111  •  1000  •  [ ? ]',
    options: ['1001', '1010', '1100', '10001'],
    correctAnswer: '1001',
    explanation: 'Binary representation of numbers 5, 6, 7, 8, 9 (9 = 1001 in binary).',
  },
];

export const AlienCodeGame: React.FC<AlienCodeGameProps> = ({ onBack }) => {
  const { recordGameScore } = useApp();

  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'review' | 'finished'>('idle');
  const [earnedXP, setEarnedXP] = useState<number>(0);
  const [earnedCredits, setEarnedCredits] = useState<number>(0);

  const currentPuzzle = PUZZLES[currentIdx];

  const startGame = () => {
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setSelectedOption(null);
    setGameState('playing');
  };

  const handleSelectOption = (opt: string) => {
    if (gameState !== 'playing') return;
    setSelectedOption(opt);
    setGameState('review');

    const isCorrect = opt === currentPuzzle.correctAnswer;
    let addedScore = 0;
    if (isCorrect) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      addedScore = 200 + nextStreak * 50;
      setScore((s) => s + addedScore);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      if (currentIdx + 1 < PUZZLES.length) {
        setCurrentIdx((i) => i + 1);
        setSelectedOption(null);
        setGameState('playing');
      } else {
        finishGame(score + addedScore);
      }
    }, 1500);
  };

  const finishGame = async (finalScore: number) => {
    setGameState('finished');
    const { xpEarned, starCreditsEarned } = await recordGameScore(
      'alien_code',
      finalScore,
      `Completed all 6 Alien Code decryption tiers!`
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
          <Cpu className="w-5 h-5 text-emerald-400 animate-pulse" />
          <h2 className="font-heading font-bold text-sm sm:text-base text-on-surface">🧩 ALIEN CODE</h2>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-emerald-400 font-bold">Streak: {streak}🔥</span>
          <span className="text-amber-400 font-bold">Score: {score}</span>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-950 relative">
        {/* Start Overlay */}
        {gameState === 'idle' && (
          <div className="flex flex-col items-center text-center max-w-md gap-4">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl mb-2 animate-bounce">
              <Cpu className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-white">Decrypt Alien Logic Sequences</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Crack logic matrices, number series, and Fibonacci space signals across 4 difficulty levels: Easy → Medium → Hard → Cosmic.
            </p>
            <button
              onClick={startGame}
              className="mt-2 px-8 py-3 rounded-2xl bg-emerald-500 text-black font-extrabold text-sm hover:bg-emerald-400 transition-all shadow-xl hover:scale-105"
            >
              DECRYPT ALIEN CODE 🧩
            </button>
          </div>
        )}

        {/* Puzzle View */}
        {(gameState === 'playing' || gameState === 'review') && (
          <div className="flex flex-col max-w-lg w-full gap-6">
            {/* Level Tier Badge */}
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Tier: {currentPuzzle.levelName}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Puzzle {currentIdx + 1} of {PUZZLES.length}
              </span>
            </div>

            {/* Prompt Card */}
            <div className="p-6 rounded-3xl bg-surface-container border border-emerald-500/30 shadow-2xl text-center flex flex-col gap-4">
              <p className="text-xs text-slate-300 font-medium">{currentPuzzle.prompt}</p>
              <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-400/40 text-2xl font-black text-emerald-400 tracking-widest font-mono">
                {currentPuzzle.sequence}
              </div>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-2 gap-3">
              {currentPuzzle.options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                const isCorrect = opt === currentPuzzle.correctAnswer;
                const showFeedback = gameState === 'review';

                return (
                  <button
                    key={idx}
                    disabled={gameState === 'review'}
                    onClick={() => handleSelectOption(opt)}
                    className={cn(
                      'p-4 rounded-2xl text-center text-lg font-bold border transition-all flex items-center justify-center gap-2 font-mono',
                      showFeedback && isCorrect && 'bg-emerald-950/90 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/50',
                      showFeedback && isSelected && !isCorrect && 'bg-rose-950/90 border-rose-500 text-rose-300',
                      !showFeedback && 'bg-surface-container hover:bg-surface-container-high border-outline-variant/40 text-on-surface hover:border-emerald-500/50'
                    )}
                  >
                    <span>{opt}</span>
                    {showFeedback && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                    {showFeedback && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {gameState === 'review' && (
              <p className="text-xs text-center text-emerald-400 font-medium animate-pulse">
                💡 {currentPuzzle.explanation}
              </p>
            )}
          </div>
        )}

        {/* Finished Overlay */}
        {gameState === 'finished' && (
          <div className="flex flex-col items-center text-center max-w-md w-full p-6 bg-surface-container rounded-3xl border border-outline-variant/60 shadow-2xl">
            <h3 className="text-3xl font-black text-emerald-400 mb-2">🎉 CODE FULLY DECRYPTED!</h3>
            <p className="text-xs text-on-surface-variant">Alien intelligence matrix successfully decoded</p>

            <div className="my-6 p-4 rounded-2xl bg-surface-container-high border border-white/10 w-full flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant">Final Decryption Score</span>
                <span className="text-emerald-400 font-black text-xl font-mono">{score}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant">Max Streak Multiplier</span>
                <span className="text-amber-400 font-bold">{streak}x</span>
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
                onClick={startGame}
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
