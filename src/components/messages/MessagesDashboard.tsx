'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { WallpaperModal } from '@/components/common/WallpaperModal';
import {
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
  CheckCheck,
  Pin,
  Archive,
  Info,
  ChevronLeft,
  Palette,
  Lock,
  Trash2,
  ShieldAlert,
  Clock,
  Check,
  X as XIcon,
  Mic,
} from 'lucide-react';
import { cn, formatMessageDate, formatDate } from '@/lib/utils';

import { ChatThreadSkeleton, MessageStreamSkeleton } from '@/components/common/Skeletons';
import { NovaFellowsProtocol } from './NovaFellowsProtocol';

export const MessagesDashboard: React.FC = () => {
  const {
    chats,
    activeChatId,
    setActiveChatId,
    activeChat,
    sendMessage,
    requestDeleteMessage,
    acceptDeleteMessage,
    rejectDeleteMessage,
    markChatAsRead,
    startCall,
    currentUser,
    toggleChatPin,
    toggleChatArchive,
    setIsNovaVoiceOpen,
    openUserProfile,
  } = useApp();

  const [viewMode, setViewMode] = useState<'chats' | 'fellows_protocol'>('chats');
  const [chatFilter, setChatFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [chatSearch, setChatSearch] = useState('');
  const [messageText, setMessageText] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [chatWallpaper, setChatWallpaper] = useState<string>('');
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const typingTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const partnerTypingTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Brief skeleton show on mount
  useEffect(() => {
    const t = setTimeout(() => setIsLoadingChats(false), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWp = localStorage.getItem('interstellers_chat_wallpaper');
      if (savedWp) setChatWallpaper(savedWp);
    }
  }, []);

  // Automatically mark current active chat as read so badges disappear when viewed
  useEffect(() => {
    if (activeChatId) {
      markChatAsRead(activeChatId);
    }
  }, [activeChatId, activeChat?.messages?.length]);

  const handleSelectWallpaper = (url: string) => {
    setChatWallpaper(url);
    if (typeof window !== 'undefined') {
      if (url) {
        localStorage.setItem('interstellers_chat_wallpaper', url);
      } else {
        localStorage.removeItem('interstellers_chat_wallpaper');
      }
    }
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  const filteredChats = chats.filter((chat) => {
    if (chatSearch) {
      const q = chatSearch.toLowerCase();
      const matchName = chat.participant.name.toLowerCase().includes(q);
      const matchMsg = chat.lastMessage.toLowerCase().includes(q);
      if (!matchName && !matchMsg) return false;
    }

    if (chatFilter === 'unread') return chat.unreadCount > 0;
    if (chatFilter === 'archived') return chat.isArchived;
    return !chat.isArchived;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeChat) return;

    sendMessage(activeChat.id, messageText);
    setMessageText('');
    setIsTyping(false);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

    // Simulate partner typing response (only for non-assistant chats and non-group threads).
    if (activeChat.id !== 'chat_nova' && !activeChat.isGroup) {
      const delay = 800 + Math.random() * 1200;
      if (partnerTypingTimerRef.current) clearTimeout(partnerTypingTimerRef.current);
      partnerTypingTimerRef.current = setTimeout(() => {
        setPartnerTyping(true);
        partnerTypingTimerRef.current = setTimeout(() => {
          setPartnerTyping(false);
        }, 2000 + Math.random() * 2000);
      }, delay);
    }
  };

  const handleMessageInput = (val: string) => {
    setMessageText(val);
    setIsTyping(val.trim().length > 0);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    if (val.trim().length > 0) {
      typingTimerRef.current = setTimeout(() => setIsTyping(false), 3000);
    }
  };

  const handleSendImage = (imgUrl: string) => {
    if (!activeChat) return;
    sendMessage(activeChat.id, 'Shared an image:', imgUrl);
    setShowAttachMenu(false);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-surface">
      {/* Left Pane: Contacts & Threads */}
      <aside
        className={cn(
          'w-full md:w-[360px] lg:w-[400px] bg-surface-container-lowest border-r border-outline-variant/60 flex flex-col h-full shrink-0 z-10 transition-all',
          showMobileChat ? 'hidden md:flex' : 'flex'
        )}
      >
        {/* Search & Header */}
        <div className="p-4 border-b border-outline-variant/60 bg-surface-bright space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-xl text-on-surface">Fellows</h2>
              <p className="text-[10px] text-on-surface-variant font-medium">Cosmic Kinship & Transmissions</p>
            </div>
            <Badge variant="primary" size="sm">
              {chats.length} active
            </Badge>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface-container rounded-xl">
            <button
              type="button"
              onClick={() => {
                setViewMode('chats');
                setShowMobileChat(false);
              }}
              className={cn(
                'py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all',
                viewMode === 'chats'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              )}
            >
              <span>💬 Direct</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('fellows_protocol');
                setShowMobileChat(true);
              }}
              className={cn(
                'py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border',
                viewMode === 'fellows_protocol'
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white border-transparent shadow-xs font-bold'
                  : 'border-purple-500/30 text-purple-400 hover:bg-purple-950/30'
              )}
            >
              <span>✨ 15Q Matcher</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              placeholder="Search fellows & messages..."
              className="w-full bg-surface-container rounded-full py-2 pl-9 pr-4 text-xs text-on-surface placeholder:text-on-surface-variant border border-transparent focus:border-primary focus:bg-surface-bright outline-none transition-all"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1.5 pt-1">
            <button
              onClick={() => setChatFilter('all')}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-semibold transition-colors',
                chatFilter === 'all'
                  ? 'bg-primary-container text-on-primary-container'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              )}
            >
              All Chats
            </button>
            <button
              onClick={() => setChatFilter('unread')}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-semibold transition-colors',
                chatFilter === 'unread'
                  ? 'bg-primary-container text-on-primary-container'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              )}
            >
              Unread
            </button>
            <button
              onClick={() => setChatFilter('archived')}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-semibold transition-colors',
                chatFilter === 'archived'
                  ? 'bg-primary-container text-on-primary-container'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              )}
            >
              Archived
            </button>
          </div>
        </div>

        {/* Threads List */}
        <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/30 custom-scrollbar">
          {filteredChats.length === 0 ? (
            <div className="p-8 text-center text-xs text-on-surface-variant">
              No conversations found.
            </div>
          ) : (
            filteredChats.map((thread) => {
              const isActive = activeChatId === thread.id;
              return (
                <div
                  key={thread.id}
                  onClick={() => {
                    setActiveChatId(thread.id);
                    markChatAsRead(thread.id);
                    setShowMobileChat(true);
                  }}
                  className={cn(
                    'p-3.5 flex items-center gap-3 cursor-pointer transition-all border-l-4 group relative',
                    isActive
                      ? 'bg-surface-container-low border-primary'
                      : 'border-transparent hover:bg-surface-container-low/60'
                  )}
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      openUserProfile(thread.participant);
                    }}
                    className="hover:scale-105 transition-transform shrink-0"
                    title="Click to view full profile & zoom avatar"
                  >
                    <Avatar
                      src={thread.participant.avatar}
                      name={thread.participant.name}
                      status={thread.participant.status}
                      showStatus
                      size="md"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3
                        className={cn(
                          'text-xs sm:text-sm font-semibold truncate',
                          thread.unreadCount > 0 ? 'text-primary font-bold' : 'text-on-surface'
                        )}
                      >
                        {thread.participant.name}
                      </h3>
                      <span
                        className={cn(
                          'text-[10px]',
                          thread.unreadCount > 0 ? 'text-primary font-bold' : 'text-on-surface-variant'
                        )}
                      >
                        {formatMessageDate(thread.lastMessageTime)}
                      </span>
                    </div>

                    <p
                      className={cn(
                        'text-xs truncate',
                        thread.unreadCount > 0
                          ? 'text-on-surface font-semibold'
                          : 'text-on-surface-variant'
                      )}
                    >
                      {thread.lastMessage}
                    </p>
                  </div>

                  {/* Actions & Badges */}
                  <div className="flex items-center gap-1 shrink-0">
                    {thread.unreadCount > 0 && (
                      <span className="w-5 h-5 bg-primary text-on-primary text-[10px] font-bold rounded-full flex items-center justify-center">
                        {thread.unreadCount}
                      </span>
                    )}

                    {thread.isPinned && <Pin className="w-3.5 h-3.5 text-primary fill-primary" />}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Right Pane: Active Chat Conversation or Anant fellows protocol */}
      {viewMode === 'fellows_protocol' ? (
        <section
          className={cn(
            'flex-1 flex flex-col bg-surface-container-lowest h-full relative overflow-y-auto',
            !showMobileChat ? 'hidden md:flex' : 'flex'
          )}
        >
          <div className="p-4 sm:p-6 max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/40">
              <button
                onClick={() => setShowMobileChat(false)}
                className="md:hidden p-1.5 text-on-surface-variant hover:text-primary rounded-lg flex items-center gap-1 text-xs"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Fellows
              </button>
              <button
                onClick={() => setViewMode('chats')}
                className="text-xs px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors ml-auto font-medium"
              >
                Exit to Direct Transmissions
              </button>
            </div>
            <NovaFellowsProtocol
              onFellowSelected={(user) => {
                setViewMode('chats');
                openUserProfile(user);
              }}
            />
          </div>
        </section>
      ) : activeChat ? (
        <section
          className={cn(
            'flex-1 flex flex-col bg-surface-container-lowest h-full relative',
            !showMobileChat ? 'hidden md:flex' : 'flex'
          )}
        >
          {/* Chat Top Header */}
          <header className="bg-surface-bright px-4 sm:px-6 h-16 border-b border-outline-variant/60 flex items-center justify-between shrink-0">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => openUserProfile(activeChat.participant)}
              title="Click to view profile & zoom avatar"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMobileChat(false);
                }}
                className="md:hidden p-1.5 text-on-surface-variant hover:text-primary rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <Avatar
                src={activeChat.participant.avatar}
                name={activeChat.participant.name}
                status={activeChat.participant.status}
                showStatus
                size="md"
                className="group-hover:ring-2 ring-primary transition-all"
              />

              <div>
                <h2 className="font-heading font-semibold text-sm sm:text-base text-on-surface group-hover:text-primary transition-colors">
                  {activeChat.participant.name}
                </h2>
                <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active Now • {activeChat.participant.company || 'Interstellar Network'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 sm:gap-2">
              {activeChat.id === 'chat_nova' && (
                <button
                  onClick={() => setIsNovaVoiceOpen(true)}
                  className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md animate-pulse"
                  title="Start Anant Voice Mode"
                >
                  <Mic className="w-4 h-4 text-cyan-300" />
                  <span className="hidden sm:inline">Voice Live</span>
                </button>
              )}

              <button
                onClick={() => startCall('audio', activeChat.participant)}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Start Voice Call"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">Call</span>
              </button>

              <button
                onClick={() => startCall('video', activeChat.participant)}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                title="Start Video Stream"
              >
                <Video className="w-4 h-4" />
                <span className="hidden sm:inline">Video</span>
              </button>

              <button
                onClick={() => setIsWallpaperModalOpen(true)}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors border border-outline-variant/40"
                title="Change Chat Background / Wallpaper"
              >
                <Palette className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">Wallpaper</span>
              </button>

              <button
                onClick={() => toggleChatPin(activeChat.id)}
                className={cn(
                  'p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors',
                  activeChat.isPinned && 'text-primary'
                )}
                title="Pin Conversation"
              >
                <Pin className="w-4 h-4" />
              </button>

              <button
                onClick={() => toggleChatArchive(activeChat.id)}
                className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                title="Archive Chat"
              >
                <Archive className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Message Stream */}
          <div
            className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-3 bg-surface-container-lowest custom-scrollbar transition-all"
            style={
              chatWallpaper
                ? {
                    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.25), rgba(15, 23, 42, 0.25)), url(${chatWallpaper})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                  }
                : undefined
            }
          >
            {/* Date Divider */}
            <div className="flex justify-center my-2">
              <span className="px-3 py-1 bg-surface-container/90 backdrop-blur-xs text-on-surface-variant text-[11px] font-semibold rounded-full shadow-xs border border-outline-variant/30">
                Today • {formatDate()}
              </span>
            </div>

            {activeChat.messages.map((msg) => {
              const isSender = msg.senderId === currentUser.id || msg.senderHandle === currentUser.handle;
              const hasDeleteReq = !!msg.deleteRequest;
              const isDeleteReqByMe = msg.deleteRequest?.requestedBy === currentUser.handle;

              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex items-end gap-2.5 max-w-[88%] sm:max-w-[75%] group relative',
                    isSender ? 'self-end flex-row-reverse' : 'self-start'
                  )}
                >
                  {!isSender && (
                    <Avatar
                      src={activeChat.participant.avatar}
                      name={activeChat.participant.name}
                      size="xs"
                      className="mb-1 shrink-0"
                    />
                  )}

                  <div className={cn('flex flex-col gap-1', isSender ? 'items-end' : 'items-start')}>
                    {/* Message Bubble */}
                    <div
                      className={cn(
                        'p-3.5 text-xs sm:text-sm rounded-2xl shadow-sm leading-relaxed relative border transition-all',
                        isSender
                          ? 'bg-primary text-on-primary rounded-br-none border-primary/40'
                          : 'bg-surface-bright/95 backdrop-blur-xs text-on-surface rounded-bl-none border-outline-variant/40 shadow-xs',
                        hasDeleteReq && 'ring-2 ring-amber-500/60 bg-amber-950/20'
                      )}
                    >
                      {/* Content */}
                      <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>

                      {/* Attached Media */}
                      {msg.mediaUrl && (
                        <div className="mt-2 rounded-xl overflow-hidden max-h-56 border border-white/20 bg-black">
                          {/\.(mp4|webm|ogg|mov)($|\?)/i.test(msg.mediaUrl) || msg.mediaUrl.includes('Video') ? (
                            <video src={msg.mediaUrl} controls playsInline className="w-full max-h-56 object-contain bg-black" />
                          ) : (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={msg.mediaUrl} alt="Chat attachment" className="w-full h-full object-cover" />
                          )}
                        </div>
                      )}

                      {/* Dual Acceptance Deletion Request Box */}
                      {hasDeleteReq && (
                        <div className="mt-2.5 pt-2.5 border-t border-amber-500/30 flex flex-col gap-1.5 text-xs">
                          {isDeleteReqByMe ? (
                            <div className="flex items-center justify-between gap-2 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                              <span className="flex items-center gap-1.5 text-[11px] text-amber-200 font-medium">
                                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                Deletion Pending — Waiting for recipient to accept deletion...
                              </span>
                              <button
                                onClick={() => rejectDeleteMessage(activeChat.id, msg.id)}
                                className="px-2 py-1 bg-surface-container hover:bg-surface-container-high rounded-lg text-[10px] font-semibold text-on-surface-variant transition-colors"
                              >
                                Cancel Request
                              </button>
                            </div>
                          ) : (
                            <div className="bg-amber-500/15 p-2.5 rounded-xl border border-amber-500/40 flex flex-col gap-2">
                              <div className="flex items-center gap-1.5 text-[11px] text-amber-100 font-semibold">
                                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                                <span>{msg.deleteRequest?.requestedByName || 'Participant'} requested to delete this message. Both users must accept to delete.</span>
                              </div>
                              <div className="flex items-center gap-2 pt-0.5">
                                <button
                                  onClick={() => acceptDeleteMessage(activeChat.id, msg.id)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Accept Deletion</span>
                                </button>
                                <button
                                  onClick={() => rejectDeleteMessage(activeChat.id, msg.id)}
                                  className="px-3 py-1 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                                >
                                  <XIcon className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Metadata Footer: Timestamp, Lock status & Request Delete Trigger */}
                    <div className="flex items-center gap-2 px-1 text-[10px] text-on-surface-variant/80 font-medium">
                      <span className="flex items-center gap-1" title="Message Locked & Encrypted">
                        <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{formatMessageDate(msg.timestamp || msg.time)}</span>
                      </span>

                      {isSender && (
                        <CheckCheck className="w-3.5 h-3.5 text-primary stroke-[2.5]" />
                      )}

                      {!hasDeleteReq && (
                        <button
                          onClick={() => requestDeleteMessage(activeChat.id, msg.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-error text-on-surface-variant/60 flex items-center gap-0.5 ml-1"
                          title="Request Mutual Message Deletion (Requires Both Users Approval)"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />

            {/* Partner typing indicator — shows when the OTHER person is typing */}
            {partnerTyping && activeChat && (
              <div className="flex items-end gap-2 self-start animate-in fade-in slide-in-from-bottom-1 duration-200">
                <Avatar
                  src={activeChat.participant.avatar}
                  name={activeChat.participant.name}
                  size="xs"
                  className="mb-1 shrink-0"
                />
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-[10px] text-on-surface-variant px-1">{activeChat.participant.name.split(' ')[0]} is typing…</span>
                  <div className="px-4 py-3 bg-surface-bright/95 backdrop-blur-xs rounded-2xl rounded-bl-none border border-cyan-400/25 shadow-xs flex items-center gap-1 shadow-[0_0_8px_rgba(0,240,255,0.12)]">
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-cyan-400" style={{ animationDelay: '0ms' }} />
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-purple-400" style={{ animationDelay: '160ms' }} />
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-cyan-400" style={{ animationDelay: '320ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Self-typing indicator — shows when YOU are composing */}
            {isTyping && !partnerTyping && (
              <div className="flex items-end gap-2 self-end flex-row-reverse animate-in fade-in duration-150">
                <div className="px-4 py-3 bg-primary/10 backdrop-blur-xs rounded-2xl rounded-br-none border border-primary/25 shadow-xs flex items-center gap-1">
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary" style={{ animationDelay: '0ms' }} />
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary" style={{ animationDelay: '160ms' }} />
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary" style={{ animationDelay: '320ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Attachment Quick Menu */}
          {showAttachMenu && (
            <div className="p-3 bg-surface-container-low border-t border-outline-variant/40 flex items-center gap-3">
              <span className="text-xs font-semibold text-on-surface">Attach Galactic Asset:</span>
              <button
                onClick={() =>
                  handleSendImage(
                    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop'
                  )
                }
                className="text-xs px-2.5 py-1 rounded bg-surface-container hover:bg-primary-container hover:text-on-primary-container"
              >
                Space Topology
              </button>
              <button
                onClick={() =>
                  handleSendImage(
                    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop'
                  )
                }
                className="text-xs px-2.5 py-1 rounded bg-surface-container hover:bg-primary-container hover:text-on-primary-container"
              >
                Design System v2
              </button>
            </div>
          )}

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 sm:p-4 bg-surface-bright border-t border-outline-variant/60 shrink-0"
          >
            <div className="flex items-center gap-2 bg-surface-container rounded-full px-3 py-1.5 border border-transparent focus-within:border-primary focus-within:bg-surface-bright focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <button
                type="button"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="p-1.5 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-high shrink-0 transition-colors"
                title="Attach Files"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={messageText}
                onChange={(e) => handleMessageInput(e.target.value)}
                placeholder="Type a message to transmit..."
                className="flex-1 bg-transparent border-none text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant outline-none py-1"
              />

              <button
                type="button"
                onClick={() => setMessageText((prev) => prev + ' 🚀')}
                className="p-1.5 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-high shrink-0 transition-colors"
              >
                <Smile className="w-4 h-4" />
              </button>

              <button
                type="submit"
                disabled={!messageText.trim()}
                className="p-2 rounded-full bg-primary text-on-primary disabled:opacity-40 hover:bg-primary-hover shadow-xs transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </section>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-8 bg-surface-container-lowest">
          <div className="max-w-md space-y-4">
            <Avatar name="Interstellers" size="2xl" className="mx-auto mb-2 ring-4 ring-primary/20 shadow-xl" />
            <h3 className="font-heading font-bold text-xl text-on-surface">Fellows Transmission Deck</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Select a conversation to transmit secure interstellar messages, or run Anant’s 15-Question Protocol to discover and connect with kindred voyagers across the cosmos.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setViewMode('fellows_protocol');
                  setShowMobileChat(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white font-bold text-xs shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 mx-auto active:scale-95"
              >
                <span>✨ Launch Anant’s 15Q Fellow Matcher</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <WallpaperModal
        isOpen={isWallpaperModalOpen}
        currentWallpaper={chatWallpaper}
        onSelectWallpaper={handleSelectWallpaper}
        onClose={() => setIsWallpaperModalOpen(false)}
      />
    </div>
  );
};
