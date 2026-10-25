import { User, Post, ChatThread, GroupChannel, FriendRequest, AppNotification, AIMessage, UserSettings } from './types';

export const INTERSTELLERS_LOGO = "/logo.png";

export const HOST_USER: User = {
  id: "user_host",
  name: "Akshay Kumar",
  handle: "akshay",
  avatar: "/avatar.png",
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
  avatar: "/avatar.png",
  bio: "Founder & Community Host at Interstellers. 'Time is never coming back, remember time is never...'",
  role: "Community Host & Admin",
  company: "Interstellers",
  status: "online",
  customStatus: "Managing Interstellers 🪐",
  isVerified: true,
};

export const GUEST_USER: User = {
  id: "user_guest",
  name: "Galactic Explorer",
  handle: "explorer",
  avatar: "",
  bio: "Welcome to Interstellers. Please sign in to explore.",
  role: "Guest",
  company: "Interstellers",
  status: "offline",
  customStatus: "Awaiting authentication",
  isVerified: false,
};

// Clean initial users list - no fake mock users
export const INITIAL_USERS: User[] = [
  HOST_USER
];

export const INITIAL_POSTS: Post[] = [
  {
    id: "post_video_message_1",
    author: HOST_USER,
    content: "🎥 **Public Video Message • Transmission Online!** 🚀\n\nWelcome to all explorers across the galaxy! Tune in to our official public video transmission directly from the bridge. Press play below to watch! ✨🌌",
    createdAt: new Date().toISOString(),
    timestamp: "Just now",
    likes: 18,
    commentsCount: 2,
    sharesCount: 6,
    isLiked: true,
    isBookmarked: true,
    tags: ["#VideoMessage", "#PublicTransmission", "#CommunityUpdate"],
    mediaUrl: "/Video Project 1.mp4",
    mediaType: "video",
    comments: []
  },
  {
    id: "post_welcome",
    author: HOST_USER,
    content: "🪐 Welcome to **Interstellers**!\n\n\"Time is never coming back, remember time is never...\"\n\nConnect with your friends, start discussions in channels, and collaborate in real-time across galactic spaces! ✨",
    createdAt: new Date().toISOString(),
    timestamp: "Just now",
    likes: 1,
    commentsCount: 0,
    sharesCount: 0,
    isLiked: false,
    isBookmarked: true,
    tags: ["#Welcome", "#Interstellers"],
    mediaUrl: "",
    mediaType: "image",
    comments: []
  },
  {
    id: "post_telugu_vibe",
    author: HOST_USER,
    content: "🚀 **Exploring the Interstellers Community Workspace**!\n\nWelcome to our verified space crew. Connect with fellow travelers, publish updates, and collaborate across galactic stations!",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    timestamp: "1 hr ago",
    likes: 3,
    commentsCount: 1,
    sharesCount: 1,
    isLiked: true,
    isBookmarked: false,
    tags: ["#TeluguVibe", "#Community"],
    mediaUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
    mediaType: "image",
    comments: []
  }
];

export const INITIAL_CHATS: ChatThread[] = [
  {
    id: "chat_nova",
    participant: {
      id: "ai_nova",
      name: "Anant",
      handle: "anant",
      avatar: "",
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
        text: "Welcome to Interstellers! 'Time is never coming back, remember time is never...' I'm Anant, your assistant. You can chat with me, invite friends, and create spaces anytime.",
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
    text: "Welcome to Interstellers! 'Time is never coming back, remember time is never...' I'm Anant, your community navigator. How can I assist your mission today?",
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
