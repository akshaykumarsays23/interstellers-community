import { User, Post, ChatThread, GroupChannel, FriendRequest, AppNotification, AIMessage, UserSettings } from './types';

export const INTERSTELLERS_LOGO = "/logo.png";

export const HOST_USER: User = {
  id: "user_host",
  name: "Akshay Kumar",
  handle: "akshay",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
  bio: "Founder & Community Host at Interstellers. 'Time is never coming back, remember time is never...'",
  role: "Community Host & Admin",
  company: "Interstellers",
  status: "online",
  customStatus: "Building Interstellers 🚀",
  isVerified: true,
};

export const CURRENT_USER: User = {
  id: "user_me",
  name: "Akshay Kumar",
  handle: "akshay",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
  bio: "Founder & Community Host at Interstellers. 'Time is never coming back, remember time is never...'",
  role: "Community Host & Admin",
  company: "Interstellers",
  status: "online",
  customStatus: "Managing Interstellers 🪐",
  isVerified: true,
};

// Clean initial users list - no fake mock users
export const INITIAL_USERS: User[] = [
  HOST_USER
];

export const INITIAL_POSTS: Post[] = [
  {
    id: "post_welcome",
    author: HOST_USER,
    content: "🪐 Welcome to **Interstellers**!\n\n\"Time is never coming back, remember time is never...\"\n\nConnect with your friends, start discussions in channels, and collaborate in real-time. Invite your team and friends to join the galaxy!",
    createdAt: new Date().toISOString(),
    timestamp: "Just now",
    likes: 1,
    commentsCount: 0,
    sharesCount: 0,
    isLiked: false,
    isBookmarked: true,
    tags: ["#Welcome", "#Interstellers", "#Community"],
    mediaUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
    mediaType: "image",
    comments: []
  }
];

export const INITIAL_CHATS: ChatThread[] = [
  {
    id: "chat_nova",
    participant: {
      id: "ai_nova",
      name: "Nova AI Assistant",
      handle: "nova_ai",
      avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop",
      bio: "Your autonomous galactic navigator and workspace assistant.",
      role: "AI Navigator",
      status: "online",
      isVerified: true,
    },
    lastMessage: "Welcome to Interstellers! How can I assist you today?",
    lastMessageTime: "Just now",
    unreadCount: 0,
    isPinned: true,
    messages: [
      {
        id: "m_welcome",
        senderId: "ai_nova",
        text: "Welcome to Interstellers! 'Time is never coming back, remember time is never...' I'm Nova, your AI assistant. You can chat with me, invite friends, and create spaces anytime.",
        timestamp: "Just now",
        time: "Just now",
        status: "read",
      }
    ]
  }
];

export const INITIAL_GROUPS: GroupChannel[] = [
  {
    id: "grp_general",
    name: "General Galaxy Hub",
    description: "Main community space for all members, discussions, and introductions.",
    category: "general",
    membersCount: 1,
    onlineCount: 1,
    pinnedNote: "Welcome to Interstellers! Share your ideas and collaborate respectfully.",
    members: [HOST_USER],
    messages: [
      {
        id: "gm_1",
        senderId: "user_host",
        text: "Welcome to the official Interstellers Community! Feel free to share updates and start conversations.",
        timestamp: "Just now",
        time: "Just now",
      }
    ]
  },
  {
    id: "grp_announcements",
    name: "Official Announcements",
    description: "Platform updates, upcoming community events, and host releases.",
    category: "general",
    membersCount: 1,
    onlineCount: 1,
    pinnedNote: "Account activations are approved by Akshay.",
    members: [HOST_USER],
    messages: [
      {
        id: "gm_a1",
        senderId: "user_host",
        text: "Interstellers platform v1.0 is live! Connect across the galaxy.",
        timestamp: "Just now",
        time: "Just now",
      }
    ]
  }
];

// Clean friend requests list - 0 fake accounts
export const INITIAL_FRIEND_REQUESTS: FriendRequest[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif_welcome",
    type: "system",
    title: "Welcome to Interstellers",
    message: "Your account is active. Start exploring and invite your friends!",
    timestamp: "Just now",
    isRead: false,
  }
];

export const INITIAL_AI_MESSAGES: AIMessage[] = [
  {
    id: "ai_1",
    sender: "ai",
    text: "Welcome to Interstellers! 'Time is never coming back, remember time is never...' I'm Nova, your AI Community Navigator. How can I assist your mission today?",
    timestamp: "Just now",
    suggestedActions: [
      "How do I invite my friends to Interstellers?",
      "Draft a welcome post for the community",
      "Explain the platform features and spaces"
    ]
  }
];

export const DEFAULT_SETTINGS: UserSettings = {
  displayName: "Akshay Kumar",
  handle: "akshay",
  bio: "Founder & Community Host at Interstellers. 'Time is never coming back, remember time is never...'",
  avatar: CURRENT_USER.avatar,
  email: "akshaycricketer1230@gmail.com",
  role: "Community Host & Admin",
  pushNotifications: true,
  emailDigests: false,
  mentionAlerts: true,
  soundEffects: true,
  profileVisibility: "public",
  showOnlineStatus: true,
  readReceipts: true,
  theme: "light",
};
