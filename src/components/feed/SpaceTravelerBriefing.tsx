'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { CORE_7_RULES, CLASSIFIED_20_PROTOCOLS, ClassifiedProtocol } from '@/lib/flightProtocolsData';
import {
  Rocket,
  Shield,
  Radio,
  Sparkles,
  ChevronDown,
  ChevronUp,
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

export const SpaceTravelerBriefing: React.FC = () => {
  const { currentUser, isAdmin, leaderboard } = useApp();
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'intro' | 'rules' | 'reputation'>('intro');
  const [ruleMode, setRuleMode] = useState<'core7' | 'classified20'>('core7');
  const [protocolFilter, setProtocolFilter] = useState<'all' | 'orbit' | 'community' | 'guardian' | 'badges'>('all');

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
    <div className="mb-6 rounded-3xl border border-outline-variant/60 bg-surface-container-lowest overflow-hidden shadow-card transition-all duration-300">
      {/* Uncropped Banner Image Header */}
      <div className="relative w-full bg-slate-950 overflow-hidden border-b border-outline-variant/40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/space_traveler_banner2.png"
          alt="Welcome to Interstellers"
          className="w-full h-auto block object-cover max-h-80 sm:max-h-96 md:max-h-[440px] lg:max-h-[500px]"
        />

        {/* Header Controls Overlay */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-white/20 text-xs font-semibold text-white hover:bg-slate-900 hover:border-primary transition-all shadow-md"
          >
            <Rocket className="w-3.5 h-3.5 text-primary" />
            <span>{isExpanded ? 'Hide Briefing' : 'Show Briefing'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-300" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-300" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isExpanded && (
        <div className="p-5 sm:p-7 space-y-6 bg-surface-container-lowest">
          
          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 border-b border-outline-variant/40 pb-3 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setActiveSubTab('intro')}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0',
                activeSubTab === 'intro'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-bright text-on-surface-variant hover:text-on-surface'
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
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-bright text-on-surface-variant hover:text-on-surface'
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
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-bright text-on-surface-variant hover:text-on-surface'
              )}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Traveler Reputation HUD</span>
            </button>
          </div>

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
                    <p className="text-sm sm:text-base font-heading font-extrabold text-primary">Level 27</p>
                  </div>

                  {/* Frequency */}
                  <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/40 space-y-1">
                    <p className="text-[10px] text-on-surface-variant uppercase font-mono font-bold">Frequency Level</p>
                    <p className="text-sm sm:text-base font-heading font-extrabold text-cyan-400">84% Signal</p>
                  </div>

                  {/* Community Rep */}
                  <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/40 space-y-1">
                    <p className="text-[10px] text-on-surface-variant uppercase font-mono font-bold">Reputation</p>
                    <p className="text-sm sm:text-base font-heading font-extrabold text-emerald-400">Excellent ⭐</p>
                  </div>

                  {/* Streak */}
                  <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/40 space-y-1">
                    <p className="text-[10px] text-on-surface-variant uppercase font-mono font-bold">Current Streak</p>
                    <p className="text-sm sm:text-base font-heading font-extrabold text-amber-400">18 Days 🔥</p>
                  </div>

                  {/* Missions */}
                  <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/40 space-y-1">
                    <p className="text-[10px] text-on-surface-variant uppercase font-mono font-bold">Missions Done</p>
                    <p className="text-sm sm:text-base font-heading font-extrabold text-purple-400">143 Passed</p>
                  </div>

                  {/* Strikes */}
                  <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/40 space-y-1">
                    <p className="text-[10px] text-on-surface-variant uppercase font-mono font-bold">Strikes</p>
                    <p className="text-sm sm:text-base font-heading font-extrabold text-emerald-400">0 / 3 Clear</p>
                  </div>

                  {/* Space Rank */}
                  <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/40 space-y-1 col-span-2">
                    <p className="text-[10px] text-on-surface-variant uppercase font-mono font-bold">Current Rank</p>
                    <p className="text-sm sm:text-base font-heading font-extrabold text-amber-400 flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span>Star Captain</span>
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
