'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { PersonalizedGalaxyBriefing } from './PersonalizedGalaxyBriefing';
import { CORE_7_RULES, CLASSIFIED_20_PROTOCOLS, ClassifiedProtocol } from '@/lib/flightProtocolsData';
import {
  Rocket,
  Shield,
  Radio,
  Sparkles,
  Star,
  Mic,
  Globe,
  CheckCircle2,
  Award,
  Zap,
  Flame,
  Ghost,
  Compass,
  Crown,
  UserCheck,
  BellRing,
  MessageSquare,
  AlertTriangle,
  Lock,
  Eye,
  Trophy,
  Bot,
  HelpCircle,
  Activity,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpaceTravelerBriefingProps {
  isExpanded: boolean;
}

export const SpaceTravelerBriefing: React.FC<SpaceTravelerBriefingProps> = ({ isExpanded }) => {
  const {
    currentUser,
    isAdmin,
    leaderboard,
    chats,
    friendRequests,
    gamificationState,
    missions,
    userHouse,
  } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'briefing' | 'intro' | 'rules' | 'reputation' | 'mysteries'>('briefing');
  const [ruleMode, setRuleMode] = useState<'core7' | 'classified20'>('core7');
  const [protocolFilter, setProtocolFilter] = useState<'all' | 'orbit' | 'community' | 'guardian' | 'badges'>('all');
  const [revealedDossiers, setRevealedDossiers] = useState<Record<string, boolean>>({});
  const [randomAnomalies, setRandomAnomalies] = useState<string[]>([]);

  const unreadBriefingBadge = (chats?.reduce((acc, c) => acc + (c.unreadCount || 0), 0) || 0) +
    (friendRequests?.filter((r) => r.status === 'pending').length || 0);

  const toggleDossier = (id: string) => {
    setRevealedDossiers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const generateRandomFishyAnomaly = () => {
    const list = [
      '📡 Quantum Ping #889: An unrecognized tachyon stream was intercepted from the Crab Nebula. Decryption reveals: "Akshay has hidden secret points inside Space House mini-games!"',
      '🛸 Deep Radar Alert: A mysterious craft with DC and Marvel logos was spotted docking at Station Citadel. House competition points just spiked by +100!',
      '🌀 Paradox Sensor: Time dilation detected at 1.04x speed. Remember: "Time is never coming back, remember time is never..."',
      '🧬 Genetic Scan: Pokemon House has synchronized with Power Rangers Megazord reactor! House battle scores are escalating.',
      '🤖 Nova Core Ping: "All fellows matching protocols are running smoothly. Keep exploring, traveler!"',
    ];
    const pick = list[Math.floor(Math.random() * list.length)];
    setRandomAnomalies((prev) => [pick, ...prev.slice(0, 4)]);
  };

  const userRank = leaderboard ? leaderboard.findIndex((entry) => entry.userId === currentUser.id) + 1 : 0;
  const isTop10 = userRank > 0 && userRank <= 10;
  const isBigAccount = Boolean(
    isAdmin ||
    currentUser?.isVerified ||
    currentUser?.role?.toLowerCase().includes('commander') ||
    currentUser?.role?.toLowerCase().includes('host') ||
    currentUser?.role?.toLowerCase().includes('admin') ||
    isTop10
  );

  const getCoreRuleIcon = (id: number) => {
    switch (id) {
      case 1: return <Radio className="w-4 h-4 text-emerald-400" />;
      case 2: return <Flame className="w-4 h-4 text-amber-400" />;
      case 3: return <Trophy className="w-4 h-4 text-purple-400" />;
      case 4: return <Crown className="w-4 h-4 text-amber-400" />;
      case 5: return <CheckCircle2 className="w-4 h-4 text-cyan-400" />;
      case 6: return <Bot className="w-4 h-4 text-blue-400" />;
      case 7: return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      default: return <Sparkles className="w-4 h-4 text-primary" />;
    }
  };

  const getProtocolIcon = (num: number) => {
    switch (num) {
      case 1: return <Radio className="w-4 h-4 text-emerald-400" />;
      case 2: return <Ghost className="w-4 h-4 text-slate-400" />;
      case 3: return <Flame className="w-4 h-4 text-amber-400" />;
      case 4: return <Zap className="w-4 h-4 text-purple-400" />;
      case 5: return <Shield className="w-4 h-4 text-cyan-400" />;
      case 6: return <Eye className="w-4 h-4 text-slate-300" />;
      case 7: return <Radio className="w-4 h-4 text-primary" />;
      case 8: return <Globe className="w-4 h-4 text-indigo-400" />;
      case 9: return <Crown className="w-4 h-4 text-amber-400" />;
      case 10: return <UserCheck className="w-4 h-4 text-cyan-400" />;
      case 11: return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 12: return <BellRing className="w-4 h-4 text-purple-400" />;
      case 13: return <MessageSquare className="w-4 h-4 text-amber-400" />;
      case 14: return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 15: return <Lock className="w-4 h-4 text-rose-500" />;
      case 16: return <Eye className="w-4 h-4 text-purple-400" />;
      case 17: return <Trophy className="w-4 h-4 text-amber-400" />;
      case 18: return <Bot className="w-4 h-4 text-cyan-400" />;
      case 19: return <Lock className="w-4 h-4 text-emerald-400" />;
      case 20: return <HelpCircle className="w-4 h-4 text-purple-400" />;
      default: return <Sparkles className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div id="galaxy-briefing" className={`mb-6 rounded-3xl border-2 border-cyan-400/40 bg-surface-container-lowest overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.22)] transition-all duration-300 ${isExpanded ? '' : 'hidden'}`}>
        {/* Main Content Area */}
        {isExpanded && (
          <div className="p-5 sm:p-7 space-y-6 bg-surface-container-lowest">
            
            {/* Navigation Sub-Tabs */}
            <div className="flex items-center gap-2 border-b border-cyan-500/25 pb-3 overflow-x-auto custom-scrollbar">
              <button
                onClick={() => setActiveSubTab('briefing')}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0',
                  activeSubTab === 'briefing'
                    ? 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                    : 'bg-surface-bright text-on-surface-variant hover:text-cyan-300'
                )}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
                <span>Galaxy Briefing</span>
                {unreadBriefingBadge > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-400/25 text-cyan-300 font-mono font-bold ml-0.5">
                    {unreadBriefingBadge}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveSubTab('mysteries')}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0',
                  activeSubTab === 'mysteries'
                    ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                    : 'bg-surface-bright text-on-surface-variant hover:text-cyan-300'
                )}
              >
                <Eye className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>Cosmic Mysteries (Fishy Anomalies)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/25 text-amber-300 font-mono ml-0.5">Secret 🕵️</span>
              </button>

              <button
                onClick={() => setActiveSubTab('intro')}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0',
                  activeSubTab === 'intro'
                    ? 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-500 text-white shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                    : 'bg-surface-bright text-on-surface-variant hover:text-cyan-300'
                )}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Host Briefing (103s)</span>
              </button>

              <button
                onClick={() => setActiveSubTab('rules')}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0',
                  activeSubTab === 'rules'
                    ? 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-500 text-white shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                    : 'bg-surface-bright text-on-surface-variant hover:text-cyan-300'
                )}
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>Space Rules</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono ml-0.5">Active</span>
              </button>

              <button
                onClick={() => setActiveSubTab('reputation')}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0',
                  activeSubTab === 'reputation'
                    ? 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-500 text-white shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                    : 'bg-surface-bright text-on-surface-variant hover:text-cyan-300'
                )}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Traveler Reputation HUD</span>
              </button>
            </div>

          {/* TAB 0: PERSONALIZED GALAXY BRIEFING & CONTEXTUAL DISCOVERY */}
          {activeSubTab === 'briefing' && (
            <PersonalizedGalaxyBriefing />
          )}

          {/* TAB 4: COSMIC MYSTERIES & FISHY ANOMALIES (CLASSIFIED DOSSIERS) */}
          {activeSubTab === 'mysteries' && (
            <div className="space-y-6">
              {/* Mystery Banner Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-cyan-950/40 border border-cyan-500/30 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-purple-600/30 border border-purple-400/40 text-amber-300 shadow-md">
                      <Sparkles className="w-5 h-5 animate-spin" />
                    </div>
                    <div>
                      <h3 className="font-heading font-black text-base text-white flex items-center gap-2">
                        🛸 COSMIC MYSTERIES & FISHY ANOMALIES
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 font-mono font-bold border border-cyan-400/40">
                          CLASSIFIED // LEVEL 5
                        </span>
                      </h3>
                      <p className="text-xs text-cyan-200/80">
                        Always something fishy going on in the galaxy! Who wants to discover, will learn.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={generateRandomFishyAnomaly}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 text-amber-300 border border-amber-400/40 text-xs font-bold transition-all shadow-sm active:scale-95"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                    <span>Scan Next Fishy Anomaly</span>
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mt-3">
                  Data in this galaxy is kept strictly encrypted. Click each dossier button below to decrypt and reveal the confidential truth.
                </p>

                {/* Random Anomaly Ticker */}
                {randomAnomalies.length > 0 && (
                  <div className="mt-4 p-3 bg-black/50 rounded-xl border border-amber-400/30 space-y-2 animate-in fade-in">
                    <p className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                      <Radio className="w-3.5 h-3.5 text-amber-400 animate-ping" />
                      <span>LIVE INTERCEPTED DEEP-SPACE FREQUENCIES:</span>
                    </p>
                    <div className="space-y-1">
                      {randomAnomalies.map((msg, i) => (
                        <p key={i} className="text-xs text-cyan-200 font-mono bg-white/5 p-2 rounded-lg border border-white/5">
                          {msg}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 6 Classified Dossiers with Hidden Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Dossier 1 */}
                <div className="p-4 rounded-2xl bg-surface-bright border border-outline-variant/60 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 font-mono">
                      DOSSIER #001 • TEMPORAL PROTOCOL
                    </span>
                    <Lock className={cn('w-4 h-4', revealedDossiers['dos_1'] ? 'text-emerald-400' : 'text-slate-400')} />
                  </div>
                  <h4 className="font-heading font-bold text-sm text-on-surface">
                    Why Time Never Comes Back // Founder&apos;s Axiom
                  </h4>
                  <button
                    onClick={() => toggleDossier('dos_1')}
                    className={cn(
                      'w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border shadow-xs',
                      revealedDossiers['dos_1']
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                        : 'bg-primary text-on-primary border-primary/50 hover:bg-primary-hover animate-pulse'
                    )}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{revealedDossiers['dos_1'] ? 'Hide Dossier Data' : '🔓 DECRYPT HIDDEN DATA'}</span>
                  </button>
                  {revealedDossiers['dos_1'] && (
                    <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/40 text-xs text-on-surface leading-relaxed animate-in fade-in">
                      <p className="font-bold text-amber-400 mb-1">Confidential Note from Akshay Kumar:</p>
                      &ldquo;Time is never coming back, remember time is never...&rdquo; In the cosmic timeline, seconds are finite. We created Interstellers not to drain your hours, but to build real brotherhood, explore cosmic houses, and make every moment among the stars memorable.
                    </div>
                  )}
                </div>

                {/* Dossier 2 */}
                <div className="p-4 rounded-2xl bg-surface-bright border border-outline-variant/60 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400 font-mono">
                      DOSSIER #002 • MULTIVERSE RIFT
                    </span>
                    <Lock className={cn('w-4 h-4', revealedDossiers['dos_2'] ? 'text-emerald-400' : 'text-slate-400')} />
                  </div>
                  <h4 className="font-heading font-bold text-sm text-on-surface">
                    The 4 Space Houses & 1-Month Residency Law
                  </h4>
                  <button
                    onClick={() => toggleDossier('dos_2')}
                    className={cn(
                      'w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border shadow-xs',
                      revealedDossiers['dos_2']
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                        : 'bg-primary text-on-primary border-primary/50 hover:bg-primary-hover animate-pulse'
                    )}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{revealedDossiers['dos_2'] ? 'Hide Dossier Data' : '🔓 DECRYPT HIDDEN DATA'}</span>
                  </button>
                  {revealedDossiers['dos_2'] && (
                    <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/40 text-xs text-on-surface leading-relaxed animate-in fade-in">
                      <p className="font-bold text-purple-400 mb-1">Galactic Law #44:</p>
                      The 4 Pillars of Interstellers are <strong>Marvel, DC, Pokemon, and Power Rangers</strong>! Choose a House directly from its card when you enter the Space House tab. You are locked in for <strong>exactly 1 month (30 days)</strong> with no house switching. Compete in trivia and power reactors to bring your House to #1 rank!
                    </div>
                  )}
                </div>

                {/* Dossier 3 */}
                <div className="p-4 rounded-2xl bg-surface-bright border border-outline-variant/60 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 font-mono">
                      DOSSIER #003 • SOUL TRAVEL
                    </span>
                    <Lock className={cn('w-4 h-4', revealedDossiers['dos_3'] ? 'text-emerald-400' : 'text-slate-400')} />
                  </div>
                  <h4 className="font-heading font-bold text-sm text-on-surface">
                    1 Month Same Fellows // Traveling vs Staying
                  </h4>
                  <button
                    onClick={() => toggleDossier('dos_3')}
                    className={cn(
                      'w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border shadow-xs',
                      revealedDossiers['dos_3']
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                        : 'bg-primary text-on-primary border-primary/50 hover:bg-primary-hover animate-pulse'
                    )}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{revealedDossiers['dos_3'] ? 'Hide Dossier Data' : '🔓 DECRYPT HIDDEN DATA'}</span>
                  </button>
                  {revealedDossiers['dos_3'] && (
                    <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/40 text-xs text-on-surface leading-relaxed animate-in fade-in">
                      <p className="font-bold text-cyan-400 mb-1">The Traveler Paradox:</p>
                      &ldquo;You can stay, but staying is not traveling. True journey is about getting to know new people, new perspectives, and new things.&rdquo; Every 30 days, Nova refreshes your 15 questions so you discover new compatible fellows across the stars.
                    </div>
                  )}
                </div>

                {/* Dossier 4 */}
                <div className="p-4 rounded-2xl bg-surface-bright border border-outline-variant/60 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400 font-mono">
                      DOSSIER #004 • NOVA&apos;S SANCTION
                    </span>
                    <Lock className={cn('w-4 h-4', revealedDossiers['dos_4'] ? 'text-emerald-400' : 'text-slate-400')} />
                  </div>
                  <h4 className="font-heading font-bold text-sm text-on-surface">
                    Nova AI&apos;s Zero Tolerance Failsafe
                  </h4>
                  <button
                    onClick={() => toggleDossier('dos_4')}
                    className={cn(
                      'w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border shadow-xs',
                      revealedDossiers['dos_4']
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                        : 'bg-primary text-on-primary border-primary/50 hover:bg-primary-hover animate-pulse'
                    )}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{revealedDossiers['dos_4'] ? 'Hide Dossier Data' : '🔓 DECRYPT HIDDEN DATA'}</span>
                  </button>
                  {revealedDossiers['dos_4'] && (
                    <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/40 text-xs text-on-surface leading-relaxed animate-in fade-in">
                      <p className="font-bold text-rose-400 mb-1">Nova&apos;s Core Guardian Clause:</p>
                      &ldquo;You can follow these fellows! And if you want global friends, I can grant you access... But remember: if you hurt anyone, I&apos;ll make sure you never see me and this beautiful, cool website ever again in your lifetime! 🚀⚡&rdquo;
                    </div>
                  )}
                </div>

                {/* Dossier 5 */}
                <div className="p-4 rounded-2xl bg-surface-bright border border-outline-variant/60 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 font-mono">
                      DOSSIER #005 • OMNISCIENT ENGINE
                    </span>
                    <Lock className={cn('w-4 h-4', revealedDossiers['dos_5'] ? 'text-emerald-400' : 'text-slate-400')} />
                  </div>
                  <h4 className="font-heading font-bold text-sm text-on-surface">
                    Nova&apos;s High-Speed Universal Intelligence
                  </h4>
                  <button
                    onClick={() => toggleDossier('dos_5')}
                    className={cn(
                      'w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border shadow-xs',
                      revealedDossiers['dos_5']
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                        : 'bg-primary text-on-primary border-primary/50 hover:bg-primary-hover animate-pulse'
                    )}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{revealedDossiers['dos_5'] ? 'Hide Dossier Data' : '🔓 DECRYPT HIDDEN DATA'}</span>
                  </button>
                  {revealedDossiers['dos_5'] && (
                    <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/40 text-xs text-on-surface leading-relaxed animate-in fade-in">
                      <p className="font-bold text-blue-400 mb-1">Omniscience Active:</p>
                      Nova has discarded timid and repetitive phrases! She answers any question on Earth or the cosmos—superheroes, code, science, history, philosophy, and real-time internet questions—with speed and clarity.
                    </div>
                  )}
                </div>

                {/* Dossier 6 */}
                <div className="p-4 rounded-2xl bg-surface-bright border border-outline-variant/60 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 font-mono">
                      DOSSIER #006 • LIVING STATIONS
                    </span>
                    <Lock className={cn('w-4 h-4', revealedDossiers['dos_6'] ? 'text-emerald-400' : 'text-slate-400')} />
                  </div>
                  <h4 className="font-heading font-bold text-sm text-on-surface">
                    Space Stations Command Decks & Wormholes
                  </h4>
                  <button
                    onClick={() => toggleDossier('dos_6')}
                    className={cn(
                      'w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border shadow-xs',
                      revealedDossiers['dos_6']
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                        : 'bg-primary text-on-primary border-primary/50 hover:bg-primary-hover animate-pulse'
                    )}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{revealedDossiers['dos_6'] ? 'Hide Dossier Data' : '🔓 DECRYPT HIDDEN DATA'}</span>
                  </button>
                  {revealedDossiers['dos_6'] && (
                    <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/40 text-xs text-on-surface leading-relaxed animate-in fade-in">
                      <p className="font-bold text-emerald-400 mb-1">All Systems Operational:</p>
                      Space Stations now have living command decks! You can click &ldquo;Dock Station 🚀&rdquo; to pressurize airlocks, activate reactor plasma boosters, hail docked crew members, and warp through active Wormholes.
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 1: HOST INTRO BRIEFING */}
          {activeSubTab === 'intro' && (
            <div className="space-y-5">
              {/* Host Profile Badge */}
              <div className="p-5 rounded-2xl bg-surface-bright border border-outline-variant/50 shadow-xs space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-outline-variant/30">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary shadow-xs shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/avatar.png" alt="Akshay Kumar" className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-surface-bright rounded-full" />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-heading font-bold text-sm sm:text-base text-on-surface">
                          Akshay Kumar
                        </h3>
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 ml-1">
                          Host & Commander
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                        <span>@akshay</span>
                        <span>•</span>
                        <span className="text-primary font-medium flex items-center gap-1">
                          <Mic className="w-3.5 h-3.5 text-purple-500 animate-pulse" />
                          103s Briefing Transmission
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                    <Radio className="w-3.5 h-3.5 text-primary animate-pulse" />
                    <span>COMMAND TRANSMISSION</span>
                  </div>
                </div>

                {/* Speech Body */}
                <div className="space-y-3 text-xs sm:text-sm text-on-surface leading-relaxed font-sans">
                  <h2 className="font-heading font-black text-base sm:text-lg text-primary tracking-wide">
                    🚀 WELCOME TO INTERSTELLERS
                  </h2>

                  <p className="font-semibold text-on-surface">
                    Listen up, Space Travelers.
                  </p>

                  <p className="text-on-surface-variant">
                    You’ve just crossed the boundary. Welcome to <strong className="text-primary font-bold">INTERSTELLERS</strong> — a digital galaxy built for people who want to <strong className="text-on-surface">connect, create, share, and explore</strong>.
                  </p>

                  <p className="text-on-surface-variant">
                    I’m <strong className="text-amber-500 font-extrabold px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30">AK</strong>, and I’ve got exactly <strong className="text-primary font-bold">103 seconds</strong> to brief you before you’re cleared for launch.
                  </p>

                  <p className="text-on-surface-variant">
                    From this moment on, you’re no longer just another account. You’re an officially registered <strong className="text-purple-400 font-bold">Space Traveler</strong>.
                  </p>

                  <p className="text-on-surface-variant">
                    And keeping this entire galaxy alive is your <strong className="text-emerald-400 font-bold">Host & Commander — Akshay Kumar</strong> — the person behind the mission, the servers, the vibes, and everything keeping this ship from drifting into the void.
                  </p>

                  <div className="pt-2 border-t border-outline-variant/30 text-on-surface font-medium">
                    But every galaxy needs a few laws. So before you hit <strong className="text-cyan-400 font-bold uppercase tracking-wider">LIGHTSPEED</strong>, check out our Space Rules below!
                  </div>
                </div>
              </div>

              {/* Action Button to switch to Space Rules */}
              <div className="flex justify-center">
                <button
                  onClick={() => setActiveSubTab('rules')}
                  className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center gap-2 shadow-md hover:bg-primary-hover transition-all"
                >
                  <Rocket className="w-4 h-4" />
                  <span>View Space Rules</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: GALAXY RULES & FLIGHT PROTOCOLS */}
          {activeSubTab === 'rules' && (
            <div className="space-y-5">
              {/* Rules Header & Mode Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-surface-bright border border-outline-variant/50 shadow-xs">
                <div>
                  <h3 className="font-heading font-black text-sm sm:text-base text-on-surface flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>🌌 INTERSTELLERS — Space Rules</span>
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Official flight code for every traveler in the galaxy. Active right now.
                  </p>
                </div>

                {/* Switcher: Space Rules vs 20 Classified Protocols */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-container border border-outline-variant/40 shrink-0">
                  <button
                    onClick={() => setRuleMode('core7')}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                      ruleMode === 'core7'
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface'
                    )}
                  >
                    Space Rules
                  </button>

                  <button
                    onClick={() => setRuleMode('classified20')}
                    className={cn(
                      'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                      ruleMode === 'classified20'
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface'
                    )}
                  >
                    <Lock className="w-3 h-3" />
                    <span>20 Protocols (Top 10)</span>
                  </button>
                </div>
              </div>

              {/* MODE 1: SPACE RULES (FOR EVERYONE) */}
              {ruleMode === 'core7' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {CORE_7_RULES.map((rule) => (
                      <div
                        key={rule.id}
                        className="p-4 sm:p-5 rounded-2xl bg-surface-bright border border-outline-variant/40 hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between space-y-2.5 group"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {getCoreRuleIcon(rule.id)}
                            <h4 className="font-heading font-bold text-xs sm:text-sm text-on-surface group-hover:text-primary transition-colors">
                              {rule.title}
                            </h4>
                          </div>
                          <span
                            className={cn(
                              'text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0',
                              rule.badgeColor
                            )}
                          >
                            {rule.tag}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                          {rule.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Teaser card for Big Accounts / Top 10 post-October */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900/50 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                        <Trophy className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-xs sm:text-sm text-white flex items-center gap-2">
                          <span>🚀 20 Classified Flight Protocols</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            Unlocks Post-October
                          </span>
                        </h4>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Reserved for Big Accounts & travelers who finish in the <strong className="text-amber-400">Top 10</strong> after October completes.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setRuleMode('classified20')}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Check Your Clearance</span>
                    </button>
                  </div>
                </div>
              )}

              {/* MODE 2: 20 CLASSIFIED PROTOCOLS (BIG ACCOUNTS & TOP 10) */}
              {ruleMode === 'classified20' && (
                <div className="space-y-4">
                  {isBigAccount ? (
                    <>
                      {/* VIP Clearance Active Banner */}
                      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between flex-wrap gap-2 text-emerald-300 text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>👑 <strong>VIP Classified Clearance Granted</strong>: You have verified access as a Big Account / Top 10 rank ({currentUser.name}).</span>
                        </div>
                        <span className="font-mono text-[10px] bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30 text-emerald-300">
                          CLEARANCE ACTIVE
                        </span>
                      </div>

                      {/* Category Filter Pills */}
                      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                        {(['all', 'orbit', 'community', 'guardian', 'badges'] as const).map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setProtocolFilter(cat)}
                            className={cn(
                              'px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors capitalize',
                              protocolFilter === cat
                                ? 'bg-primary text-on-primary'
                                : 'bg-surface-bright text-on-surface-variant hover:text-on-surface'
                            )}
                          >
                            {cat === 'all'
                              ? '⚡ All 20 Protocols'
                              : cat === 'orbit'
                              ? '🛰️ Signal & Streaks'
                              : cat === 'community'
                              ? '🪐 Community & Missions'
                              : cat === 'guardian'
                              ? '🛡️ AI Guardian & Safety'
                              : '💎 Badges & Secrets'}
                          </button>
                        ))}
                      </div>

                      {/* Protocols Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {CLASSIFIED_20_PROTOCOLS.filter((p) => protocolFilter === 'all' || p.category === protocolFilter).map((protocol) => (
                          <div
                            key={protocol.id}
                            className="p-4 rounded-2xl bg-surface-bright border border-outline-variant/40 space-y-2 hover:border-primary/40 transition-colors"
                          >
                            <div className="flex items-center justify-between text-xs font-bold text-on-surface">
                              <span className="flex items-center gap-1.5">
                                {getProtocolIcon(protocol.number)}
                                <span>{protocol.number}. {protocol.title}</span>
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-surface-container border border-outline-variant/30 font-mono text-on-surface-variant">
                                {protocol.tag}
                              </span>
                            </div>
                            <p className="text-xs text-on-surface-variant leading-relaxed">
                              {protocol.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    /* Locked Terminal for non-Top 10 users */
                    <div className="p-6 sm:p-8 rounded-2xl bg-surface-bright border border-purple-500/30 text-center space-y-4 shadow-card">
                      <div className="w-14 h-14 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center mx-auto border border-purple-500/30 shadow-xs">
                        <Lock className="w-7 h-7 text-amber-400" />
                      </div>

                      <div className="max-w-lg mx-auto space-y-1.5">
                        <h4 className="font-heading font-black text-base sm:text-lg text-on-surface">
                          🔒 20 Flight Protocols Classified for Top 10 Explorers
                        </h4>
                        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                          The complete 20 Crazy Flight Protocols are reserved for verified Big Accounts and will be officially unlocked for travelers who place in the <strong className="text-amber-400">Top 10 on the Galaxy Leaderboard</strong> once October completes.
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-2 text-xs font-mono text-purple-300 bg-purple-500/10 py-2 px-4 rounded-xl border border-purple-500/20 w-fit mx-auto">
                        <span>Your Current Rank: #{userRank > 0 ? userRank : 'Unranked'}</span>
                        <span>•</span>
                        <span>Clearance Requirement: Top 10 (Post-October)</span>
                      </div>

                      <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                        <Link
                          href="/arcade"
                          className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-primary-hover transition-all"
                        >
                          <Trophy className="w-4 h-4" />
                          <span>Climb Leaderboard in Arcade</span>
                        </Link>

                        <button
                          onClick={() => setRuleMode('core7')}
                          className="px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs border border-outline-variant/40 transition-colors"
                        >
                          Back to Space Rules
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TRAVELER REPUTATION HUD ("THE GALAXY HAS A MEMORY") */}
          {activeSubTab === 'reputation' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-surface-bright to-purple-500/10 border border-primary/30 space-y-4">
                
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                  <div>
                    <h3 className="font-heading font-black text-base sm:text-lg text-primary flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      <span>THE GALAXY HAS A MEMORY</span>
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Your Traveler Reputation HUD tracks your real contribution quality & status across Interstellers.
                    </p>
                  </div>

                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Live System Status
                  </span>
                </div>

                {/* Live Reputation Card */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  
                  {/* Level */}
                  <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/40 space-y-1">
                    <p className="text-[10px] text-on-surface-variant uppercase font-mono font-bold">Traveler Level</p>
                    <p className="text-sm sm:text-base font-heading font-extrabold text-primary">
                      Level {gamificationState?.travelerLevel || 1}
                    </p>
                  </div>

                  {/* Frequency */}
                  <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/40 space-y-1">
                    <p className="text-[10px] text-on-surface-variant uppercase font-mono font-bold">Frequency Level</p>
                    <p className="text-sm sm:text-base font-heading font-extrabold text-cyan-400">
                      {gamificationState?.signalStrength || 100}% Signal
                    </p>
                  </div>

                  {/* Community Rep */}
                  <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/40 space-y-1">
                    <p className="text-[10px] text-on-surface-variant uppercase font-mono font-bold">Reputation</p>
                    <p className="text-sm sm:text-base font-heading font-extrabold text-emerald-400">
                      {gamificationState?.moderationState === 'NORMAL' ? 'Excellent ⭐' : (gamificationState?.moderationState || 'Normal')}
                    </p>
                  </div>

                  {/* Streak */}
                  <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/40 space-y-1">
                    <p className="text-[10px] text-on-surface-variant uppercase font-mono font-bold">Current Streak</p>
                    <p className="text-sm sm:text-base font-heading font-extrabold text-amber-400">
                      {gamificationState?.currentStreak || 0} Days 🔥
                    </p>
                  </div>

                  {/* Missions */}
                  <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/40 space-y-1">
                    <p className="text-[10px] text-on-surface-variant uppercase font-mono font-bold">Missions Done</p>
                    <p className="text-sm sm:text-base font-heading font-extrabold text-purple-400">
                      {missions?.filter((m) => m.isCompleted).length || 0} Completed
                    </p>
                  </div>

                  {/* Strikes */}
                  <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/40 space-y-1">
                    <p className="text-[10px] text-on-surface-variant uppercase font-mono font-bold">Strikes</p>
                    <p className="text-sm sm:text-base font-heading font-extrabold text-emerald-400">0 / 3 Clear</p>
                  </div>

                  {/* Space Rank */}
                  <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/40 space-y-1 col-span-2">
                    <p className="text-[10px] text-on-surface-variant uppercase font-mono font-bold">Current Rank & House</p>
                    <p className="text-sm sm:text-base font-heading font-extrabold text-amber-400 flex items-center gap-1.5 truncate">
                      <Crown className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                      <span>{userRank > 0 ? `#${userRank} on Leaderboard` : 'Star Captain'}</span>
                      <span className="text-xs text-on-surface-variant font-mono font-normal">
                        ({userHouse ? `House of ${userHouse.toUpperCase()}` : 'Independent Explorer'})
                      </span>
                    </p>
                  </div>

                </div>

                <div className="pt-2 text-[11px] text-on-surface-variant italic">
                  💡 <strong>Tip:</strong> Quality contributions, helping travelers, and daily participation boost your frequency & unlock rare badges without requiring forced daily spam!
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
