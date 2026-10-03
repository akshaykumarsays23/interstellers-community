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

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
  mediaUrl?: string;
  reactions?: { emoji: string; count: number; userReacted?: boolean }[];
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
