'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { cn } from '@/lib/utils';
import type { HouseId } from '@/lib/community';

interface ChallengeChoice {
  id: string;
  text: string;
}

interface ChallengeQuestion {
  id: string;
  house: HouseId;
  question: string;
  choices: ChallengeChoice[];
  selectedChoiceId?: string;
  correctChoiceId?: string;
  explanation?: string;
}

interface ChallengeAttempt {
  id: string;
  house: HouseId;
  questions: ChallengeQuestion[];
}

interface AttemptHistoryEntry {
  id: string;
  house: HouseId;
  correct: number;
  points: number;
  submittedAt: string;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  house: HouseId;
  points: number;
  isCurrentUser: boolean;
}

interface ScoreBreakdown {
  correct: number;
  total: number;
  answerPoints: number;
  completionBonus: number;
  thresholdBonus: number;
  perfectBonus: number;
  totalPoints: number;
}

const HOUSE_LABELS: Record<HouseId, string> = {
  marvel: 'Marvel',
  dc: 'DC',
  pokemon: 'Pokémon',
  power_rangers: 'Power Rangers',
};

export const CosmicHouseChallenge: React.FC = () => {
  const [attempt, setAttempt] = useState<ChallengeAttempt | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState<ScoreBreakdown | null>(null);
  const [history, setHistory] = useState<AttemptHistoryEntry[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadChallengeData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/houses/challenge', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Challenge data could not be loaded.');
      setHistory(data.history);
      setLeaderboard(data.leaderboard);
      if (data.activeAttempt) {
        setAttempt(data.activeAttempt);
        setAnswers(Object.fromEntries(
          data.activeAttempt.questions
            .filter((question: ChallengeQuestion) => question.selectedChoiceId)
            .map((question: ChallengeQuestion) => [question.id, question.selectedChoiceId])
        ));
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Challenge data could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadChallengeData();
  }, [loadChallengeData]);

  const startAttempt = async () => {
    if (starting) return;
    setStarting(true);
    setError(null);
    try {
      const response = await fetch('/api/houses/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Challenge could not be started.');
      setAttempt({ id: data.attemptId, house: data.questions[0].house, questions: data.questions });
      setQuestionIndex(0);
      setAnswers({});
      setScore(null);
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : 'Challenge could not be started.');
    } finally {
      setStarting(false);
    }
  };

  const submitAttempt = async () => {
    if (!attempt || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/houses/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit', attemptId: attempt.id, answers }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Challenge results could not be saved.');
      setAttempt({ ...attempt, questions: data.questions });
      setScore(data.score);
      setConfirmSubmit(false);
      await loadChallengeData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Challenge results could not be saved.');
    } finally {
      setSubmitting(false);
    }
  };

  const saveAnswer = async (questionId: string, choiceId: string) => {
    if (!attempt || submitting) return;
    setError(null);
    try {
      const response = await fetch('/api/houses/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_answer',
          attemptId: attempt.id,
          questionId,
          choiceId,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Answer could not be saved.');
      setAnswers((current) => ({ ...current, [questionId]: choiceId }));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Answer could not be saved.');
    }
  };

  const question = attempt?.questions[questionIndex];
  const isComplete = Boolean(score);
  const answeredCount = Object.keys(answers).length;

  return (
    <section className="space-y-5 rounded-2xl border border-cyan-500/30 bg-surface-container-lowest p-5 shadow-card sm:p-6 md:col-span-2 lg:col-span-3" aria-labelledby="cosmic-house-challenge-title">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-300">50-question cosmic quiz</p>
          <h3 id="cosmic-house-challenge-title" className="mt-1 font-heading text-lg font-black text-on-surface">
            COSMIC HOUSE CHALLENGE
          </h3>
          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-on-surface-variant">
            Take on 10 randomly selected questions spanning Marvel, DC, Pokémon, and Power Rangers.
            Each completed attempt is scored and saved by the server.
          </p>
        </div>
        <Trophy className="h-7 w-7 shrink-0 text-amber-400" aria-hidden="true" />
      </header>

      {error && (
        <p role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </p>
      )}

      {loading ? (
        <p role="status" className="py-6 text-center text-sm text-on-surface-variant">Loading challenge...</p>
      ) : attempt && question ? (
        <div className="space-y-4 rounded-xl border border-outline-variant/40 bg-surface-container p-4 sm:p-5">
          {isComplete && score ? (
            <div className="space-y-4">
              <div className="text-center">
                <Trophy className="mx-auto h-9 w-9 text-amber-400" />
                <h4 className="mt-2 font-heading text-base font-black text-on-surface">Challenge complete</h4>
                <p className="mt-1 text-sm font-bold text-primary">
                  {score.correct}/{score.total} correct · {score.totalPoints.toLocaleString()} points
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  {HOUSE_LABELS[attempt.house]} House credit · {score.answerPoints} answer points
                  {' + '}{score.completionBonus} completion
                  {score.thresholdBonus ? ` + ${score.thresholdBonus} 7/10 bonus` : ''}
                  {score.perfectBonus ? ` + ${score.perfectBonus} perfect bonus` : ''}
                </p>
              </div>
              <div className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
                {attempt.questions.map((result, index) => {
                  const correctChoice = result.choices.find((choice) => choice.id === result.correctChoiceId);
                  return (
                    <article key={result.id} className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-3">
                      <p className="text-xs font-bold text-on-surface">{index + 1}. {result.question}</p>
                      <p className={cn(
                        'mt-2 text-xs',
                        result.selectedChoiceId === result.correctChoiceId ? 'text-emerald-300' : 'text-rose-300'
                      )}>
                        Your answer: {result.choices.find((choice) => choice.id === result.selectedChoiceId)?.text || 'No answer'}
                      </p>
                      <p className="mt-1 text-xs text-emerald-300">Correct: {correctChoice?.text}</p>
                      <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">{result.explanation}</p>
                    </article>
                  );
                })}
              </div>
              <button type="button" onClick={() => { setAttempt(null); setScore(null); }} className="w-full rounded-lg bg-primary px-4 py-2 text-xs font-bold text-on-primary">
                Start another attempt
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-mono text-on-surface-variant">
                  Question {questionIndex + 1} of {attempt.questions.length}
                </span>
                <span className="text-on-surface-variant">{answeredCount}/10 answered</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-container-high" role="progressbar" aria-valuenow={answeredCount} aria-valuemin={0} aria-valuemax={10} aria-label="Answered questions">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all" style={{ width: `${answeredCount * 10}%` }} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">{HOUSE_LABELS[question.house]}</p>
              <h4 className="text-sm font-bold leading-relaxed text-on-surface">{question.question}</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {question.choices.map((choice) => (
                  <button
                    key={choice.id}
                    type="button"
                    aria-pressed={answers[question.id] === choice.id}
                    onClick={() => void saveAnswer(question.id, choice.id)}
                    className={cn(
                      'min-h-12 rounded-xl border px-3 py-2 text-left text-xs font-medium transition-colors',
                      answers[question.id] === choice.id
                        ? 'border-cyan-300 bg-cyan-500/15 text-cyan-100'
                        : 'border-outline-variant/40 bg-surface-container-low text-on-surface hover:border-cyan-400/50'
                    )}
                  >
                    {choice.text}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  disabled={questionIndex === 0}
                  onClick={() => setQuestionIndex((index) => index - 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/50 px-3 py-2 text-xs font-bold text-on-surface disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                <div className="flex gap-2">
                  {questionIndex < attempt.questions.length - 1 && (
                    <button
                      type="button"
                      onClick={() => setQuestionIndex((index) => index + 1)}
                      className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/50 px-3 py-2 text-xs font-bold text-on-surface"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={answeredCount !== 10 || submitting}
                    onClick={() => setConfirmSubmit(true)}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-on-primary disabled:opacity-40"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Submit
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-outline-variant/40 bg-surface-container p-4">
          <p className="text-xs leading-relaxed text-on-surface-variant">
            Complete 10 questions for 200 bonus points. Earn 500 more at 7/10 or better,
            and an additional 1,000 points for a perfect 10/10. Each correct answer is worth 100 points.
          </p>
          <button
            type="button"
            disabled={starting}
            onClick={() => void startAttempt()}
            className="mt-4 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-on-primary disabled:opacity-50"
          >
            {starting ? 'Preparing questions...' : 'Start Challenge'}
          </button>
        </div>
      )}

      {confirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="challenge-submit-title">
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-2xl">
            <h4 id="challenge-submit-title" className="font-heading text-base font-bold text-on-surface">Submit your answers?</h4>
            <p className="text-xs leading-relaxed text-on-surface-variant">You have answered all 10 questions. Once submitted, this attempt cannot be changed.</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmSubmit(false)} className="rounded-lg border border-outline-variant/50 px-3 py-2 text-xs font-bold text-on-surface">Review answers</button>
              <button type="button" disabled={submitting} onClick={() => void submitAttempt()} className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-on-primary disabled:opacity-50">
                {submitting ? 'Saving...' : 'Confirm submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-2" aria-label="Challenge attempt history">
          <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">Your recent attempts</h4>
          {history.length === 0 ? (
            <p className="text-xs text-on-surface-variant">No completed attempts yet.</p>
          ) : history.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between gap-3 rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-2 text-xs">
              <span>{entry.correct}/10 · {HOUSE_LABELS[entry.house]} · {new Date(entry.submittedAt).toLocaleDateString()}</span>
              <strong className="font-mono text-primary">{entry.points.toLocaleString()} pts</strong>
            </div>
          ))}
        </section>
        <section className="space-y-2" aria-label="Cosmic House Challenge leaderboard">
          <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">Challenge leaderboard · all-time points</h4>
          {leaderboard.length === 0 ? (
            <p className="text-xs text-on-surface-variant">No challenge scores yet.</p>
          ) : leaderboard.map((entry) => (
            <div key={entry.rank} className="flex items-center justify-between gap-3 rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="w-7 shrink-0 text-center font-mono text-xs text-amber-300">#{entry.rank}</span>
                <Avatar src={entry.avatar} name={entry.name} size="xs" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-on-surface">{entry.name}{entry.isCurrentUser ? ' (you)' : ''}</p>
                  <p className="text-[10px] text-on-surface-variant">{HOUSE_LABELS[entry.house]}</p>
                </div>
              </div>
              <strong className="shrink-0 font-mono text-xs text-primary">{entry.points.toLocaleString()}</strong>
            </div>
          ))}
        </section>
      </div>
    </section>
  );
};
