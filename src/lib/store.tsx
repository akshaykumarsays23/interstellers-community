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
  RegistrationRequest
} from './types';
import {
  CURRENT_USER,
  HOST_USER,
  INITIAL_USERS,
  INITIAL_POSTS,
  INITIAL_CHATS,
  INITIAL_GROUPS,
  INITIAL_FRIEND_REQUESTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AI_MESSAGES,
  DEFAULT_SETTINGS
} from './data';
import { generateId, formatTime } from './utils';

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
  sendVerificationCode: (email: string, name?: string, type?: 'register' | 'signin') => Promise<{ success: boolean; code?: string; message?: string; error?: string }>;
  verifyLoginCode: (email: string, code: string, name?: string) => Promise<{ success: boolean; status?: 'approved' | 'pending'; message?: string; error?: string }>;
  login: (email?: string, name?: string) => Promise<{ success: boolean; requiresApproval?: boolean }>;
  registerNewUser: (name: string, email: string) => Promise<void>;
  logout: () => void;
  checkMyApprovalStatus: () => Promise<boolean>;

  // Registration Approval Queue (for Akshay)
  registrationRequests: RegistrationRequest[];
  approveRegistration: (requestId: string) => Promise<void>;
  rejectRegistration: (requestId: string) => Promise<void>;
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

  // Posts Feed
  posts: Post[];
  createPost: (content: string, mediaUrl?: string, mediaType?: 'image' | 'video', tags?: string[]) => void;
  toggleLikePost: (postId: string) => void;
  toggleBookmarkPost: (postId: string) => void;
  addCommentToPost: (postId: string, content: string) => void;
  voteInPoll: (postId: string, optionId: string) => void;
  deletePost: (postId: string) => void;

  // Direct Messaging
  chats: ChatThread[];
  activeChatId: string;
  setActiveChatId: (id: string) => void;
  sendMessage: (threadId: string, text: string, mediaUrl?: string) => void;
  toggleChatPin: (threadId: string) => void;
  toggleChatArchive: (threadId: string) => void;
  activeChat?: ChatThread;

  // Group Hub
  groups: GroupChannel[];
  activeGroupId: string;
  setActiveGroupId: (id: string) => void;
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
  clearAIChat: () => void;
  isAIPanelOpen: boolean;
  setIsAIPanelOpen: (open: boolean) => void;

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User>(HOST_USER);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [pendingApprovalUser, setPendingApprovalUser] = useState<{ name: string; email: string } | null>(null);
  
  // Registration requests from backend
  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>([]);
  const [isApprovalsModalOpen, setIsApprovalsModalOpen] = useState<boolean>(false);

  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [chats, setChats] = useState<ChatThread[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<string>("chat_nova");
  const [groups, setGroups] = useState<GroupChannel[]>(INITIAL_GROUPS);
  const [activeGroupId, setActiveGroupId] = useState<string>("grp_general");
  const [connections, setConnections] = useState<User[]>(INITIAL_USERS);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(INITIAL_FRIEND_REQUESTS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>(INITIAL_AI_MESSAGES);
  const [isAITyping, setIsAITyping] = useState<boolean>(false);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  const [callState, setCallState] = useState<CallState>({
    isOpen: false,
    type: 'audio',
    isMuted: false,
    isVideoOff: false,
    duration: 0,
  });

  const isAdmin = currentUser.handle === 'akshay' || currentUser.id === 'user_host';

  // Load session & saved server profile on start
  // Load session, saved server profile & saved posts on start
  useEffect(() => {
    try {
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

      const savedPending = localStorage.getItem('interstellers_pending_user');
      if (savedPending) {
        setPendingApprovalUser(JSON.parse(savedPending));
      }
      const savedUser = localStorage.getItem('interstellers_current_user');
      const savedAvatar = localStorage.getItem('interstellers_saved_avatar');
      const savedLocked = localStorage.getItem('interstellers_avatar_locked');
      
      const emailToCheck = savedUser ? (JSON.parse(savedUser).email || 'akshaycricketer1230@gmail.com') : 'akshaycricketer1230@gmail.com';

      fetch(`/api/auth/status?email=${encodeURIComponent(emailToCheck)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.status === 'approved') {
            const parsed = savedUser ? JSON.parse(savedUser) : HOST_USER;
            let finalAvatar: string = savedAvatar || '';
            if (!finalAvatar || finalAvatar === '/avatar.png') {
              finalAvatar = (data.user?.avatar && data.user.avatar !== '/avatar.png') 
                ? data.user.avatar 
                : (parsed.avatar || '/avatar.png');
            }
            if (!finalAvatar) {
              finalAvatar = '/avatar.png';
            }

            const isLocked: boolean = savedLocked === 'true' || 
              Boolean(data.user?.isAvatarLocked) || 
              Boolean(parsed.isAvatarLocked) || 
              Boolean(finalAvatar && finalAvatar !== '/avatar.png' && finalAvatar !== '');

            const updatedUser: User = {
              ...HOST_USER,
              ...parsed,
              avatar: finalAvatar,
              isAvatarLocked: isLocked,
            };
            setCurrentUser(updatedUser);
            setSettings((prev) => ({
              ...prev,
              displayName: updatedUser.name,
              bio: updatedUser.bio,
              role: updatedUser.role,
              avatar: finalAvatar,
              isAvatarLocked: isLocked,
            }));
            setIsAuthenticated(true);
            setPendingApprovalUser(null);
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem('interstellers_current_user', JSON.stringify(updatedUser));
                if (finalAvatar) {
                  localStorage.setItem('interstellers_saved_avatar', finalAvatar);
                }
                if (isLocked) {
                  localStorage.setItem('interstellers_avatar_locked', 'true');
                }
              } catch (_) {}
            }
          } else if (data.status === 'pending') {
            setIsAuthenticated(false);
            if (savedUser) {
              const parsed = JSON.parse(savedUser);
              setPendingApprovalUser({ name: parsed.name, email: parsed.email });
            }
          }
        })
        .catch(() => {});
    } catch (_) {}
  }, []);

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
    const cleanEmail = email.toLowerCase().trim();
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
      return { success: true, code: data.code, message: data.message };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error while requesting code' };
    }
  };

  // 2. Verify 6-digit Code & Transition
  const verifyLoginCode = async (email: string, code: string, name?: string) => {
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = (name || cleanEmail.split('@')[0]).trim();

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, code, name: cleanName }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid verification code' };
      }

      if (data.status === 'approved') {
        // Akshay or pre-approved member -> enter platform immediately
        const userToSet: User = cleanEmail.includes('akshay')
          ? HOST_USER
          : {
              id: 'user_' + generateId(),
              name: data.user?.name || cleanName,
              handle: (data.user?.name || cleanName).toLowerCase().replace(/\s+/g, '_'),
              avatar: data.user?.avatar || '',
              bio: 'Verified Member at Interstellers.',
              role: 'Community Member',
              status: 'online',
              isVerified: true,
            };

        setCurrentUser(userToSet);
        setSettings({
          ...DEFAULT_SETTINGS,
          displayName: userToSet.name,
          handle: userToSet.handle,
          email: cleanEmail,
        });
        setIsAuthenticated(true);
        setPendingApprovalUser(null);
        localStorage.setItem('interstellers_current_user', JSON.stringify(userToSet));
        localStorage.removeItem('interstellers_pending_user');
        return { success: true, status: 'approved' as const, message: data.message };
      } else {
        // New user registration -> Held in pending approval lobby for Akshay
        const pending = { name: cleanName, email: cleanEmail };
        setPendingApprovalUser(pending);
        setIsAuthenticated(false);
        localStorage.setItem('interstellers_pending_user', JSON.stringify(pending));
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
        setCurrentUser(HOST_USER);
        setSettings(DEFAULT_SETTINGS);
        setIsAuthenticated(true);
        setPendingApprovalUser(null);
        localStorage.setItem('interstellers_current_user', JSON.stringify(HOST_USER));
        localStorage.removeItem('interstellers_pending_user');
      } else {
        const pending = { name: cleanName, email: cleanEmail };
        setPendingApprovalUser(pending);
        setIsAuthenticated(false);
        localStorage.setItem('interstellers_pending_user', JSON.stringify(pending));
      }
    } catch (e) {
      console.error(e);
      const pending = { name: cleanName, email: cleanEmail };
      setPendingApprovalUser(pending);
      setIsAuthenticated(false);
    }
  };

  // Sign In Flow
  const login = async (email?: string, name?: string) => {
    const cleanEmail = (email || '').toLowerCase().trim();

    if (cleanEmail.includes('akshay') || cleanEmail === 'akshaycricketer1230@gmail.com' || cleanEmail === 'akshay@interstellers.space' || cleanEmail === 'akshay@gmail.com') {
      const savedUser = typeof window !== 'undefined' ? localStorage.getItem('interstellers_current_user') : null;
      const savedAvatar = typeof window !== 'undefined' ? localStorage.getItem('interstellers_saved_avatar') : null;
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
            avatar: data.updatedUser.avatar || HOST_USER.avatar,
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

  const logout = () => {
    setIsAuthenticated(false);
    setPendingApprovalUser(null);
    localStorage.removeItem('interstellers_current_user');
    localStorage.removeItem('interstellers_pending_user');
  };

  // Settings methods
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (newSettings.theme) {
        if (typeof document !== 'undefined') {
          if (newSettings.theme === 'dark' || newSettings.theme === 'cosmic') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      }
      return updated;
    });
  };

  const updateProfile = ({ name, bio, role, avatar }: { name: string; bio: string; role: string; avatar?: string }) => {
    const savedAvatar = typeof window !== 'undefined' ? localStorage.getItem('interstellers_saved_avatar') || '' : '';
    const currentLocked = currentUser.isAvatarLocked || (typeof window !== 'undefined' && localStorage.getItem('interstellers_avatar_locked') === 'true');
    
    // If avatar is currently locked, keep existing locked avatar
    let newAvatar = currentLocked && savedAvatar 
      ? savedAvatar 
      : (avatar !== undefined ? avatar : (currentUser.avatar || savedAvatar || ''));

    // If a non-default custom avatar is set or saved, lock it permanently!
    const isLocked = Boolean(currentLocked || (newAvatar && newAvatar !== '/avatar.png' && newAvatar !== ''));

    const updatedUser: User = {
      ...currentUser,
      name,
      bio,
      role,
      avatar: newAvatar,
      isAvatarLocked: isLocked,
    };

    setCurrentUser(updatedUser);

    if (typeof window !== 'undefined') {
      try {
        if (newAvatar) {
          localStorage.setItem('interstellers_saved_avatar', newAvatar);
        }
        if (isLocked) {
          localStorage.setItem('interstellers_avatar_locked', 'true');
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
        isAvatarLocked: isLocked,
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

    // Save to server db.json persistently via API
    try {
      fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: settings.email || (currentUser.handle === 'akshay' ? 'akshaycricketer1230@gmail.com' : `${currentUser.handle}@gmail.com`),
          name,
          bio,
          role,
          avatar: newAvatar,
          isAvatarLocked: isLocked,
        }),
      }).catch(() => {});
    } catch (_) {}

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

    // Update posts authored by current user
    persistPosts((prevPosts) =>
      prevPosts.map((p) =>
        p.author.id === currentUser.id || p.author.handle === currentUser.handle
          ? { ...p, author: updatedUser }
          : p
      )
    );
  };

  // Posts Feed methods
  const createPost = (content: string, mediaUrl?: string, mediaType?: 'image' | 'video', tags?: string[]) => {
    const newPost: Post = {
      id: `post_${generateId()}`,
      author: currentUser,
      content,
      createdAt: new Date().toISOString(),
      timestamp: "Just now",
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
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('interstellers_saved_posts', JSON.stringify(next));
        } catch (_) {}
      }
      return next;
    });
  };

  const toggleBookmarkPost = (postId: string) => {
    setPosts((prev) => {
      const next = prev.map((post) =>
        post.id === postId ? { ...post, isBookmarked: !post.isBookmarked } : post
      );
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('interstellers_saved_posts', JSON.stringify(next));
        } catch (_) {}
      }
      return next;
    });
  };

  const addCommentToPost = (postId: string, content: string) => {
    const newComment: Comment = {
      id: `comm_${generateId()}`,
      author: currentUser,
      content,
      timestamp: "Just now",
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
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('interstellers_saved_posts', JSON.stringify(next));
        } catch (_) {}
      }
      try {
        fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ posts: next }),
        }).catch(() => {});
      } catch (_) {}
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
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('interstellers_saved_posts', JSON.stringify(next));
        } catch (_) {}
      }
      return next;
    });
  };

  const deletePost = (postId: string) => {
    setPosts((prev) => {
      const next = prev.filter((p) => p.id !== postId);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('interstellers_saved_posts', JSON.stringify(next));
        } catch (_) {}
      }
      try {
        fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ posts: next }),
        }).catch(() => {});
      } catch (_) {}
      return next;
    });
  };

  // Direct Messaging methods
  const sendMessage = (threadId: string, text: string, mediaUrl?: string) => {
    if (!text.trim() && !mediaUrl) return;

    const newMessage: Message = {
      id: `msg_${generateId()}`,
      senderId: currentUser.id,
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
            lastMessageTime: "Just now",
            messages: [...thread.messages, newMessage],
          };
        }
        return thread;
      })
    );

    if (threadId === 'chat_nova') {
      setTimeout(() => {
        const replyMsg: Message = {
          id: `msg_${generateId()}`,
          senderId: 'ai_nova',
          text: `Nova here! I received: "${text}". You can manage approved members, invite friends, or post updates anytime.`,
          timestamp: formatTime(),
          time: formatTime(),
          status: 'read',
        };
        setChats((prevChats) =>
          prevChats.map((t) =>
            t.id === threadId
              ? { ...t, lastMessage: replyMsg.text, lastMessageTime: formatTime(), messages: [...t.messages, replyMsg] }
              : t
          )
        );
      }, 1000);
    }
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

  // Group Hub methods
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
  const sendAIMessage = (prompt: string) => {
    if (!prompt.trim()) return;

    const userAIMsg: AIMessage = {
      id: `aim_${generateId()}`,
      sender: 'user',
      text: prompt,
      timestamp: formatTime(),
    };

    setAiMessages((prev) => [...prev, userAIMsg]);
    setIsAITyping(true);

    setTimeout(() => {
      let replyText = "";
      const lower = prompt.toLowerCase();

      if (lower.includes("approve") || lower.includes("pending") || lower.includes("member")) {
        const pendingCount = registrationRequests.filter((r) => r.status === 'pending').length;
        replyText = `🛡️ **Member Approvals Summary**:\nYou currently have **${pendingCount} pending user(s)** awaiting your host approval.\nClick 'Approvals' in the top header or sidebar to approve access.`;
      } else if (lower.includes("invite") || lower.includes("share") || lower.includes("link")) {
        replyText = `🔗 **Shareable Link**:\nSend \`http://localhost:3000\` or \`http://192.168.29.34:3000\` to your friends. When they enter their Gmail verification code, they are held in the pending holding lobby until you click Approve!`;
      } else if (lower.includes("quote") || lower.includes("time")) {
        replyText = `✨ *"Time is never coming back, remember time is never..."*\n\nThis is the core motto of Interstellers — inspiring every explorer to connect, create, and collaborate without delay!`;
      } else {
        replyText = `🪐 I've processed your inquiry regarding "${prompt}". All galaxy channels are synced and active. Let me know if you want to review member approvals or share invite links!`;
      }

      const aiReply: AIMessage = {
        id: `aim_${generateId()}`,
        sender: 'ai',
        text: replyText,
        timestamp: formatTime(),
        suggestedActions: [
          "Check pending member approvals",
          "How do I share the website link?",
          "Show official galaxy spaces"
        ],
      };

      setAiMessages((prev) => [...prev, aiReply]);
      setIsAITyping(false);
    }, 800);
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
        registrationRequests,
        approveRegistration,
        rejectRegistration,
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
        toggleLikePost,
        toggleBookmarkPost,
        addCommentToPost,
        voteInPoll,
        deletePost,
        chats,
        activeChatId,
        setActiveChatId,
        sendMessage,
        toggleChatPin,
        toggleChatArchive,
        activeChat,
        groups,
        activeGroupId,
        setActiveGroupId,
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
        clearAIChat,
        isAIPanelOpen,
        setIsAIPanelOpen,
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
