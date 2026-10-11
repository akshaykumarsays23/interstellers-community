export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  role: string;
  company?: string;
  mutualFriends?: number;
  status: 'online' | 'offline' | 'away' | 'busy';
  customStatus?: string;
  email?: string;
  isVerified?: boolean;
  isAvatarLocked?: boolean;
}

export interface RegistrationRequest {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isAvatarLocked?: boolean;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Post {
  id: string;
  author: User;
  content: string;
  createdAt: string;
  timestamp: string;
  likes: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'link';
  tags?: string[];
  poll?: {
    question: string;
    options: { id: string; text: string; votes: number }[];
    totalVotes: number;
    userVotedOptionId?: string;
  };
  comments?: Comment[];
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
}

export interface DeleteRequestInfo {
  requestedBy: string;
  requestedByName: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Message {
  id: string;
  senderId: string;
  senderHandle?: string;
  text: string;
  timestamp: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
  mediaUrl?: string;
  reactions?: { emoji: string; count: number; userReacted?: boolean }[];
  deleteRequest?: DeleteRequestInfo;
}

export interface ChatThread {
  id: string;
  participant: User;
  isGroup?: boolean;
  groupName?: string;
  groupAvatar?: string;
  memberCount?: number;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isPinned?: boolean;
  isArchived?: boolean;
  messages: Message[];
  isTyping?: boolean;
}

export interface GroupChannel {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  bannerUrl?: string;
  category: 'general' | 'design' | 'dev' | 'cosmic' | 'social';
  membersCount: number;
  onlineCount: number;
  unreadCount?: number;
  members: User[];
  messages: Message[];
  pinnedNote?: string;
}

export interface FriendRequest {
  id: string;
  user: User;
  mutualFriends: number;
  timestamp: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface AppNotification {
  id: string;
  type: 'like' | 'comment' | 'mention' | 'friend_request' | 'system' | 'message';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  user?: User;
  link?: string;
}

export interface AIMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
  isError?: boolean;
  failedPrompt?: string;
}

export interface UserSettings {
  displayName: string;
  handle: string;
  bio: string;
  avatar: string;
  isAvatarLocked?: boolean;
  email: string;
  role: string;
  pushNotifications: boolean;
  emailDigests: boolean;
  mentionAlerts: boolean;
  soundEffects: boolean;
  profileVisibility: 'public' | 'friends' | 'private';
  showOnlineStatus: boolean;
  readReceipts: boolean;
  theme: 'light' | 'dark' | 'cosmic';
}

// -------------------------------------------------------------
// INTERSTELLERS ARCADE & GALAXY GAMIFICATION TYPES
// -------------------------------------------------------------

export type GameId = 'reaction_warp' | 'asteroid_dodge' | 'cosmic_quiz' | 'alien_code' | 'memory_galaxy';

export interface ArcadeGame {
  id: GameId;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  badge: string;
  category: string;
  highScore: number;
  playsCount: number;
}

export interface GameScoreRecord {
  id: string;
  gameId: GameId;
  userId: string;
  userName: string;
  userAvatar: string;
  score: number;
  statsDetails: string;
  xpEarned: number;
  starCreditsEarned: number;
  timestamp: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  handle: string;
  avatar: string;
  travelerLevel: number;
  score: number;
  starCredits: number;
  streak: number;
  badge?: string;
  crewName?: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'secret';
  rewardXP: number;
  rewardStarCredits: number;
  isCompleted: boolean;
  progress: number;
  maxProgress: number;
  secretUnlocked?: boolean;
  icon: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'game' | 'social' | 'streak' | 'reputation';
  rewardXP: number;
  rewardStarCredits: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface StarCreditItem {
  id: string;
  name: string;
  description: string;
  type: 'background' | 'frame' | 'name_effect' | 'badge' | 'chat_theme';
  price: number;
  icon: string;
  cssClass?: string;
  previewUrl?: string;
}

export interface SpaceStation {
  id: string;
  name: string;
  icon: string;
  description: string;
  membersCount: number;
  postsCount: number;
  bannerUrl: string;
  activeWormhole?: {
    connectedStationId: string;
    connectedStationName: string;
    endsAt: string;
  };
}

export interface Crew {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  membersCount: number;
  totalXP: number;
  leaderName: string;
  leaderHandle: string;
  description: string;
  isJoined?: boolean;
}

export interface TimeCapsule {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  unlockAt: string;
  isUnlocked: boolean;
  mediaUrl?: string;
}

export interface TravelerGamificationState {
  travelerLevel: number;
  xp: number;
  xpToNextLevel: number;
  starCredits: number;
  signalStrength: number; // 0-100%
  orbitStability: number; // 0-100%
  currentStreak: number;
  emergencyWarpPasses: number;
  isGhostOrbit: boolean;
  lastActiveDate: string;
  hasClaimedDailyChallenge: boolean;
  lastDailyChallengeDate?: string;
  unlockedCosmetics: string[];
  equippedCosmetics: {
    background?: string;
    frame?: string;
    nameEffect?: string;
    chatTheme?: string;
  };
  moderationState: 'NORMAL' | 'WARNING' | 'COMM_BLACKOUT' | 'SHADOW_ORBIT' | 'BLACK_HOLE' | 'AIRLOCK';
}

