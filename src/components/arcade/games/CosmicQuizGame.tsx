'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { COSMIC_QUIZ_QUESTIONS } from '@/lib/arcadeData';
import { Brain, ArrowLeft, CheckCircle2, XCircle, Clock, Sparkles, Award, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CosmicQuizGameProps {
  onBack: () => void;
}

export const CosmicQuizGame: React.FC<CosmicQuizGameProps> = ({ onBack }) => {
  const { recordGameScore } = useApp();

  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'review' | 'finished'>('idle');
  const [earnedXP, setEarnedXP] = useState<number>(0);
  const [earnedCredits, setEarnedCredits] = useState<number>(0);

  const questions = COSMIC_QUIZ_QUESTIONS;
  const currentQ = questions[currentIdx];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    } else if (gameState === 'playing' && timeLeft === 0) {
      handleOptionSelect(-1); // Timeout penalty
    }
    return () => clearTimeout(timer);
  }, [gameState, timeLeft]);

  const startQuiz = () => {
    setCurrentIdx(0);
    setScore(0);
    setCorrectAnswersCount(0);
    setTimeLeft(15);
    setSelectedOption(null);
    setGameState('playing');
  };

  const handleOptionSelect = (idx: number) => {
    if (gameState !== 'playing') return;
    setSelectedOption(idx);
    setGameState('review');

    const isCorrect = idx === currentQ.correctIndex;
    let points = 0;
    if (isCorrect) {
      points = 150 + timeLeft * 10; // Base 150 + speed bonus
      setScore((s) => s + points);
      setCorrectAnswersCount((c) => c + 1);
    }

    setTimeout(() => {
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx((i) => i + 1);
        setSelectedOption(null);
        setTimeLeft(15);
        setGameState('playing');
      } else {
        finishQuiz(score + points, correctAnswersCount + (isCorrect ? 1 : 0));
      }
    }, 1400);
  };

  const finishQuiz = async (finalScore: number, correctCount: number) => {
    setGameState('finished');
    const { xpEarned, starCreditsEarned } = await recordGameScore(
      'cosmic_quiz',
      finalScore,
      `Answered ${correctCount}/${questions.length} questions correctly`
    );
    setEarnedXP(xpEarned);
    setEarnedCredits(starCreditsEarned);
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-3xl overflow-hidden border border-outline-variant/60 shadow-2xl">
      {/* Top Header */}
      <div className="p-4 bg-surface-container-low border-b border-outline-variant/60 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Arcade</span>
        </button>
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400 animate-pulse" />
          <h2 className="font-heading font-bold text-sm sm:text-base text-on-surface">🧠 COSMIC QUIZ</h2>
        </div>
        {gameState === 'playing' ? (
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold bg-amber-950/40 px-3 py-1 rounded-full border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeLeft}s</span>
          </div>
        ) : (
          <span className="text-xs text-on-surface-variant">Question {currentIdx + 1}/{questions.length}</span>
        )}
      </div>

      {/* Main Body */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-surface-container-low/60 relative">
        {/* Start State */}
        {gameState === 'idle' && (
          <div className="flex flex-col items-center text-center max-w-md gap-4">
            <div className="w-20 h-20 rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-xl mb-2 animate-bounce">
              <Brain className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-on-surface">Test Your Cosmic Knowledge</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Answer 6 timed questions across Science, Astronomy, Tech, Cinema, and Gaming. Speed grants bonus score points!
            </p>
            <button
              onClick={startQuiz}
              className="mt-2 px-8 py-3 rounded-2xl bg-purple-500 text-white font-extrabold text-sm hover:bg-purple-400 transition-all shadow-xl hover:scale-105"
            >
              START QUIZ NOW 🧠
            </button>
          </div>
        )}

        {/* Quiz Playing & Review */}
        {(gameState === 'playing' || gameState === 'review') && (
          <div className="flex flex-col max-w-xl w-full gap-6">
            {/* Category & Progress Bar */}
            <div className="flex items-center justify-between text-xs font-semibold text-purple-400">
              <span>{currentQ.category}</span>
              <span>Question {currentIdx + 1} of {questions.length}</span>
            </div>

            <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question Text */}
            <div className="p-6 rounded-3xl bg-surface-container border border-outline-variant/60 shadow-lg text-center">
              <h3 className="text-lg sm:text-xl font-bold text-on-surface leading-snug">
                {currentQ.question}
              </h3>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;
                const showFeedback = gameState === 'review';

                return (
                  <button
                    key={idx}
                    disabled={gameState === 'review'}
                    onClick={() => handleOptionSelect(idx)}
                    className={cn(
                      'p-4 rounded-2xl text-left text-xs sm:text-sm font-semibold border transition-all flex items-center justify-between',
                      showFeedback && isCorrect && 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/50',
                      showFeedback && isSelected && !isCorrect && 'bg-rose-950/80 border-rose-500 text-rose-200',
                      !showFeedback && 'bg-surface-container hover:bg-surface-container-high border-outline-variant/40 text-on-surface hover:border-purple-500/50'
                    )}
                  >
                    <span>{opt}</span>
                    {showFeedback && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                    {showFeedback && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Finished Screen */}
        {gameState === 'finished' && (
          <div className="flex flex-col items-center text-center max-w-md w-full p-6 bg-surface-container rounded-3xl border border-outline-variant/60 shadow-2xl">
            <h3 className="text-3xl font-black text-purple-400 mb-2">🎉 QUIZ COMPLETED!</h3>
            <p className="text-xs text-on-surface-variant">Here is your cosmic trivia summary</p>

            <div className="my-6 p-4 rounded-2xl bg-surface-container-high border border-white/10 w-full flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant">Correct Answers</span>
                <span className="text-emerald-400 font-extrabold text-sm">{correctAnswersCount} / {questions.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant">Total Score</span>
                <span className="text-purple-400 font-black text-lg font-mono">{score}</span>
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
                onClick={startQuiz}
                className="flex-1 py-3 rounded-2xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-hover transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> REPLAY QUIZ
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
