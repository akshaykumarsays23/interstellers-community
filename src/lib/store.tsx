'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Post,
  ChatThread,
  GroupChannel,
  FriendRequest,
  AppNotification,
  AIMessage,
  UserSettings,
  Message,
  Comment,
  RegistrationRequest,
  TravelerGamificationState,
  ArcadeGame,
  GameScoreRecord,
  LeaderboardEntry,
  Mission,
  Achievement,
  StarCreditItem,
  SpaceStation,
  Crew,
  TimeCapsule,
  GameId,
} from './types';

import {
  CURRENT_USER,
  HOST_USER,
  GUEST_USER,
  INITIAL_USERS,
  INITIAL_POSTS,
  INITIAL_CHATS,
  INITIAL_GROUPS,
  INITIAL_FRIEND_REQUESTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AI_MESSAGES,
  DEFAULT_SETTINGS
} from './data';

import {
  INITIAL_ARCADE_GAMES,
  INITIAL_MISSIONS,
  INITIAL_ACHIEVEMENTS,
  STAR_CREDIT_SHOP_ITEMS,
  INITIAL_SPACE_STATIONS,
  INITIAL_CREWS,
  INITIAL_GLOBAL_LEADERBOARD,
} from './arcadeData';
import { generateId, formatTime } from './utils';

export const getDMThreadId = (handleA: string, handleB: string): string => {
  const cleanA = (handleA || '').toLowerCase().trim();
  const cleanB = (handleB || '').toLowerCase().trim();
  if (cleanA === 'nova_ai' || cleanB === 'nova_ai' || cleanA === 'ai_nova' || cleanB === 'ai_nova') {
    return 'chat_nova';
  }
  const sorted = [cleanA, cleanB].sort();
  return `chat_dm_${sorted[0]}_${sorted[1]}`;
};

interface CallState {
  isOpen: boolean;
  type: 'audio' | 'video';
  participant?: User;
  groupName?: string;
  isMuted: boolean;
  isVideoOff: boolean;
  duration: number;
}

interface AppContextType {
  // Auth & Approval State
  isAuthenticated: boolean;
  isAdmin: boolean;
  pendingApprovalUser: { name: string; email: string } | null;
  setPendingApprovalUser: (val: { name: string; email: string } | null) => void;
  sendVerificationCode: (email: string, name?: string, type?: 'register' | 'signin') => Promise<{ success: boolean; code?: string; otpToken?: string; message?: string; error?: string }>;
  verifyLoginCode: (email: string, code: string, name?: string, otpToken?: string) => Promise<{ success: boolean; status?: 'approved' | 'pending'; message?: string; error?: string }>;
  login: (email?: string, name?: string) => Promise<{ success: boolean; requiresApproval?: boolean }>;
  registerNewUser: (name: string, email: string) => Promise<void>;
  logout: () => void;
  checkMyApprovalStatus: () => Promise<boolean>;

  // Device & Visitor Analytics
  activeDevicesCount: number;
  totalDevicesCount: number;

  // Registration Approval Queue (for Akshay)
  registrationRequests: RegistrationRequest[];
  approveRegistration: (requestId: string) => Promise<void>;
  rejectRegistration: (requestId: string) => Promise<void>;
  kickOutUser: (requestId: string) => Promise<void>;
  pendingRegistrationsCount: number;
  isApprovalsModalOpen: boolean;
  setIsApprovalsModalOpen: (open: boolean) => void;
  fetchAdminApprovals: () => Promise<void>;

  // User & Settings
  currentUser: User;
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  updateProfile: (profile: { name: string; bio: string; role: string; avatar?: string }) => void;

  // Share / Invite Modal
  isShareModalOpen: boolean;
  setIsShareModalOpen: (open: boolean) => void;

  // Posts Feed Controls
  posts: Post[];
  createPost: (content: string, mediaUrl?: string, mediaType?: 'image' | 'video', tags?: string[]) => void;
  updatePost: (postId: string, newContent?: string, newMediaUrl?: string) => void;
  toggleLikePost: (postId: string) => void;
  toggleBookmarkPost: (postId: string) => void;
  addCommentToPost: (postId: string, content: string) => void;
  voteInPoll: (postId: string, optionId: string) => void;
  deletePost: (postId: string) => void;

  // Direct Messaging
  chats: ChatThread[];
  activeChatId: string;
  setActiveChatId: (id: string) => void;
  startChatWithUser: (user: User) => string;
  sendMessage: (threadId: string, text: string, mediaUrl?: string) => void;
  requestDeleteMessage: (threadId: string, messageId: string) => void;
  acceptDeleteMessage: (threadId: string, messageId: string) => void;
  rejectDeleteMessage: (threadId: string, messageId: string) => void;
  markChatAsRead: (threadId: string) => void;
  toggleChatPin: (threadId: string) => void;
  toggleChatArchive: (threadId: string) => void;
  activeChat?: ChatThread;

  // Group Hub
  groups: GroupChannel[];
  activeGroupId: string;
  setActiveGroupId: (id: string) => void;
  toggleJoinGroup: (groupId: string) => void;
  sendGroupMessage: (groupId: string, text: string) => void;
  activeGroup?: GroupChannel;

  // Connections / Friends
  connections: User[];
  friendRequests: FriendRequest[];
  acceptFriendRequest: (requestId: string) => void;
  declineFriendRequest: (requestId: string) => void;
  removeConnection: (userId: string) => void;
  addConnection: (user: User) => void;

  // AI Assistant (Nova)
  aiMessages: AIMessage[];
  isAITyping: boolean;
  sendAIMessage: (prompt: string) => void;
  retryAIMessage: (failedPrompt: string) => void;
  clearAIChat: () => void;
  isAIPanelOpen: boolean;
  setIsAIPanelOpen: (open: boolean) => void;
  isNovaVoiceOpen: boolean;
  setIsNovaVoiceOpen: (open: boolean) => void;

  // Notifications
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotification: (id: string) => void;
  unreadNotificationsCount: number;

  // Global Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Calls Simulation
  callState: CallState;
  startCall: (type: 'audio' | 'video', participant?: User, groupName?: string) => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;

  // Interstellers Arcade & Galaxy Gamification
  gamificationState: TravelerGamificationState;
  arcadeGames: ArcadeGame[];
  gameScores: GameScoreRecord[];
  leaderboard: LeaderboardEntry[];
  missions: Mission[];
  achievements: Achievement[];
  crews: Crew[];
  stations: SpaceStation[];
  timeCapsules: TimeCapsule[];
  shopItems: StarCreditItem[];
  recordGameScore: (gameId: GameId, score: number, statsDetails: string) => Promise<{ xpEarned: number; starCreditsEarned: number }>;
  addXP: (amount: number, starCreditsAmount?: number) => void;
  claimDailyChallenge: (score: number) => { success: boolean; message: string };
  completeMission: (missionId: string) => void;
  unlockAchievement: (achievementId: string) => void;
  purchaseCosmetic: (itemId: string) => { success: boolean; error?: string };
  equipCosmetic: (type: 'background' | 'frame' | 'nameEffect' | 'chatTheme', idOrClass?: string) => void;
  toggleJoinCrew: (crewId: string) => void;
  useEmergencyWarpPass: () => boolean;
  createTimeCapsule: (content: string, unlockAt: string, mediaUrl?: string) => void;
  restoreGhostOrbit: () => void;

}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User>(GUEST_USER);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [pendingApprovalUser, setPendingApprovalUser] = useState<{ name: string; email: string } | null>(null);
  
  // Registration requests from backend
  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>([]);
  const [isApprovalsModalOpen, setIsApprovalsModalOpen] = useState<boolean>(false);

  // Visitor & Active Device Tracking
  const [activeDevicesCount, setActiveDevicesCount] = useState<number>(1);
  const [totalDevicesCount, setTotalDevicesCount] = useState<number>(1);

  // Auto-ping visitor device tracking
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let deviceId = localStorage.getItem('interstellers_device_id');
    if (!deviceId) {
      deviceId = 'dev_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      localStorage.setItem('interstellers_device_id', deviceId);
    }

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const deviceType = isMobile ? 'Mobile' : 'Desktop';

    const pingDevice = async () => {
      try {
        const res = await fetch('/api/visitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId, deviceType }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.activeCount !== undefined) setActiveDevicesCount(data.activeCount);
          if (data.totalDevices !== undefined) setTotalDevicesCount(data.totalDevices);
        }
      } catch (_) {}
    };

    pingDevice();
    const interval = setInterval(pingDevice, 10000);
    return () => clearInterval(interval);
  }, []);

  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [chats, setChats] = useState<ChatThread[]>(INITIAL_CHATS);
  const [serverMessages, setServerMessages] = useState<Record<string, Message[]>>({});
  const [activeChatId, setActiveChatId] = useState<string>("chat_nova");
  const [groups, setGroups] = useState<GroupChannel[]>(INITIAL_GROUPS);
  const [activeGroupId, setActiveGroupId] = useState<string>("grp_general");
  const [connections, setConnections] = useState<User[]>(INITIAL_USERS);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(INITIAL_FRIEND_REQUESTS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>(INITIAL_AI_MESSAGES);
  const [isAITyping, setIsAITyping] = useState<boolean>(false);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState<boolean>(false);
  const [isNovaVoiceOpen, setIsNovaVoiceOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);



  // Interstellers Arcade & Galaxy Gamification State
  const [gamificationState, setGamificationState] = useState<TravelerGamificationState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('interstellers_gamification_state');
      if (saved) {
        try { return JSON.parse(saved); } catch (_) {}
      }
    }
    return {
      travelerLevel: 27,
      xp: 8420,
      xpToNextLevel: 10000,
      starCredits: 4820,
      signalStrength: 84,
      orbitStability: 91,
      currentStreak: 18,
      emergencyWarpPasses: 2,
      isGhostOrbit: false,
      lastActiveDate: new Date().toISOString(),
      hasClaimedDailyChallenge: false,
      unlockedCosmetics: ['bg_cyber_nebula', 'frame_neon_plasma', 'name_holographic'],
      equippedCosmetics: {
        background: 'bg_cyber_nebula',
        frame: 'frame_neon_plasma',
        nameEffect: 'name_holographic',
      },
      moderationState: 'NORMAL',
    };
  });

  const [arcadeGames, setArcadeGames] = useState<ArcadeGame[]>(INITIAL_ARCADE_GAMES);
  const [gameScores, setGameScores] = useState<GameScoreRecord[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(INITIAL_GLOBAL_LEADERBOARD);
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [crews, setCrews] = useState<Crew[]>(INITIAL_CREWS);
  const [stations, setStations] = useState<SpaceStation[]>(INITIAL_SPACE_STATIONS);
  const [timeCapsules, setTimeCapsules] = useState<TimeCapsule[]>([]);
  const shopItems = STAR_CREDIT_SHOP_ITEMS;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('interstellers_gamification_state', JSON.stringify(gamificationState));
    }
  }, [gamificationState]);

  const addXP = (amount: number, starCreditsAmount = 0) => {
    setGamificationState((prev) => {
      let nextXP = prev.xp + amount;
      let nextLevel = prev.travelerLevel;
      let nextXPToNext = prev.xpToNextLevel;

      while (nextXP >= nextXPToNext) {
        nextLevel += 1;
        nextXPToNext += 2500;
      }

      const nextSignal = Math.min(100, prev.signalStrength + 1);

      return {
        ...prev,
        xp: nextXP,
        travelerLevel: nextLevel,
        xpToNextLevel: nextXPToNext,
        starCredits: prev.starCredits + starCreditsAmount,
        signalStrength: nextSignal,
      };
    });
  };

  const unlockAchievement = (achievementId: string) => {
    setAchievements((prev) =>
      prev.map((a) => {
        if (a.id === achievementId && !a.isUnlocked) {
          addXP(a.rewardXP, a.rewardStarCredits);
          return { ...a, isUnlocked: true, unlockedAt: new Date().toISOString().split('T')[0] };
        }
        return a;
      })
    );
  };

  const recordGameScore = async (gameId: GameId, score: number, statsDetails: string) => {
    let xpEarned = Math.min(500, Math.floor(score / 10) + 60);
    let starCreditsEarned = Math.min(250, Math.floor(score / 20) + 25);

    if (gameId === 'reaction_warp') {
      const speedBonus = Math.max(10, 400 - score);
      xpEarned = Math.floor(speedBonus / 2) + 80;
      starCreditsEarned = Math.floor(speedBonus / 4) + 40;
    }

    const newRecord: GameScoreRecord = {
      id: `score_${generateId()}`,
      gameId,
      userId: currentUser.handle || currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      score,
      statsDetails,
      xpEarned,
      starCreditsEarned,
      timestamp: formatTime(),
    };

    setGameScores((prev) => [newRecord, ...prev]);

    setArcadeGames((prev) =>
      prev.map((game) => {
        if (game.id === gameId) {
          return {
            ...game,
            highScore: Math.max(game.highScore, score),
            playsCount: game.playsCount + 1,
          };
        }
        return game;
      })
    );

    addXP(xpEarned, starCreditsEarned);

    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === 'mission_1' && !m.isCompleted) {
          return { ...m, isCompleted: true, progress: 1 };
        }
        if (m.id === 'mission_6' && !m.isCompleted) {
          const nextProg = Math.min(m.maxProgress, m.progress + 1);
          return { ...m, progress: nextProg, isCompleted: nextProg >= m.maxProgress };
        }
        return m;
      })
    );

    if (gameId === 'reaction_warp' && score <= 250) {
      unlockAchievement('ach_3');
    }
    if (gameId === 'asteroid_dodge' && score >= 10000) {
      unlockAchievement('ach_4');
    }

    try {
      await fetch('/api/arcade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit_score', scoreRecord: newRecord }),
      });
    } catch (_) {}

    return { xpEarned, starCreditsEarned };
  };

  const claimDailyChallenge = (score: number) => {
    const today = new Date().toISOString().split('T')[0];
    if (gamificationState.hasClaimedDailyChallenge && gamificationState.lastDailyChallengeDate === today) {
      return { success: false, message: 'You have already claimed today\'s Galaxy Challenge reward! Reset at midnight.' };
    }

    addXP(350, 150);
    setGamificationState((prev) => ({
      ...prev,
      hasClaimedDailyChallenge: true,
      lastDailyChallengeDate: today,
    }));

    setMissions((prev) =>
      prev.map((m) => (m.id === 'mission_4' ? { ...m, isCompleted: true, progress: 1 } : m))
    );

    return { success: true, message: '🌠 TODAY\'S GALAXY CHALLENGE COMPLETED! +350 XP & +150 ⭐ Star Credits awarded!' };
  };

  const completeMission = (missionId: string) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === missionId && !m.isCompleted) {
          addXP(m.rewardXP, m.rewardStarCredits);
          return { ...m, isCompleted: true, progress: m.maxProgress };
        }
        return m;
      })
    );
  };

  const purchaseCosmetic = (itemId: string) => {
    const item = shopItems.find((i) => i.id === itemId);
    if (!item) return { success: false, error: 'Item not found' };

    if (gamificationState.starCredits < item.price) {
      return { success: false, error: `Insufficient Star Credits! Required: ${item.price} ⭐` };
    }

    setGamificationState((prev) => ({
      ...prev,
      starCredits: prev.starCredits - item.price,
      unlockedCosmetics: [...prev.unlockedCosmetics, itemId],
    }));

    return { success: true };
  };

  const equipCosmetic = (type: 'background' | 'frame' | 'nameEffect' | 'chatTheme', idOrClass?: string) => {
    setGamificationState((prev) => ({
      ...prev,
      equippedCosmetics: {
        ...prev.equippedCosmetics,
        [type]: idOrClass,
      },
    }));
  };

  const toggleJoinCrew = (crewId: string) => {
    setCrews((prev) =>
      prev.map((c) => (c.id === crewId ? { ...c, isJoined: !c.isJoined, membersCount: c.isJoined ? c.membersCount - 1 : c.membersCount + 1 } : c))
    );
  };

  const useEmergencyWarpPass = () => {
    if (gamificationState.emergencyWarpPasses <= 0) return false;
    setGamificationState((prev) => ({
      ...prev,
      emergencyWarpPasses: prev.emergencyWarpPasses - 1,
      currentStreak: prev.currentStreak + 1,
    }));
    return true;
  };

  const createTimeCapsule = (content: string, unlockAt: string, mediaUrl?: string) => {
    const capsule: TimeCapsule = {
      id: `capsule_${generateId()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      content,
      createdAt: formatTime(),
      unlockAt,
      isUnlocked: false,
      mediaUrl,
    };
    setTimeCapsules((prev) => [capsule, ...prev]);
  };

  const restoreGhostOrbit = () => {
    setGamificationState((prev) => ({
      ...prev,
      isGhostOrbit: false,
      orbitStability: 100,
      signalStrength: 95,
    }));
  };

  // Fetch real-time server messages for cross-account synchronization
  const fetchServerMessages = async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        if (data.messages && typeof data.messages === 'object') {
          setServerMessages(data.messages);
        }
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchServerMessages();
    const interval = setInterval(fetchServerMessages, 2500);
    return () => clearInterval(interval);
  }, []);

  // 14-Minute Auto Nova Reminder Trigger (Exact 14 Minutes)
  useEffect(() => {
    if (!currentUser?.handle) return;

    const timer = setTimeout(() => {
      setIsAIPanelOpen(true);
      const reminderMsg: AIMessage = {
        id: `aim_${generateId()}`,
        sender: 'ai',
        text: `Hey Space Traveler! 🚀 Exactly 14 minutes have passed since launch and your daily missions are still pending!\n\nYou still need to finish your missions, or what do you want to do right now?`,
        timestamp: formatTime(),
        suggestedActions: [
          "🚀 I want to post a post",
          "📡 Check 20 Crazy Flight Missions",
          "🪐 View Traveler Reputation HUD"
        ],
      };
      setAiMessages((prev) => [...prev, reminderMsg]);
    }, 14 * 60 * 1000);

    return () => clearTimeout(timer);
  }, [currentUser]);

  // Re-build & synchronize chats threads whenever serverMessages, connections or currentUser changes
  useEffect(() => {
    if (!currentUser?.handle) return;

    const currentHandle = currentUser.handle.toLowerCase().trim();

    // 1. Always include Nova AI assistant chat
    const novaThread: ChatThread = {
      id: 'chat_nova',
      participant: {
        id: 'ai_nova',
        name: 'Nova AI Assistant',
        handle: 'nova_ai',
        avatar: '',
        bio: 'Your autonomous galactic navigator and workspace assistant.',
        role: 'AI Navigator',
        status: 'online',
        isVerified: true,
      },
      lastMessage: 'Welcome to Interstellers! How can I assist you today?',
      lastMessageTime: 'Just now',
      unreadCount: 0,
      isPinned: true,
      messages: [
        {
          id: 'm_welcome',
          senderId: 'ai_nova',
          text: 'Welcome to Interstellers! "Time is never coming back, remember time is never..." I\'m Nova, your AI assistant. You can chat with me, invite friends, and create spaces anytime.',
          timestamp: 'Just now',
          time: 'Just now',
          status: 'read',
        },
      ],
    };

    const novaMsgs = serverMessages['chat_nova'];
    if (novaMsgs && novaMsgs.length > 0) {
      novaThread.messages = novaMsgs;
      const lastM = novaMsgs[novaMsgs.length - 1];
      novaThread.lastMessage = lastM.text || 'Shared media';
      novaThread.lastMessageTime = lastM.timestamp || lastM.time;
    }

    const threadList: ChatThread[] = [novaThread];
    const processedThreadIds = new Set<string>(['chat_nova']);
    const processedHandles = new Set<string>([currentHandle, 'nova_ai', 'ai_nova']);

    // 2. Build threads for all registered connections / users
    connections.forEach((conn) => {
      if (!conn.handle) return;
      const cleanH = conn.handle.toLowerCase().trim();
      if (processedHandles.has(cleanH)) return;

      const threadId = getDMThreadId(currentHandle, cleanH);
      if (processedThreadIds.has(threadId)) return;

      processedThreadIds.add(threadId);
      processedHandles.add(cleanH);

      const msgs = serverMessages[threadId] || [];
      const lastMsgObj = msgs.length > 0 ? msgs[msgs.length - 1] : null;

      threadList.push({
        id: threadId,
        participant: conn,
        lastMessage: lastMsgObj ? (lastMsgObj.text || 'Shared media') : 'No messages yet. Click to chat!',
        lastMessageTime: lastMsgObj ? (lastMsgObj.timestamp || lastMsgObj.time) : '',
        unreadCount: msgs.filter((m) => m.senderId !== currentUser.id && m.senderHandle !== currentHandle && m.status !== 'read').length,
        messages: msgs,
      });
    });

    // 3. Include any other threads in serverMessages involving currentUser
    Object.keys(serverMessages).forEach((tId) => {
      if (processedThreadIds.has(tId)) return;
      if (tId.startsWith('chat_dm_') && tId.includes(currentHandle)) {
        const handles = tId.replace('chat_dm_', '').split('_');
        const otherHandle = handles.find((h) => h !== currentHandle) || handles[0];
        if (processedHandles.has(otherHandle)) return;

        processedThreadIds.add(tId);
        processedHandles.add(otherHandle);

        const msgs = serverMessages[tId] || [];
        const lastMsgObj = msgs.length > 0 ? msgs[msgs.length - 1] : null;

        const otherUser = connections.find((c) => c.handle?.toLowerCase() === otherHandle) || {
          id: `user_${otherHandle}`,
          name: otherHandle,
          handle: otherHandle,
          avatar: '',
          bio: 'Verified Member at Interstellers.',
          role: 'Community Member',
          status: 'online',
          isVerified: true,
        };

        threadList.push({
          id: tId,
          participant: otherUser as User,
          lastMessage: lastMsgObj ? (lastMsgObj.text || 'Shared media') : 'No messages yet.',
          lastMessageTime: lastMsgObj ? (lastMsgObj.timestamp || lastMsgObj.time) : '',
          unreadCount: msgs.filter((m) => m.senderId !== currentUser.id && m.senderHandle !== currentHandle && m.status !== 'read').length,
          messages: msgs,
        });
      }
    });

    setChats(threadList);
  }, [serverMessages, connections, currentUser]);

  const [callState, setCallState] = useState<CallState>({
    isOpen: false,
    type: 'audio',
    isMuted: false,
    isVideoOff: false,
    duration: 0,
  });

  const isAdmin =
    isAuthenticated &&
    (currentUser.handle === 'akshay' ||
      currentUser.id === 'user_host' ||
      currentUser.email === 'akshaycricketer1230@gmail.com' ||
      currentUser.email === 'akshay@interstellers.space');

  // Load session & saved server profile on start
  // Load session, saved server profile & saved posts on start
  useEffect(() => {
    try {
      // 0. Sync saved theme from localStorage on start
      if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('interstellers_theme');
        if (savedTheme === 'dark' || savedTheme === 'cosmic') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
          document.body.classList.add('dark');
          setSettings((prev) => ({ ...prev, theme: 'dark' }));
        } else {
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
          document.body.classList.remove('dark');
        }
      }

      // 1. Load posts from localStorage and API server
      const localSavedPosts = localStorage.getItem('interstellers_saved_posts');
      let initialPostList: Post[] = INITIAL_POSTS;
      if (localSavedPosts) {
        try {
          const parsed = JSON.parse(localSavedPosts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            initialPostList = parsed;
          }
        } catch (_) {}
      }

      fetch('/api/posts')
        .then((r) => r.json())
        .then((data) => {
          if (data.posts && Array.isArray(data.posts) && data.posts.length > 0) {
            const combinedMap = new Map<string, Post>();
            data.posts.forEach((p: Post) => combinedMap.set(p.id, p));
            initialPostList.forEach((p: Post) => {
              if (!combinedMap.has(p.id)) {
                combinedMap.set(p.id, p);
              }
            });
            INITIAL_POSTS.forEach((p: Post) => {
              if (!combinedMap.has(p.id)) {
                combinedMap.set(p.id, p);
              }
            });
            const mergedList = Array.from(combinedMap.values());
            setPosts(mergedList);
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem('interstellers_saved_posts', JSON.stringify(mergedList));
              } catch (_) {}
            }
          } else if (localSavedPosts) {
            setPosts(initialPostList);
          }
        })
        .catch(() => {
          if (localSavedPosts) {
            setPosts(initialPostList);
          }
        });

      // Verify active server session first
      fetch('/api/auth/session')
        .then((r) => r.json())
        .then((sessionData) => {
          if (sessionData.authenticated && sessionData.user) {
            const serverUser: User = {
              id: sessionData.user.id || 'user_' + generateId(),
              name: sessionData.user.name,
              handle: sessionData.user.handle || sessionData.user.name.toLowerCase().replace(/\s+/g, '_'),
              avatar: sessionData.user.avatar || '',
              bio: sessionData.user.role === 'Host Admin' ? HOST_USER.bio : 'Verified Member at Interstellers.',
              role: sessionData.user.role || 'Community Member',
              email: sessionData.user.email,
              status: 'online',
              isVerified: true,
            };
            setCurrentUser(serverUser);
            setSettings((prev) => ({
              ...prev,
              displayName: serverUser.name,
              handle: serverUser.handle,
              role: serverUser.role,
              avatar: serverUser.avatar,
              email: serverUser.email || '',
            }));
            setIsAuthenticated(true);
            setPendingApprovalUser(null);
            if (typeof window !== 'undefined') {
              localStorage.setItem('interstellers_current_user', JSON.stringify(serverUser));
              localStorage.removeItem('interstellers_pending_user');
            }
            return;
          }

          // If no active server session, check local storage
          const savedPending = typeof window !== 'undefined' ? localStorage.getItem('interstellers_pending_user') : null;
          const savedUser = typeof window !== 'undefined' ? localStorage.getItem('interstellers_current_user') : null;

          if (savedPending) {
            try {
              const pendingObj = JSON.parse(savedPending);
              setPendingApprovalUser(pendingObj);
              setIsAuthenticated(false);
              setCurrentUser(GUEST_USER);
              if (pendingObj?.email) {
                fetch(`/api/auth/status?email=${encodeURIComponent(pendingObj.email)}`)
                  .then((r) => r.json())
                  .then((data) => {
                    if (data.status === 'approved') {
                      const isHostEmail = pendingObj.email.toLowerCase().trim() === 'akshaycricketer1230@gmail.com' || pendingObj.email.toLowerCase().trim() === 'akshay@interstellers.space';
                      const approvedUser: User = isHostEmail
                        ? HOST_USER
                        : {
                            id: 'user_' + generateId(),
                            name: pendingObj.name,
                            handle: pendingObj.name.toLowerCase().replace(/\s+/g, '_'),
                            avatar: data.user?.avatar || '',
                            bio: 'Verified Member at Interstellers.',
                            role: 'Community Member',
                            email: pendingObj.email,
                            status: 'online',
                            isVerified: true,
                          };
                      setCurrentUser(approvedUser);
                      setIsAuthenticated(true);
                      setPendingApprovalUser(null);
                      localStorage.removeItem('interstellers_pending_user');
                      localStorage.setItem('interstellers_current_user', JSON.stringify(approvedUser));
                    }
                  })
                  .catch(() => {});
              }
            } catch (_) {
              setIsAuthenticated(false);
              setCurrentUser(GUEST_USER);
            }
          } else if (savedUser) {
            try {
              const parsed = JSON.parse(savedUser);
              const emailToCheck = parsed.email;
              if (emailToCheck) {
                fetch(`/api/auth/status?email=${encodeURIComponent(emailToCheck)}`)
                  .then((r) => r.json())
                  .then((data) => {
                    if (data.status === 'approved') {
                      const userAvatarKey = `interstellers_saved_avatar_${emailToCheck.toLowerCase().trim()}`;
                      const savedUserAvatar = typeof window !== 'undefined' ? localStorage.getItem(userAvatarKey) : null;
                      let finalAvatar: string = data.user?.avatar || savedUserAvatar || parsed.avatar || '';

                      const updatedUser: User = {
                        ...parsed,
                        avatar: finalAvatar,
                      };
                      setCurrentUser(updatedUser);
                      setSettings((prev) => ({
                        ...prev,
                        displayName: updatedUser.name,
                        bio: updatedUser.bio,
                        role: updatedUser.role,
                        avatar: finalAvatar,
                        email: emailToCheck,
                      }));
                      setIsAuthenticated(true);
                      setPendingApprovalUser(null);
                    } else {
                      setIsAuthenticated(false);
                      setCurrentUser(GUEST_USER);
                      if (data.status === 'pending') {
                        setPendingApprovalUser({ name: parsed.name, email: emailToCheck });
                      } else {
                        localStorage.removeItem('interstellers_current_user');
                      }
                    }
                  })
                  .catch(() => {
                    // Network failed: keep session if user had valid email
                    setCurrentUser(parsed);
                    setIsAuthenticated(true);
                  });
              } else {
                // Anonymous or stale host object without email: force unauthenticated
                setIsAuthenticated(false);
                setCurrentUser(GUEST_USER);
                localStorage.removeItem('interstellers_current_user');
              }
            } catch (_) {
              setIsAuthenticated(false);
              setCurrentUser(GUEST_USER);
            }
          } else {
            // New visitor: Show authentication landing screen
            setIsAuthenticated(false);
            setCurrentUser(GUEST_USER);
            setPendingApprovalUser(null);
          }
        })
        .catch(() => {
          setIsAuthenticated(false);
          setCurrentUser(GUEST_USER);
        });
    } catch (_) {}
  }, []);

  // Fetch all registered users from backend for Friends & Directory
  const fetchRegisteredUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        if (data.users && Array.isArray(data.users)) {
          setConnections(data.users);
        }
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchRegisteredUsers();
    if (isAuthenticated) {
      const interval = setInterval(fetchRegisteredUsers, 4000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Fetch admin approvals from backend
  const fetchAdminApprovals = async () => {
    try {
      const res = await fetch('/api/admin/approvals');
      if (res.ok) {
        const data = await res.json();
        if (data.registrations) {
          setRegistrationRequests(data.registrations);
        }
      }
    } catch (_) {}
  };

  // Poll for admin approvals if Akshay is logged in
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchAdminApprovals();
      const interval = setInterval(fetchAdminApprovals, 3000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, isAdmin]);

  // Auto-poll approval status if user is currently held in pending approval lobby
  useEffect(() => {
    if (pendingApprovalUser && !isAuthenticated) {
      const checkStatus = async () => {
        try {
          const res = await fetch(`/api/auth/status?email=${encodeURIComponent(pendingApprovalUser.email)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'approved') {
              // APPROVED BY AKSHAY! Grant access
              const approvedUser: User = {
                id: 'user_' + generateId(),
                name: pendingApprovalUser.name,
                handle: pendingApprovalUser.name.toLowerCase().replace(/\s+/g, '_'),
                avatar: '',
                bio: 'Verified Member at Interstellers.',
                role: 'Community Member',
                status: 'online',
                isVerified: true,
              };
              setCurrentUser(approvedUser);
              setSettings({
                ...DEFAULT_SETTINGS,
                displayName: approvedUser.name,
                handle: approvedUser.handle,
                email: pendingApprovalUser.email,
              });
              setIsAuthenticated(true);
              setPendingApprovalUser(null);
              localStorage.removeItem('interstellers_pending_user');
              localStorage.setItem('interstellers_current_user', JSON.stringify(approvedUser));
            }
          }
        } catch (_) {}
      };

      const interval = setInterval(checkStatus, 2500);
      return () => clearInterval(interval);
    }
  }, [pendingApprovalUser, isAuthenticated]);

  // Active session watcher: if Akshay kicks out a user, immediately redirect them to Pending Approval Lobby
  useEffect(() => {
    if (isAuthenticated && !isAdmin && settings.email) {
      const checkEviction = async () => {
        try {
          const res = await fetch(`/api/auth/status?email=${encodeURIComponent(settings.email)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status !== 'approved') {
              const pending = { name: currentUser.name || settings.displayName || 'Explorer', email: settings.email };
              setPendingApprovalUser(pending);
              setIsAuthenticated(false);
              localStorage.setItem('interstellers_pending_user', JSON.stringify(pending));
              localStorage.removeItem('interstellers_current_user');
            }
          }
        } catch (_) {}
      };
      const interval = setInterval(checkEviction, 3000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, isAdmin, settings.email, currentUser.name, settings.displayName]);

  // Call timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callState.isOpen) {
      interval = setInterval(() => {
        setCallState((prev) => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState.isOpen]);

  // 1. Send Login / Registration Verification Code to Gmail
  const sendVerificationCode = async (email: string, name?: string, type?: 'register' | 'signin') => {
    const cleanEmail = email.toLowerCase().trim().replace(/[\.\s]+$/, '').trim();
    const cleanName = (name || cleanEmail.split('@')[0]).trim();

    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, name: cleanName, type: type || 'signin' }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to send verification code' };
      }
      if (data.otpToken && typeof window !== 'undefined') {
        localStorage.setItem('interstellers_otp_token', data.otpToken);
      }
      return { success: true, code: data.code, otpToken: data.otpToken, message: data.message };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error while requesting code' };
    }
  };

  // 2. Verify 6-digit Code & Transition
  const verifyLoginCode = async (email: string, code: string, name?: string, otpToken?: string) => {
    const cleanEmail = email.toLowerCase().trim().replace(/[\.\s]+$/, '').trim();
    const cleanName = (name || cleanEmail.split('@')[0]).trim();
    const tokenToUse = otpToken || (typeof window !== 'undefined' ? localStorage.getItem('interstellers_otp_token') : null);

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, code, name: cleanName, otpToken: tokenToUse }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid verification code' };
      }

      if (typeof window !== 'undefined') {
        localStorage.removeItem('interstellers_otp_token');
      }

      if (data.status === 'approved') {
        const isHostEmail = cleanEmail === 'akshaycricketer1230@gmail.com' || cleanEmail === 'akshay@interstellers.space';
        const userToSet: User = isHostEmail
          ? HOST_USER
          : {
              id: data.user?.id || 'user_' + generateId(),
              name: data.user?.name || cleanName,
              handle: (data.user?.name || cleanName).toLowerCase().replace(/\s+/g, '_'),
              avatar: data.user?.avatar || '',
              bio: 'Verified Member at Interstellers.',
              role: 'Community Member',
              email: cleanEmail,
              status: 'online',
              isVerified: true,
            };

        setCurrentUser(userToSet);
        setSettings({
          ...DEFAULT_SETTINGS,
          displayName: userToSet.name,
          handle: userToSet.handle,
          email: cleanEmail,
          avatar: userToSet.avatar,
        });
        setIsAuthenticated(true);
        setPendingApprovalUser(null);
        if (typeof window !== 'undefined') {
          localStorage.setItem('interstellers_current_user', JSON.stringify(userToSet));
          localStorage.removeItem('interstellers_pending_user');
        }
        return { success: true, status: 'approved' as const, message: data.message };
      } else {
        // New user registration -> Held in pending approval lobby for Akshay
        const pending = { name: cleanName, email: cleanEmail };
        setPendingApprovalUser(pending);
        setIsAuthenticated(false);
        setCurrentUser(GUEST_USER);
        if (typeof window !== 'undefined') {
          localStorage.setItem('interstellers_pending_user', JSON.stringify(pending));
          localStorage.removeItem('interstellers_current_user');
        }
        return { success: true, status: 'pending' as const, message: data.message };
      }
    } catch (err: any) {
      return { success: false, error: String(err?.message || 'Verification error') };
    }
  };

  // Register New User (Calls server backend)
  const registerNewUser = async (name: string, email: string) => {
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim() || 'New Explorer';

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, email: cleanEmail }),
      });
      const data = await res.json();

      if (data.status === 'approved') {
        const isHostEmail = cleanEmail === 'akshaycricketer1230@gmail.com' || cleanEmail === 'akshay@interstellers.space';
        const userToSet: User = isHostEmail
          ? HOST_USER
          : {
              id: 'user_' + generateId(),
              name: data.user?.name || cleanName,
              handle: (data.user?.name || cleanName).toLowerCase().replace(/\s+/g, '_'),
              avatar: data.user?.avatar || '',
              bio: 'Verified Member at Interstellers.',
              role: 'Community Member',
              email: cleanEmail,
              status: 'online',
              isVerified: true,
            };

        setCurrentUser(userToSet);
        setSettings({
          ...DEFAULT_SETTINGS,
          displayName: userToSet.name,
          handle: userToSet.handle,
          email: cleanEmail,
          avatar: userToSet.avatar,
        });
        setIsAuthenticated(true);
        setPendingApprovalUser(null);
        if (typeof window !== 'undefined') {
          localStorage.setItem('interstellers_current_user', JSON.stringify(userToSet));
          localStorage.removeItem('interstellers_pending_user');
        }
      } else {
        const pending = { name: cleanName, email: cleanEmail };
        setPendingApprovalUser(pending);
        setIsAuthenticated(false);
        setCurrentUser(GUEST_USER);
        if (typeof window !== 'undefined') {
          localStorage.setItem('interstellers_pending_user', JSON.stringify(pending));
          localStorage.removeItem('interstellers_current_user');
        }
      }
    } catch (e) {
      console.error(e);
      const pending = { name: cleanName, email: cleanEmail };
      setPendingApprovalUser(pending);
      setIsAuthenticated(false);
      setCurrentUser(GUEST_USER);
    }
  };

  // Sign In Flow
  const login = async (email?: string, name?: string) => {
    const cleanEmail = (email || '').toLowerCase().trim();

    if (cleanEmail === 'akshaycricketer1230@gmail.com' || cleanEmail === 'akshay@interstellers.space') {
      const savedUser = typeof window !== 'undefined' ? localStorage.getItem('interstellers_current_user') : null;
      const hostAvatarKey = `interstellers_saved_avatar_akshaycricketer1230@gmail.com`;
      const savedAvatar = typeof window !== 'undefined' ? localStorage.getItem(hostAvatarKey) || localStorage.getItem('interstellers_saved_avatar') : null;
      let hostUserToSet = { ...HOST_USER };
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          hostUserToSet = { ...hostUserToSet, ...parsed };
        } catch (_) {}
      }
      if (savedAvatar) {
        hostUserToSet.avatar = savedAvatar;
      }
      setCurrentUser(hostUserToSet);
      setSettings((prev) => ({
        ...prev,
        displayName: hostUserToSet.name,
        bio: hostUserToSet.bio,
        role: hostUserToSet.role,
        avatar: hostUserToSet.avatar,
      }));
      setIsAuthenticated(true);
      setPendingApprovalUser(null);
      if (typeof window !== 'undefined') {
        localStorage.setItem('interstellers_current_user', JSON.stringify(hostUserToSet));
        localStorage.removeItem('interstellers_pending_user');
      }
      return { success: true };
    }

    try {
      const res = await fetch(`/api/auth/status?email=${encodeURIComponent(cleanEmail)}`);
      const data = await res.json();

      if (data.status === 'approved') {
        const approvedUser: User = {
          id: 'user_' + generateId(),
          name: data.user?.name || name || cleanEmail.split('@')[0],
          handle: (data.user?.name || name || cleanEmail.split('@')[0]).toLowerCase().replace(/\s+/g, '_'),
          avatar: data.user?.avatar || '',
          bio: 'Verified Member at Interstellers.',
          role: 'Community Member',
          status: 'online',
          isVerified: true,
        };
        setCurrentUser(approvedUser);
        setSettings({
          ...DEFAULT_SETTINGS,
          displayName: approvedUser.name,
          handle: approvedUser.handle,
          email: cleanEmail,
        });
        setIsAuthenticated(true);
        setPendingApprovalUser(null);
        localStorage.setItem('interstellers_current_user', JSON.stringify(approvedUser));
        localStorage.removeItem('interstellers_pending_user');
        return { success: true };
      } else {
        const pending = { name: name || cleanEmail.split('@')[0], email: cleanEmail };
        setPendingApprovalUser(pending);
        setIsAuthenticated(false);
        localStorage.setItem('interstellers_pending_user', JSON.stringify(pending));
        return { success: false, requiresApproval: true };
      }
    } catch (e) {
      return { success: false, requiresApproval: true };
    }
  };

  // Manual status check by user
  const checkMyApprovalStatus = async (): Promise<boolean> => {
    if (!pendingApprovalUser) return false;
    try {
      const res = await fetch(`/api/auth/status?email=${encodeURIComponent(pendingApprovalUser.email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'approved') {
          const approvedUser: User = {
            id: 'user_' + generateId(),
            name: pendingApprovalUser.name,
            handle: pendingApprovalUser.name.toLowerCase().replace(/\s+/g, '_'),
            avatar: data.user?.avatar || '',
            bio: 'Verified Member at Interstellers.',
            role: 'Community Member',
            status: 'online',
            isVerified: true,
          };
          setCurrentUser(approvedUser);
          setIsAuthenticated(true);
          setPendingApprovalUser(null);
          localStorage.removeItem('interstellers_pending_user');
          localStorage.setItem('interstellers_current_user', JSON.stringify(approvedUser));
          return true;
        }
      }
    } catch (_) {}
    return false;
  };

  // Akshay Approves a Registration Request on Server Backend
  const approveRegistration = async (requestId: string) => {
    try {
      const res = await fetch('/api/admin/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action: 'approve' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.registrations) {
          setRegistrationRequests(data.registrations);
        }
        if (data.updatedUser) {
          const newUser: User = {
            id: 'user_' + data.updatedUser.id,
            name: data.updatedUser.name,
            handle: data.updatedUser.name.toLowerCase().replace(/\s+/g, '_'),
            avatar: data.updatedUser.avatar || '',
            bio: 'Verified Member at Interstellers.',
            role: 'Community Member',
            status: 'online',
            isVerified: true,
            mutualFriends: 1,
          };
          setConnections((prev) => {
            if (prev.find((u) => u.handle === newUser.handle)) return prev;
            return [newUser, ...prev];
          });
        }
      }
    } catch (e) {
      console.error('Approve error:', e);
    }
  };

  // Akshay Rejects a Registration Request
  const rejectRegistration = async (requestId: string) => {
    try {
      const res = await fetch('/api/admin/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action: 'reject' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.registrations) {
          setRegistrationRequests(data.registrations);
        }
      }
    } catch (e) {
      console.error('Reject error:', e);
    }
  };

  // Akshay Kicks Out a Member (Revokes approval back to pending approval lobby)
  const kickOutUser = async (requestId: string) => {
    try {
      const res = await fetch('/api/admin/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action: 'kick' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.registrations) {
          setRegistrationRequests(data.registrations);
        }
        setConnections((prev) =>
          prev.filter((u) => u.id !== requestId && u.handle !== requestId && u.name.toLowerCase() !== requestId.toLowerCase())
        );
        fetchRegisteredUsers();
      }
    } catch (e) {
      console.error('Kick out error:', e);
    }
  };

  const logout = () => {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setIsAuthenticated(false);
    setCurrentUser(GUEST_USER);
    setSettings(DEFAULT_SETTINGS);
    setPendingApprovalUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('interstellers_current_user');
      localStorage.removeItem('interstellers_pending_user');
      localStorage.removeItem('interstellers_otp_token');
    }
  };

  // Settings methods
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (newSettings.theme) {
        if (typeof document !== 'undefined') {
          if (newSettings.theme === 'dark' || newSettings.theme === 'cosmic') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
            document.body.classList.add('dark');
            localStorage.setItem('interstellers_theme', 'dark');
          } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
            localStorage.setItem('interstellers_theme', 'light');
          }
        }
      }
      return updated;
    });
  };

  const updateProfile = ({ name, bio, role, avatar }: { name: string; bio: string; role: string; avatar?: string }) => {
    const userEmail = settings.email || currentUser.handle || '';
    const avatarStorageKey = userEmail ? `interstellers_saved_avatar_${userEmail.toLowerCase().trim()}` : 'interstellers_saved_avatar';
    const savedAvatar = (avatarStorageKey && typeof window !== 'undefined') ? localStorage.getItem(avatarStorageKey) || '' : '';
    
    // Always prioritize newly provided avatar when saving profile in Settings
    const newAvatar = avatar !== undefined ? avatar : (currentUser.avatar || savedAvatar || '');

    const updatedUser: User = {
      ...currentUser,
      name,
      bio,
      role,
      avatar: newAvatar,
      isAvatarLocked: false,
    };

    setCurrentUser(updatedUser);

    if (typeof window !== 'undefined') {
      try {
        if (avatarStorageKey) {
          if (newAvatar) {
            localStorage.setItem(avatarStorageKey, newAvatar);
          } else {
            localStorage.removeItem(avatarStorageKey);
          }
        }
        localStorage.setItem('interstellers_current_user', JSON.stringify(updatedUser));
      } catch (e) {
        console.warn('localStorage quota limit reached for current user:', e);
      }
    }

    setSettings((prev) => {
      const nextSettings: UserSettings = {
        ...prev,
        displayName: name,
        bio,
        role,
        avatar: newAvatar,
        isAvatarLocked: false,
      };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('interstellers_settings', JSON.stringify(nextSettings));
        } catch (e) {
          console.warn('localStorage quota limit reached for settings:', e);
        }
      }
      return nextSettings;
    });

    // Save to server db.json persistently via API for current user
    if (userEmail) {
      try {
        fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
            name,
            bio,
            role,
            avatar: newAvatar,
            isAvatarLocked: false,
          }),
        }).catch(() => {});
      } catch (_) {}
    }

    // Helper to lock and persist posts to localStorage and server DB
    const persistPosts = (updater: (prev: Post[]) => Post[]) => {
      setPosts((prev) => {
        const nextPosts = updater(prev);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('interstellers_saved_posts', JSON.stringify(nextPosts));
          } catch (e) {
            console.warn('localStorage quota limit for posts:', e);
          }
        }
        try {
          fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ posts: nextPosts }),
          }).catch(() => {});
        } catch (_) {}
        return nextPosts;
      });
    };

    // Update posts authored by current user so new avatar appears everywhere
    persistPosts((prevPosts) =>
      prevPosts.map((p) =>
        p.author.id === currentUser.id || p.author.handle === currentUser.handle || p.author.name === currentUser.name
          ? { ...p, author: { ...p.author, avatar: newAvatar } }
          : p
      )
    );
  };

  // Posts Feed methods
  const createPost = (
    content: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'video',
    tags?: string[]
  ) => {
    const newPost: Post = {
      id: `post_${generateId()}`,
      author: currentUser,
      content,
      createdAt: new Date().toISOString(),
      timestamp: formatTime(),
      likes: 0,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: false,
      isBookmarked: false,
      mediaUrl,
      mediaType,
      tags: tags && tags.length > 0 ? tags : ["#Interstellers"],
      comments: [],
    };

    // Lock and persist post
    setPosts((prev) => {
      const nextPosts = [newPost, ...prev];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('interstellers_saved_posts', JSON.stringify(nextPosts));
        } catch (e) {
          console.warn('localStorage quota limit for posts:', e);
        }
      }
      try {
        fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ post: newPost }),
        }).catch(() => {});
      } catch (_) {}
      return nextPosts;
    });

    const newNotif: AppNotification = {
      id: `notif_${generateId()}`,
      type: 'system',
      title: 'Post Published & Locked',
      message: 'Your update has been broadcasted and locked in the galactic feed.',
      timestamp: 'Just now',
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const persistPostsState = (nextPosts: Post[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('interstellers_saved_posts', JSON.stringify(nextPosts));
      } catch (e) {
        console.warn('localStorage quota limit for posts:', e);
      }
    }
    try {
      fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posts: nextPosts }),
      }).catch(() => {});
    } catch (_) {}
  };

  const updatePost = (
    postId: string,
    newContent?: string,
    newMediaUrl?: string
  ) => {
    setPosts((prev) => {
      const next = prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            content: newContent !== undefined ? newContent : post.content,
            mediaUrl: newMediaUrl !== undefined ? newMediaUrl : post.mediaUrl,
          };
        }
        return post;
      });
      persistPostsState(next);
      return next;
    });
  };

  const toggleLikePost = (postId: string) => {
    setPosts((prev) => {
      const next = prev.map((post) => {
        if (post.id === postId) {
          const isLiked = !post.isLiked;
          return {
            ...post,
            isLiked,
            likes: isLiked ? post.likes + 1 : Math.max(0, post.likes - 1),
          };
        }
        return post;
      });
      persistPostsState(next);
      return next;
    });
  };

  const toggleBookmarkPost = (postId: string) => {
    setPosts((prev) => {
      const next = prev.map((post) =>
        post.id === postId ? { ...post, isBookmarked: !post.isBookmarked } : post
      );
      persistPostsState(next);
      return next;
    });
  };

  const addCommentToPost = (postId: string, content: string) => {
    const newComment: Comment = {
      id: `comm_${generateId()}`,
      author: currentUser,
      content,
      timestamp: formatTime(),
      likes: 0,
    };
    setPosts((prev) => {
      const next = prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            commentsCount: post.commentsCount + 1,
            comments: [...(post.comments || []), newComment],
          };
        }
        return post;
      });
      persistPostsState(next);
      return next;
    });
  };

  const voteInPoll = (postId: string, optionId: string) => {
    setPosts((prev) => {
      const next = prev.map((post) => {
        if (post.id === postId && post.poll && !post.poll.userVotedOptionId) {
          const updatedOptions = post.poll.options.map((opt) =>
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
          );
          return {
            ...post,
            poll: {
              ...post.poll,
              options: updatedOptions,
              totalVotes: post.poll.totalVotes + 1,
              userVotedOptionId: optionId,
            },
          };
        }
        return post;
      });
      persistPostsState(next);
      return next;
    });
  };

  const deletePost = (postId: string) => {
    setPosts((prev) => {
      const next = prev.filter((p) => p.id !== postId);
      persistPostsState(next);
      return next;
    });
  };

  // Direct Messaging methods
  const sendMessage = async (threadId: string, text: string, mediaUrl?: string) => {
    if (!text.trim() && !mediaUrl) return;

    const newMessage: Message = {
      id: `msg_${generateId()}`,
      senderId: currentUser.id,
      senderHandle: currentUser.handle,
      text,
      mediaUrl,
      timestamp: formatTime(),
      time: formatTime(),
      status: 'sent',
    };

    setChats((prev) =>
      prev.map((thread) => {
        if (thread.id === threadId) {
          return {
            ...thread,
            lastMessage: text,
            lastMessageTime: formatTime(),
            messages: [...thread.messages, newMessage],
          };
        }
        return thread;
      })
    );

    // Persist message to backend API for cross-account synchronization
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          threadId,
          messageId: newMessage.id,
          senderId: currentUser.id,
          senderHandle: currentUser.handle,
          senderName: currentUser.name,
          text,
          mediaUrl,
          timestamp: newMessage.timestamp,
          time: newMessage.time,
        }),
      });
      fetchServerMessages();
    } catch (e) {
      console.error('Error persisting message:', e);
    }

    if (threadId === 'chat_nova') {
      const userEmail = currentUser.email || (currentUser.handle === 'akshay' ? 'akshaycricketer1230@gmail.com' : undefined);
      const novaThreadMsgs = serverMessages['chat_nova'] || [];
      const historyPayload = novaThreadMsgs.slice(-10).map((m) => ({
        role: (m.senderId === 'ai_nova' ? 'assistant' : 'user') as 'user' | 'assistant',
        content: m.text,
      }));

      (async () => {
        try {
          const res = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: text,
              history: historyPayload,
              userEmail,
            }),
          });
          const data = await res.json();
          const replyText = res.ok && data.reply ? data.reply : (data.error || data.details || 'Nova is temporarily unavailable. Please try again.');

          const replyMsg: Message = {
            id: `msg_${generateId()}`,
            senderId: 'ai_nova',
            senderHandle: 'nova_ai',
            text: replyText,
            timestamp: formatTime(),
            time: formatTime(),
            status: 'read',
          };

          await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'send',
              threadId: 'chat_nova',
              messageId: replyMsg.id,
              senderId: 'ai_nova',
              senderHandle: 'nova_ai',
              senderName: 'Nova AI Assistant',
              text: replyText,
              timestamp: replyMsg.timestamp,
              time: replyMsg.time,
            }),
          });
          fetchServerMessages();
        } catch (_) {}
      })();
    }
  };

  const requestDeleteMessage = async (threadId: string, messageId: string) => {
    try {
      setChats((prev) =>
        prev.map((thread) => {
          if (thread.id === threadId) {
            return {
              ...thread,
              messages: thread.messages.map((msg) =>
                msg.id === messageId
                  ? {
                      ...msg,
                      deleteRequest: {
                        requestedBy: currentUser.handle,
                        requestedByName: currentUser.name,
                        status: 'pending' as const,
                      },
                    }
                  : msg
              ),
            };
          }
          return thread;
        })
      );

      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_delete',
          threadId,
          messageId,
          requestedBy: currentUser.handle,
          requestedByName: currentUser.name,
        }),
      });
      fetchServerMessages();
    } catch (e) {
      console.error('Error requesting message deletion:', e);
    }
  };

  const acceptDeleteMessage = async (threadId: string, messageId: string) => {
    try {
      setChats((prev) =>
        prev.map((thread) => {
          if (thread.id === threadId) {
            return {
              ...thread,
              messages: thread.messages.filter((msg) => msg.id !== messageId),
            };
          }
          return thread;
        })
      );

      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accept_delete',
          threadId,
          messageId,
          userHandle: currentUser.handle,
        }),
      });
      fetchServerMessages();
    } catch (e) {
      console.error('Error accepting deletion:', e);
    }
  };

  const rejectDeleteMessage = async (threadId: string, messageId: string) => {
    try {
      setChats((prev) =>
        prev.map((thread) => {
          if (thread.id === threadId) {
            return {
              ...thread,
              messages: thread.messages.map((msg) => {
                if (msg.id === messageId) {
                  const copy = { ...msg };
                  delete copy.deleteRequest;
                  return copy;
                }
                return msg;
              }),
            };
          }
          return thread;
        })
      );

      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject_delete',
          threadId,
          messageId,
          userHandle: currentUser.handle,
        }),
      });
      fetchServerMessages();
    } catch (e) {
      console.error('Error rejecting deletion:', e);
    }
  };

  const markChatAsRead = async (threadId: string) => {
    if (!threadId) return;

    setChats((prev) =>
      prev.map((thread) => {
        if (thread.id === threadId) {
          const updatedMsgs = thread.messages.map((m) => {
            if (m.senderId !== currentUser.id && m.senderHandle !== currentUser.handle) {
              return { ...m, status: 'read' as const };
            }
            return m;
          });
          return {
            ...thread,
            unreadCount: 0,
            messages: updatedMsgs,
          };
        }
        return thread;
      })
    );

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_read',
          threadId,
          userHandle: currentUser.handle,
          senderId: currentUser.id,
        }),
      });
      fetchServerMessages();
    } catch (_) {}
  };

  const toggleChatPin = (threadId: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === threadId ? { ...c, isPinned: !c.isPinned } : c))
    );
  };

  const toggleChatArchive = (threadId: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === threadId ? { ...c, isArchived: !c.isArchived } : c))
    );
  };

  const startChatWithUser = (user: User): string => {
    if (user.id === 'ai_nova' || user.handle === 'nova_ai') {
      setActiveChatId('chat_nova');
      return 'chat_nova';
    }
    const threadId = getDMThreadId(currentUser.handle, user.handle);
    setActiveChatId(threadId);
    return threadId;
  };

  // Group Hub methods
  const toggleJoinGroup = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const isAlreadyMember = g.members.some(
            (m) => m.id === currentUser.id || m.handle === currentUser.handle
          );
          if (isAlreadyMember) {
            return {
              ...g,
              membersCount: Math.max(1, g.membersCount - 1),
              members: g.members.filter(
                (m) => m.id !== currentUser.id && m.handle !== currentUser.handle
              ),
            };
          } else {
            return {
              ...g,
              membersCount: g.membersCount + 1,
              members: [...g.members, currentUser],
            };
          }
        }
        return g;
      })
    );
  };

  const sendGroupMessage = (groupId: string, text: string) => {
    if (!text.trim()) return;

    const newMsg: Message = {
      id: `gmsg_${generateId()}`,
      senderId: currentUser.id,
      text,
      timestamp: formatTime(),
      time: formatTime(),
    };

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            messages: [...g.messages, newMsg],
          };
        }
        return g;
      })
    );
  };

  // Connections & Friend Requests
  const acceptFriendRequest = (requestId: string) => {
    const req = friendRequests.find((r) => r.id === requestId);
    if (req) {
      setConnections((prev) => [req.user, ...prev]);
      setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));

      const newNotif: AppNotification = {
        id: `notif_${generateId()}`,
        type: 'friend_request',
        title: 'Connection Accepted',
        message: `You are now connected with ${req.user.name}.`,
        timestamp: 'Just now',
        isRead: false,
        user: req.user,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  const declineFriendRequest = (requestId: string) => {
    setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  const removeConnection = (userId: string) => {
    setConnections((prev) => prev.filter((u) => u.id !== userId));
  };

  const addConnection = (user: User) => {
    if (!connections.find((c) => c.id === user.id)) {
      setConnections((prev) => [user, ...prev]);
    }
  };

  // AI Assistant (Nova) methods
  const sendAIMessage = async (prompt: string) => {
    if (!prompt.trim() || isAITyping) return;

    const trimmedPrompt = prompt.trim();
    const userAIMsg: AIMessage = {
      id: `aim_${generateId()}`,
      sender: 'user',
      text: trimmedPrompt,
      timestamp: formatTime(),
    };

    const historyPayload = aiMessages
      .filter((m) => !m.isError)
      .map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.text,
      }));

    setAiMessages((prev) => [...prev, userAIMsg]);
    setIsAITyping(true);

    try {
      const userEmail = currentUser.email || (currentUser.handle === 'akshay' ? 'akshaycricketer1230@gmail.com' : undefined);

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedPrompt,
          history: historyPayload,
          userEmail,
        }),
      });

      const data = await res.json();

      if (res.ok && data.reply) {
        const aiReply: AIMessage = {
          id: `aim_${generateId()}`,
          sender: 'ai',
          text: data.reply,
          timestamp: formatTime(),
        };
        setAiMessages((prev) => [...prev, aiReply]);
      } else {
        const errorReply: AIMessage = {
          id: `aim_${generateId()}`,
          sender: 'ai',
          text: data.error || data.details || 'Nova is temporarily unavailable. Please try again.',
          timestamp: formatTime(),
          isError: true,
          failedPrompt: trimmedPrompt,
        };
        setAiMessages((prev) => [...prev, errorReply]);
      }
    } catch (_) {
      const networkErrorReply: AIMessage = {
        id: `aim_${generateId()}`,
        sender: 'ai',
        text: 'Nova is temporarily unavailable. Please try again.',
        timestamp: formatTime(),
        isError: true,
        failedPrompt: trimmedPrompt,
      };
      setAiMessages((prev) => [...prev, networkErrorReply]);
    } finally {
      setIsAITyping(false);
    }
  };

  const retryAIMessage = async (failedPrompt: string) => {
    setAiMessages((prev) => prev.filter((m) => !(m.isError && m.failedPrompt === failedPrompt)));
    await sendAIMessage(failedPrompt);
  };

  const clearAIChat = () => {
    setAiMessages([INITIAL_AI_MESSAGES[0]]);
  };

  // Notifications methods
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Call Simulation methods
  const startCall = (type: 'audio' | 'video', participant?: User, groupName?: string) => {
    setCallState({
      isOpen: true,
      type,
      participant,
      groupName,
      isMuted: false,
      isVideoOff: false,
      duration: 0,
    });
  };

  const endCall = () => {
    setCallState((prev) => ({ ...prev, isOpen: false, duration: 0 }));
  };

  const toggleMute = () => {
    setCallState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const toggleVideo = () => {
    setCallState((prev) => ({ ...prev, isVideoOff: !prev.isVideoOff }));
  };

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];
  const activeGroup = groups.find((g) => g.id === activeGroupId) || groups[0];
  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;
  const pendingRegistrationsCount = registrationRequests.filter((r) => r.status === 'pending').length;

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        isAdmin,
        pendingApprovalUser,
        setPendingApprovalUser,
        sendVerificationCode,
        verifyLoginCode,
        login,
        registerNewUser,
        logout,
        checkMyApprovalStatus,
        activeDevicesCount,
        totalDevicesCount,
        registrationRequests,
        approveRegistration,
        rejectRegistration,
        kickOutUser,
        pendingRegistrationsCount,
        isApprovalsModalOpen,
        setIsApprovalsModalOpen,
        fetchAdminApprovals,
        currentUser,
        settings,
        updateSettings,
        updateProfile,
        isShareModalOpen,
        setIsShareModalOpen,
        posts,
        createPost,
        updatePost,
        toggleLikePost,
        toggleBookmarkPost,
        addCommentToPost,
        voteInPoll,
        deletePost,
        chats,
        activeChatId,
        setActiveChatId,
        startChatWithUser,
        sendMessage,
        requestDeleteMessage,
        acceptDeleteMessage,
        rejectDeleteMessage,
        markChatAsRead,
        toggleChatPin,
        toggleChatArchive,
        activeChat,
        groups,
        activeGroupId,
        setActiveGroupId,
        toggleJoinGroup,
        sendGroupMessage,
        activeGroup,
        connections,
        friendRequests,
        acceptFriendRequest,
        declineFriendRequest,
        removeConnection,
        addConnection,
        aiMessages,
        isAITyping,
        sendAIMessage,
        retryAIMessage,
        clearAIChat,
        isAIPanelOpen,
        setIsAIPanelOpen,
        isNovaVoiceOpen,
        setIsNovaVoiceOpen,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotification,
        unreadNotificationsCount,
        searchQuery,
        setSearchQuery,
        callState,
        startCall,
        endCall,
        toggleMute,
        toggleVideo,
        gamificationState,
        arcadeGames,
        gameScores,
        leaderboard,
        missions,
        achievements,
        crews,
        stations,
        timeCapsules,
        shopItems,
        recordGameScore,
        addXP,
        claimDailyChallenge,
        completeMission,
        unlockAchievement,
        purchaseCosmetic,
        equipCosmetic,
        toggleJoinCrew,
        useEmergencyWarpPass,
        createTimeCapsule,
        restoreGhostOrbit,

      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
