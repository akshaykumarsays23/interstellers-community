'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { User } from '@/lib/types';
import { Avatar } from '@/components/common/Avatar';
import {
  Bot,
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Users,
  Timer,
  Heart,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuestionDef {
  id: string;
  question: string;
  placeholder: string;
  suggestions: string[];
}

export const NOVA_15_QUESTIONS: QuestionDef[] = [
  {
    id: 'nickname',
    question: '1. What is your favorite nickname or callsign among the stars?',
    placeholder: 'e.g., StarLord, Neo, Shadow, AK...',
    suggestions: ['Cosmic Voyager', 'Star-Gazer', 'Shadow Runner', 'Cyber Knight'],
  },
  {
    id: 'dob',
    question: '2. What is your date of birth (or cosmic arrival date)?',
    placeholder: 'e.g., 14 August 2002, 1999-10-11...',
    suggestions: ['15 August', '24 October', '1 January', '12 December'],
  },
  {
    id: 'color',
    question: '3. What is your favorite cosmic color?',
    placeholder: 'e.g., Electric Cyan, Deep Violet, Neon Crimson...',
    suggestions: ['Electric Cyan 🌊', 'Nebula Violet 🔮', 'Solar Gold ☀️', 'Crimson Red 🔴'],
  },
  {
    id: 'food',
    question: '4. What is your ultimate comfort food across the multiverse?',
    placeholder: 'e.g., Pizza, Biryani, Ramen, Tacos, Pasta...',
    suggestions: ['Italian Pizza 🍕', 'Hyderabadi Biryani 🍛', 'Japanese Ramen 🍜', 'Street Tacos 🌮'],
  },
  {
    id: 'sports',
    question: '5. What is your favorite sport or physical passion?',
    placeholder: 'e.g., Cricket, Football, Basketball, Formula 1, Chess...',
    suggestions: ['Cricket 🏏', 'Football (Soccer) ⚽', 'Basketball 🏀', 'Formula 1 🏎️'],
  },
  {
    id: 'character',
    question: '6. Who is your favorite television, movie, or fictional character?',
    placeholder: 'e.g., The Dark Knight, Spider-Man, Tommy Oliver, Pikachu, Iron Man...',
    suggestions: ['Spider-Man 🕷️', 'The Dark Knight (Batman) 🦇', 'Pikachu ⚡', 'Tommy Oliver (Green Ranger) 🦖'],
  },
  {
    id: 'era',
    question: '7. What kind of era or time would you want to be born in (e.g., 1600s, 1980s, 2100s, 3000s)?',
    placeholder: 'e.g., 1600, 1990, 2100, 3000...',
    suggestions: ['1600s (Renaissance Explorers) 📜', '1990s (Golden Nostalgia) 📼', '2100s (Cyberpunk Frontier) 🚀', '3000s (Deep Galactic Age) 🌌'],
  },
  {
    id: 'comm_style',
    question: '8. What do you prefer deep down: instant chatting or writing handwritten letters?',
    placeholder: 'Instant Chatting or Handwritten Letters?',
    suggestions: ['Instant Chatting 💬', 'Writing Handwritten Letters ✉️', 'Both Equally ✨'],
  },
  {
    id: 'superpower',
    question: '9. If you were granted one dream superpower, what would it be?',
    placeholder: 'e.g., Teleportation, Time Travel, Mind Reading, Flying...',
    suggestions: ['Instant Teleportation 🌀', 'Time Travel ⏳', 'Flight & Super Strength 🦸', 'Invisibility 👻'],
  },
  {
    id: 'music',
    question: '10. What music genre speaks to your soul when traveling at night?',
    placeholder: 'e.g., Synthwave, Rock, Lo-Fi, Hip-Hop, Classical...',
    suggestions: ['Synthwave / Retro 🎹', 'Lo-Fi Chill Beats 🎧', 'Rock & Anthems 🎸', 'Ambient Space Chill 🌌'],
  },
  {
    id: 'chrono_type',
    question: '11. Are you a sunrise early bird or a deep-night cosmic owl?',
    placeholder: 'Early Bird or Night Owl?',
    suggestions: ['Deep-Night Cosmic Owl 🦉', 'Early Sunrise Bird 🌅', 'Twighlight Explorer 🌙'],
  },
  {
    id: 'destination',
    question: '12. What is your dream planet, destination, or fantasy realm to explore?',
    placeholder: 'e.g., Mars Colony, Cyber-Tokyo, Asgard, Swiss Alps...',
    suggestions: ['Mars Orbital Colony 🪐', 'Cyber-Tokyo Neon City 🏙️', 'Asgardian Citadels ⚡', 'Swiss Mountain Stars 🏔️'],
  },
  {
    id: 'story',
    question: '13. What is your favorite book, anime, or story that changed your life?',
    placeholder: 'e.g., Interstellar, Naruto, Harry Potter, The Alchemist...',
    suggestions: ['Interstellar Movie 🚀', 'The Alchemist 📖', 'Naruto Shippuden 🍥', 'The Dark Knight Trilogy 🦇'],
  },
  {
    id: 'hobby',
    question: '14. What hobby makes you lose all track of time?',
    placeholder: 'e.g., Coding, Gaming, Stargazing, Music Production, Cooking...',
    suggestions: ['Coding & Creating 💻', 'Gaming & Arcade 🎮', 'Deep Stargazing 🔭', 'Photography & Art 📸'],
  },
  {
    id: 'philosophy',
    question: '15. What is your core life philosophy or rule in one sentence?',
    placeholder: 'e.g., "Time is never coming back, remember time is never..."',
    suggestions: [
      '"Time is never coming back, remember time is never..." ⏳',
      '"With great power comes great responsibility." 🛡️',
      '"Always explore, always learn, never stop." 🚀',
      '"Treat every soul with kindness and strength." ❤️',
    ],
  },
];

interface MatchedFellow {
  user: User;
  matchScore: number;
  matchedTags: string[];
  house: string;
}

export const NovaFellowsProtocol: React.FC<{ onFellowSelected?: (user: User) => void }> = ({
  onFellowSelected,
}) => {
  const {
    currentUser,
    fellowsAnswers,
    saveFellowsAnswers,
    startChatWithUser,
    connections,
    openUserProfile,
  } = useApp();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(fellowsAnswers || {});
  const [currentInput, setCurrentInput] = useState('');
  const [isCompleted, setIsCompleted] = useState(Boolean(fellowsAnswers && Object.keys(fellowsAnswers).length >= 15));
  const [showAnswersDrawer, setShowAnswersDrawer] = useState(false);

  const currentQ = NOVA_15_QUESTIONS[currentStep];

  const speakNovaStatus = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const speechMsg = `No similarities found yet since you are the first one who finished all 15 questions! When I find similarities, I will notify you, darling! And remember: if you hurt anyone, I will make sure you never see me and this beautiful website in your lifetime!`;
        const utter = new SpeechSynthesisUtterance(speechMsg);
        utter.rate = 1.02;
        window.speechSynthesis.speak(utter);
      } catch (_) {}
    }
  };

  const handleNextQuestion = (valueToSave?: string) => {
    const val = (valueToSave || currentInput || '').trim();
    if (!val) return;

    const updated = { ...answers, [currentQ.id]: val };
    setAnswers(updated);
    setCurrentInput('');

    if (currentStep + 1 < NOVA_15_QUESTIONS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      saveFellowsAnswers(updated);
      setIsCompleted(true);

      // Synthesize the assistant's voice aloud.
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try {
          const speechMsg = `Cosmic compatibility protocol complete! No similarities found yet since you are the first one who finished all 15 questions! When I find similarities, I will notify you, darling! And remember: if you hurt anyone, I will make sure you never see me and this beautiful website in your lifetime!`;
          const utter = new SpeechSynthesisUtterance(speechMsg);
          utter.rate = 1.02;
          window.speechSynthesis.speak(utter);
        } catch (_) {}
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-300">
      
      {/* Anant header banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-purple-950/80 via-slate-900 to-cyan-950/80 border border-cyan-500/40 shadow-2xl overflow-hidden text-white">
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-cyan-500/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="font-heading font-black text-xl sm:text-2xl text-white flex items-center gap-2">
                Anant Fellows Compatibility Protocol
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 font-mono font-bold border border-cyan-400/40">
                  15 QUESTIONS
                </span>
              </h2>
              <p className="text-xs text-cyan-200/90 font-medium">
                Answer Anant&apos;s 15 questions to unlock resonant fellows across the galaxy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-mono font-bold flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-amber-300" />
              <span>30-Day Fellowship Cycle</span>
            </span>
          </div>
        </div>
      </div>

      {/* 30-Day Rotation Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-on-surface leading-relaxed flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-400 font-bold block mb-0.5">
            The 30-Day Cosmic Friendship Law:
          </strong>
          &ldquo;1 month with the same fellows and same house. Next month, Anant will prompt:
          <em> &apos;You can stay, but traveling is not staying—it&apos;s about getting to know new people, new things!&apos;</em>
          Questions and soulmate matches can be updated every 30 days!&rdquo;
        </div>
      </div>

      {/* QUESTIONNAIRE PROGRESSION (IF NOT COMPLETED) */}
      {!isCompleted ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-outline-variant/60 shadow-card space-y-6">
          
          {/* Step Progress Ticker */}
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-primary font-bold">
              Question {currentStep + 1} of {NOVA_15_QUESTIONS.length}
            </span>
            <span className="text-on-surface-variant font-medium">
              {Math.round(((currentStep + 1) / NOVA_15_QUESTIONS.length) * 100)}% Complete
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
            <div
              style={{ width: `${((currentStep + 1) / NOVA_15_QUESTIONS.length) * 100}%` }}
              className="h-full bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full transition-all duration-300"
            />
          </div>

          {/* Question Box */}
          <div className="space-y-3">
            <h3 className="font-heading font-black text-lg sm:text-xl text-on-surface leading-snug">
              {currentQ.question}
            </h3>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-[11px] text-on-surface-variant font-semibold flex items-center gap-1 self-center mr-1">
                <HelpCircle className="w-3.5 h-3.5 text-primary" /> Suggestions:
              </span>
              {currentQ.suggestions.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleNextQuestion(sug)}
                  className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-primary hover:text-on-primary text-xs font-semibold text-on-surface transition-all border border-outline-variant/40 active:scale-95 shadow-2xs"
                >
                  {sug}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="flex gap-2 pt-3">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNextQuestion();
                }}
                placeholder={currentQ.placeholder}
                className="flex-1 bg-surface-container rounded-2xl px-4 py-3 text-xs sm:text-sm text-on-surface outline-none border border-outline-variant/60 focus:border-primary shadow-inner"
              />
              <button
                type="button"
                onClick={() => handleNextQuestion()}
                disabled={!currentInput.trim()}
                className="px-6 py-3 rounded-2xl bg-primary hover:bg-primary-hover text-on-primary font-black text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 disabled:opacity-40"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* COMPATIBLE FELLOWS DISPLAY + ANANT'S SOLEMN WARNING */
        <div className="space-y-6 animate-in fade-in">
          
          {/* Anant's solemn warning card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-950/60 via-slate-900 to-purple-950/60 border border-rose-500/40 shadow-xl text-white space-y-3">
            <div className="flex items-center gap-2.5 text-rose-300">
              <ShieldAlert className="w-6 h-6 animate-bounce" />
              <h3 className="font-heading font-black text-base tracking-wide">
                Anant Guardian Directive:
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-100 font-semibold italic bg-black/40 p-4 rounded-2xl border border-white/10">
              &ldquo;You can follow these fellows! And if you want global friends, I can grant you access...
              <strong className="text-rose-300 font-black">
                {' '}But remember: if you hurt anyone, I will make sure you never see me and this beautiful and cool website ever again in your lifetime! 🚀⚡
              </strong>&rdquo;
            </p>
          </div>

          {/* Anant's status card: no similarities found yet (Pioneer Voyager #001) */}
          <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-purple-950/90 via-slate-900 to-indigo-950/90 border border-purple-500/50 shadow-2xl overflow-hidden text-white space-y-6">
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-500/25 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 shrink-0">
                  <Bot className="w-7 h-7 text-cyan-200 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                      PIONEER DISCOVERY PROTOCOL
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30">
                      VOYAGER #001
                    </span>
                  </div>
                  <h3 className="font-heading font-black text-lg text-white mt-1">
                    Cosmic Starlight Scan Complete
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={speakNovaStatus}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95"
                  title="Hear Anant speak aloud"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>Hear Anant</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(0);
                    setIsCompleted(false);
                  }}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition-all flex items-center gap-1 border border-white/15"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>
              </div>
            </div>

            {/* Anant's direct message to the user */}
            <div className="p-6 rounded-2xl bg-black/60 border border-purple-500/40 backdrop-blur-md space-y-3 relative">
              <div className="flex items-center gap-2 text-cyan-300 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Anant Personal Notification</span>
              </div>
              <p className="font-heading text-base sm:text-xl text-slate-100 font-bold leading-relaxed">
                &ldquo;No similarities found yet since you are the 1st one who finished all 15 questions! When I find similarities, I will notify you, darling! ✨💖&rdquo;
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-300 font-medium">
                <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-500/30 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 15 Questions Recorded
                </span>
                <span className="flex items-center gap-1.5 text-cyan-300 bg-cyan-950/40 px-3 py-1 rounded-lg border border-cyan-500/30 font-semibold">
                  <Timer className="w-3.5 h-3.5" /> 30-Day Cycle Active
                </span>
                <span className="flex items-center gap-1.5 text-purple-300 bg-purple-950/40 px-3 py-1 rounded-lg border border-purple-500/30 font-semibold">
                  <Bot className="w-3.5 h-3.5" /> Automatic Radar Listening
                </span>
              </div>
            </div>

            {/* Radar Activity Animation */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center shrink-0">
                  <div className="absolute inset-0 rounded-full border border-cyan-400/40 animate-ping opacity-60" />
                  <Users className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Deep Space Fellow Radar Active</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Actively scanning across Marvel, DC, Pokémon & Power Rangers houses for other members who complete the 15 questions.
                  </p>
                </div>
              </div>
            </div>

            {/* Inspect Answer Drawer */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAnswersDrawer(!showAnswersDrawer)}
                className="text-xs text-cyan-300 hover:text-cyan-200 font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>{showAnswersDrawer ? '▼ Hide' : '▶ Inspect'} Your 15 Starlight Answers</span>
              </button>

              {showAnswersDrawer && (
                <div className="mt-3 p-4 rounded-2xl bg-black/60 border border-white/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 animate-in fade-in text-xs">
                  {NOVA_15_QUESTIONS.map((q, idx) => (
                    <div key={q.id} className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                      <p className="text-[10px] text-cyan-300 font-bold truncate">Q{idx + 1}: {q.placeholder}</p>
                      <p className="text-xs text-white font-medium break-words">{answers[q.id] || '—'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
