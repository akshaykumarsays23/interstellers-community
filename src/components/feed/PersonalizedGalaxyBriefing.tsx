'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import {
  Sparkles,
  MessageSquare,
  UserPlus,
  Gamepad2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  X,
  Flame,
  Trophy,
  ShieldCheck,
  Layers,
  Radio,
  Compass,
  Bot,
  Clock,
  ExternalLink,
  Shield,
  Zap,
  Star,
  Check,
  RotateCcw,
  Film
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/common/Avatar';

interface DiscoveryCard {
  id: string;
  category: 'comms' | 'social' | 'arcade' | 'house' | 'admin' | 'mission' | 'ai';
  title: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ReactNode;
  iconBg: string;
  actionLabel: string;
  onAction: () => void;
  canDismiss: boolean;
}

export const PersonalizedGalaxyBriefing: React.FC = () => {
  const router = useRouter();
  const {
    currentUser,
    isAdmin,
    chats,
    friendRequests,
    notifications,
    posts,
    gamificationState,
    gameScores,
    arcadeGames,
    stations,
    userHouse,
    fellowsAnswers,
    pendingRegistrationsCount,
    setIsApprovalsModalOpen,
    setIsAIPanelOpen,
    fetchAdminApprovals,
  } = useApp();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [dismissedCardIds, setDismissedCardIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('interstellers_dismissed_briefing_cards');
        if (saved) return JSON.parse(saved);
      } catch (_) {}
    }
    return [];
  });

  // Calculate real application telemetry
  const unreadMessagesCount = useMemo(() => {
    return chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  }, [chats]);

  const pendingRequestsCount = useMemo(() => {
    return friendRequests.filter((r) => r.status === 'pending').length;
  }, [friendRequests]);

  const unreadNotifsCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const userGameScoresCount = useMemo(() => {
    return gameScores.filter((s) => s.userId === currentUser.id).length;
  }, [gameScores, currentUser.id]);

  const activeStationWormhole = useMemo(() => {
    return stations.find((s) => s.activeWormhole);
  }, [stations]);

  // Gracefully handle missing or empty profile attributes
  const userDisplayName = currentUser?.name?.trim() || currentUser?.handle || 'Space Traveler';
  const userHandleText = currentUser?.handle ? `@${currentUser.handle.replace(/^@/, '')}` : '@traveler';
  const userRoleText = currentUser?.role?.trim() || 'Cosmic Traveler';

  // Dynamic time-of-day greeting
  const greetingTimeOfDay = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Dynamic status summary sentence
  const telemetrySummary = useMemo(() => {
    const alerts: string[] = [];
    if (unreadMessagesCount > 0) {
      alerts.push(`${unreadMessagesCount} unread message${unreadMessagesCount > 1 ? 's' : ''}`);
    }
    if (pendingRequestsCount > 0) {
      alerts.push(`${pendingRequestsCount} fellow docking request${pendingRequestsCount > 1 ? 's' : ''}`);
    }
    if (isAdmin && pendingRegistrationsCount > 0) {
      alerts.push(`${pendingRegistrationsCount} member approval${pendingRegistrationsCount > 1 ? 's' : ''}`);
    }
    if (!gamificationState.hasClaimedDailyChallenge) {
      alerts.push('Daily bounty unclaimed');
    }

    if (alerts.length > 0) {
      return alerts.join(' • ');
    }
    return 'All comms clear • Flight systems nominal';
  }, [unreadMessagesCount, pendingRequestsCount, isAdmin, pendingRegistrationsCount, gamificationState.hasClaimedDailyChallenge]);

  // Briefing refresh handler with async simulation and error handling
  const handleRefreshBriefing = useCallback(async () => {
    setIsRefreshing(true);
    setRefreshError(null);

    const startTime = Date.now();
    try {
      // Re-sync endpoints if possible
      const promises: Promise<any>[] = [];
      if (isAdmin && fetchAdminApprovals) {
        promises.push(fetchAdminApprovals());
      }
      promises.push(fetch('/api/posts').catch(() => null));
      promises.push(fetch('/api/users').catch(() => null));

      await Promise.all(promises);

      // Ensure minimal animation visibility (at least 600ms)
      const elapsed = Date.now() - startTime;
      if (elapsed < 600) {
        await new Promise((r) => setTimeout(r, 600 - elapsed));
      }

      setLastRefreshedAt(new Date());
    } catch (err) {
      // Gracefully handle error and preserve last valid briefing
      setRefreshError('Orbital telemetry signal weak. Displaying cached galaxy briefing.');
      setTimeout(() => setRefreshError(null), 5000);
    } finally {
      setIsRefreshing(false);
    }
  }, [isAdmin, fetchAdminApprovals]);

  // Dismiss / Reset cards
  const handleDismissCard = useCallback((cardId: string) => {
    setDismissedCardIds((prev) => {
      const updated = [...prev, cardId];
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('interstellers_dismissed_briefing_cards', JSON.stringify(updated));
        } catch (_) {}
      }
      return updated;
    });
  }, []);

  const handleResetDismissed = useCallback(() => {
    setDismissedCardIds([]);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('interstellers_dismissed_briefing_cards');
      } catch (_) {}
    }
  }, []);

  // Generate real contextual discovery cards based purely on active application data
  const discoveryCards = useMemo<DiscoveryCard[]>(() => {
    const cards: DiscoveryCard[] = [];

    // 0. Public Video Message Card
    cards.push({
      id: 'card_public_video_transmission',
      category: 'comms',
      title: 'Public Video Transmission Active',
      description: 'An official video message broadcast has been uploaded to orbit. Watch the latest community update from the bridge.',
      badge: 'Video Stream 🎥',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      icon: <Film className="w-5 h-5 text-rose-300 animate-pulse" />,
      iconBg: 'bg-rose-500/20 border-rose-400/40',
      actionLabel: 'Watch Video',
      onAction: () => {
        const el = document.getElementById('public-video-transmission');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      },
      canDismiss: true,
    });

    // 1. Unread Communications Card
    if (unreadMessagesCount > 0) {
      cards.push({
        id: 'card_unread_messages',
        category: 'comms',
        title: `Incoming Communications (${unreadMessagesCount})`,
        description: `You have ${unreadMessagesCount} unread message${unreadMessagesCount > 1 ? 's' : ''} waiting in your communications bay.`,
        badge: 'Priority 🛰️',
        badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        icon: <MessageSquare className="w-5 h-5 text-cyan-300 animate-pulse" />,
        iconBg: 'bg-cyan-500/20 border-cyan-400/40',
        actionLabel: 'Open Messages',
        onAction: () => router.push('/messages'),
        canDismiss: true,
      });
    }

    // 2. Pending Fellow Requests Card
    if (pendingRequestsCount > 0) {
      cards.push({
        id: 'card_pending_requests',
        category: 'social',
        title: `Fellow Travelers Docking (${pendingRequestsCount})`,
        description: `${pendingRequestsCount} space traveler${pendingRequestsCount > 1 ? 's are' : ' is'} requesting to link orbits with your crew manifest.`,
        badge: 'Docking Request',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        icon: <UserPlus className="w-5 h-5 text-emerald-300" />,
        iconBg: 'bg-emerald-500/20 border-emerald-400/40',
        actionLabel: 'Review Requests',
        onAction: () => router.push('/friends'),
        canDismiss: true,
      });
    }

    // 3. Admin Approvals Queue (Akshay only)
    if (isAdmin && pendingRegistrationsCount > 0) {
      cards.push({
        id: 'card_admin_approvals',
        category: 'admin',
        title: `Security Airlock Approvals (${pendingRegistrationsCount})`,
        description: `${pendingRegistrationsCount} newly arrived explorer${pendingRegistrationsCount > 1 ? 's are' : ' is'} waiting in the security airlock for your clearance.`,
        badge: 'Admin Task 🛡️',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        icon: <ShieldCheck className="w-5 h-5 text-amber-300 animate-pulse" />,
        iconBg: 'bg-amber-500/20 border-amber-400/40',
        actionLabel: 'Open Approvals',
        onAction: () => setIsApprovalsModalOpen(true),
        canDismiss: false,
      });
    }

    // 4. Daily Orbital Bounty
    if (!gamificationState.hasClaimedDailyChallenge) {
      cards.push({
        id: 'card_daily_bounty',
        category: 'arcade',
        title: 'Daily Flight Bounty Available',
        description: 'Claim your daily +1,500 XP and Star Credits flight stipend in the Arcade before the next orbital cycle.',
        badge: '+1500 XP Ready',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        icon: <Trophy className="w-5 h-5 text-purple-300" />,
        iconBg: 'bg-purple-500/20 border-purple-400/40',
        actionLabel: 'Go to Arcade',
        onAction: () => router.push('/arcade'),
        canDismiss: true,
      });
    }

    // 5. Unexplored Arcade Games Recommendation
    if (userGameScoresCount === 0) {
      cards.push({
        id: 'card_arcade_unexplored',
        category: 'arcade',
        title: 'Uncharted Cosmic Arcade',
        description: 'You have not logged a score yet! Compete in Reaction Warp, Asteroid Dodge, or Cosmic Quiz to climb the Galaxy Leaderboard.',
        badge: 'Arcade 🔥',
        badgeColor: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40',
        icon: <Gamepad2 className="w-5 h-5 text-fuchsia-300" />,
        iconBg: 'bg-fuchsia-500/20 border-fuchsia-400/40',
        actionLabel: 'Launch Arcade',
        onAction: () => router.push('/arcade'),
        canDismiss: true,
      });
    }

    // 6. Space House Allegiance (Galactic Law #44)
    if (!userHouse) {
      cards.push({
        id: 'card_space_house',
        category: 'house',
        title: 'Select Your Space House',
        description: 'Under Galactic Law #44, choose Marvel, DC, Pokemon, or Power Rangers for your 30-day residency to compete for house glory.',
        badge: '1-Month Residency',
        badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
        icon: <Layers className="w-5 h-5 text-pink-300" />,
        iconBg: 'bg-pink-500/20 border-pink-400/40',
        actionLabel: 'Choose House',
        onAction: () => router.push('/groups'),
        canDismiss: true,
      });
    }

    // 7. Fellows Compatibility Protocol (15 Questions)
    if (!fellowsAnswers || Object.keys(fellowsAnswers).length < 15) {
      cards.push({
        id: 'card_fellows_compatibility',
        category: 'social',
        title: 'Calibrate Compatibility Matrix',
        description: 'Complete Nova\'s 15-question traveler matching protocol to discover compatible fellows across the galaxy.',
        badge: '15 Questions',
        badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
        icon: <Radio className="w-5 h-5 text-indigo-300" />,
        iconBg: 'bg-indigo-500/20 border-indigo-400/40',
        actionLabel: 'Start Protocol',
        onAction: () => router.push('/messages'),
        canDismiss: true,
      });
    }

    // 8. Active Space Station Wormhole
    if (activeStationWormhole) {
      cards.push({
        id: 'card_station_wormhole',
        category: 'mission',
        title: `Wormhole Active: ${activeStationWormhole.name}`,
        description: `An active wormhole corridor connects to ${activeStationWormhole.activeWormhole?.connectedStationName || 'Station Citadel'}. Dock your craft to explore!`,
        badge: 'Space Transit',
        badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        icon: <Zap className="w-5 h-5 text-cyan-300" />,
        iconBg: 'bg-cyan-500/20 border-cyan-400/40',
        actionLabel: 'Dock Station',
        onAction: () => router.push('/stations'),
        canDismiss: true,
      });
    }

    // 9. Nova AI Co-Pilot Recommendation (if few other cards exist)
    if (cards.length < 3) {
      cards.push({
        id: 'card_nova_ai',
        category: 'ai',
        title: 'Nova AI Assistant Online',
        description: 'Need help drafting a discussion, finding code solutions, or exploring cosmic lore? Nova is primed to assist.',
        badge: 'Omniscient AI',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        icon: <Bot className="w-5 h-5 text-blue-300" />,
        iconBg: 'bg-blue-500/20 border-blue-400/40',
        actionLabel: 'Consult Nova',
        onAction: () => setIsAIPanelOpen(true),
        canDismiss: true,
      });
    }

    return cards;
  }, [
    unreadMessagesCount,
    pendingRequestsCount,
    isAdmin,
    pendingRegistrationsCount,
    gamificationState.hasClaimedDailyChallenge,
    userGameScoresCount,
    userHouse,
    fellowsAnswers,
    activeStationWormhole,
    router,
    setIsApprovalsModalOpen,
    setIsAIPanelOpen,
  ]);

  // Filter out user-dismissed cards
  const visibleCards = useMemo(() => {
    return discoveryCards.filter((card) => !dismissedCardIds.includes(card.id));
  }, [discoveryCards, dismissedCardIds]);

  const dismissedCount = discoveryCards.length - visibleCards.length;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Personalized Welcome & Telemetry Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-950/80 to-purple-950/60 border border-cyan-500/35 shadow-[0_0_25px_rgba(0,240,255,0.14)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* User Profile Overview */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative shrink-0">
              <Avatar
                src={currentUser?.avatar}
                name={userDisplayName}
                size="lg"
                status="online"
                showStatus
                className="ring-2 ring-cyan-400/40 shadow-sm"
              />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400/20 border border-cyan-400/60 flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-cyan-300" />
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-heading font-extrabold text-base sm:text-lg text-white truncate">
                  {greetingTimeOfDay}, <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">{userDisplayName}</span>!
                </h2>
                {currentUser?.isVerified && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 font-mono">
                    VERIFIED
                  </span>
                )}
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                    HOST & ADMIN
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-cyan-200/80 mt-0.5 flex-wrap">
                <span className="font-mono text-cyan-300/90">{userHandleText}</span>
                <span>•</span>
                <span className="truncate">{userRoleText}</span>
                <span>•</span>
                <span className="text-amber-300 font-bold flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  Level {gamificationState?.travelerLevel || 1}
                </span>
                {gamificationState?.currentStreak > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-rose-300 font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3 text-rose-400 animate-pulse" />
                      {gamificationState.currentStreak}d Streak
                    </span>
                  </>
                )}
              </div>

              {/* Status Sentence */}
              <p className="text-xs text-slate-300 mt-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span className="font-medium text-cyan-100">{telemetrySummary}</span>
              </p>
            </div>
          </div>

          {/* Refresh Briefing Control */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
            <button
              onClick={handleRefreshBriefing}
              disabled={isRefreshing}
              className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 border',
                isRefreshing
                  ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40 cursor-wait'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-white border-cyan-500/35 hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(0,240,255,0.3)]'
              )}
              title="Refresh your galaxy telemetry without reloading the page"
            >
              <RefreshCw className={cn('w-3.5 h-3.5 text-cyan-400', isRefreshing && 'animate-spin')} />
              <span>{isRefreshing ? 'Syncing Galaxy...' : 'Refresh Briefing'}</span>
            </button>

            <span className="text-[10px] text-slate-400 font-mono">
              Telemetry synced: {lastRefreshedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Refresh Error Alert Banner (Auto-dismisses) */}
        {refreshError && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="flex-1">{refreshError}</span>
            <button onClick={() => setRefreshError(null)} className="text-amber-400 hover:text-amber-200">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Contextual Discovery Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <h3 className="font-heading font-bold text-xs sm:text-sm text-white uppercase tracking-wider">
              Contextual Discovery & Next Actions
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              {visibleCards.length} Available
            </span>
          </div>

          {dismissedCount > 0 && (
            <button
              onClick={handleResetDismissed}
              className="text-[11px] font-semibold text-cyan-300 hover:text-cyan-200 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restore {dismissedCount} dismissed</span>
            </button>
          )}
        </div>

        {/* Discovery Cards Grid */}
        {visibleCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {visibleCards.map((card) => (
              <div
                key={card.id}
                className="group relative p-4 rounded-2xl bg-surface-container-lowest border border-cyan-500/30 hover:border-cyan-400/60 transition-all duration-200 shadow-[0_0_20px_rgba(0,240,255,0.08)] hover:shadow-[0_0_25px_rgba(0,240,255,0.22)] flex flex-col justify-between space-y-3"
              >
                {/* Card Header & Dismiss Button */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={cn('p-2.5 rounded-xl border shrink-0 shadow-sm', card.iconBg)}>
                      {card.icon}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-heading font-bold text-xs sm:text-sm text-white group-hover:text-cyan-300 transition-colors">
                          {card.title}
                        </h4>
                        {card.badge && (
                          <span className={cn('text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border', card.badgeColor)}>
                            {card.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300/90 leading-relaxed mt-1">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  {card.canDismiss && (
                    <button
                      onClick={() => handleDismissCard(card.id)}
                      className="text-slate-400 hover:text-rose-400 transition-colors p-1 rounded-lg hover:bg-white/5"
                      title="Dismiss this suggestion for this session"
                      aria-label="Dismiss card"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Card Action Button */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-end">
                  <button
                    onClick={card.onAction}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/25 to-purple-500/25 hover:from-cyan-500/40 hover:to-purple-500/40 text-cyan-200 hover:text-white border border-cyan-400/50 hover:border-cyan-300 hover:shadow-[0_0_15px_rgba(0,240,255,0.35)] text-xs font-bold transition-all shadow-xs active:scale-95"
                  >
                    <span>{card.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty / Nominal State */
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-emerald-500/30 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-bold text-sm text-white">
              All Systems Nominal & Caught Up
            </h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              You have no pending messages or alerts requiring your attention. Explore community updates below, launch games in the Arcade, or connect with fellow travelers!
            </p>
            {dismissedCount > 0 && (
              <button
                onClick={handleResetDismissed}
                className="text-xs font-bold text-cyan-300 hover:underline pt-1 inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Show {dismissedCount} dismissed suggestions</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick Galactic Navigation Shortcuts */}
      <div className="pt-2 border-t border-cyan-500/20">
        <p className="text-[11px] font-mono text-cyan-300/80 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>Quick Flight Jumps</span>
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <Link
            href="/arcade"
            className="p-2.5 rounded-xl bg-surface-container-lowest hover:bg-slate-800/80 border border-purple-500/30 hover:border-purple-400/60 text-xs font-semibold text-slate-100 hover:text-purple-300 flex items-center gap-2 transition-all shadow-xs"
          >
            <Gamepad2 className="w-4 h-4 text-purple-400 shrink-0" />
            <div className="min-w-0">
              <div className="truncate font-bold">Arcade</div>
              <div className="text-[10px] text-slate-400 font-mono">5 Mini-Games</div>
            </div>
          </Link>

          <Link
            href="/messages"
            className="p-2.5 rounded-xl bg-surface-container-lowest hover:bg-slate-800/80 border border-cyan-500/30 hover:border-cyan-400/60 text-xs font-semibold text-slate-100 hover:text-cyan-300 flex items-center gap-2 transition-all shadow-xs"
          >
            <MessageSquare className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="min-w-0">
              <div className="truncate font-bold">Fellows Bay</div>
              <div className="text-[10px] text-slate-400 font-mono">
                {unreadMessagesCount > 0 ? `${unreadMessagesCount} unread` : 'Direct Comms'}
              </div>
            </div>
          </Link>

          <Link
            href="/friends"
            className="p-2.5 rounded-xl bg-surface-container-lowest hover:bg-slate-800/80 border border-emerald-500/30 hover:border-emerald-400/60 text-xs font-semibold text-slate-100 hover:text-emerald-300 flex items-center gap-2 transition-all shadow-xs"
          >
            <UserPlus className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <div className="truncate font-bold">Directory</div>
              <div className="text-[10px] text-slate-400 font-mono">
                {pendingRequestsCount > 0 ? `${pendingRequestsCount} requests` : 'Crew Registry'}
              </div>
            </div>
          </Link>

          <Link
            href="/groups"
            className="p-2.5 rounded-xl bg-surface-container-lowest hover:bg-slate-800/80 border border-pink-500/30 hover:border-pink-400/60 text-xs font-semibold text-slate-100 hover:text-pink-300 flex items-center gap-2 transition-all shadow-xs"
          >
            <Layers className="w-4 h-4 text-pink-400 shrink-0" />
            <div className="min-w-0">
              <div className="truncate font-bold">Space Houses</div>
              <div className="text-[10px] text-slate-400 font-mono">
                {userHouse ? userHouse.toUpperCase() : 'Choose House'}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
