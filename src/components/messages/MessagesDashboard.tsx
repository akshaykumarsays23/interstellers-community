'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const MessagesDashboard: React.FC = () => {
  const {
    chats,
    activeChatId,
    setActiveChatId,
    activeChat,
    sendMessage,
    startCall,
    currentUser,
    toggleChatPin,
    toggleChatArchive,
  } = useApp();

  const [chatFilter, setChatFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [chatSearch, setChatSearch] = useState('');
  const [messageText, setMessageText] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
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
            <h2 className="font-heading font-bold text-xl text-on-surface">Chats</h2>
            <Badge variant="primary" size="sm">
              {chats.length} active
            </Badge>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              placeholder="Search messages..."
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
                    setShowMobileChat(true);
                  }}
                  className={cn(
                    'p-3.5 flex items-center gap-3 cursor-pointer transition-all border-l-4 group relative',
                    isActive
                      ? 'bg-surface-container-low border-primary'
                      : 'border-transparent hover:bg-surface-container-low/60'
                  )}
                >
                  <Avatar
                    src={thread.participant.avatar}
                    name={thread.participant.name}
                    status={thread.participant.status}
                    showStatus
                    size="md"
                  />

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
                        {thread.lastMessageTime}
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

      {/* Right Pane: Active Chat Conversation */}
      {activeChat ? (
        <section
          className={cn(
            'flex-1 flex flex-col bg-surface-container-lowest h-full relative',
            !showMobileChat ? 'hidden md:flex' : 'flex'
          )}
        >
          {/* Chat Top Header */}
          <header className="bg-surface-bright px-4 sm:px-6 h-16 border-b border-outline-variant/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMobileChat(false)}
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
              />

              <div>
                <h2 className="font-heading font-semibold text-sm sm:text-base text-on-surface">
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
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-3 bg-surface-container-lowest/50 custom-scrollbar">
            {/* Date Divider */}
            <div className="flex justify-center my-2">
              <span className="px-3 py-1 bg-surface-container text-on-surface-variant text-[11px] font-semibold rounded-full">
                Today
              </span>
            </div>

            {activeChat.messages.map((msg) => {
              const isSender = msg.senderId === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex items-end gap-2.5 max-w-[85%] sm:max-w-[70%]',
                    isSender ? 'self-end flex-row-reverse' : 'self-start'
                  )}
                >
                  {!isSender && (
                    <Avatar
                      src={activeChat.participant.avatar}
                      name={activeChat.participant.name}
                      size="xs"
                      className="mb-1"
                    />
                  )}

                  <div className={cn('flex flex-col gap-1', isSender ? 'items-end' : 'items-start')}>
                    <div
                      className={cn(
                        'p-3.5 text-xs sm:text-sm rounded-2xl shadow-xs leading-relaxed',
                        isSender
                          ? 'bg-primary text-on-primary rounded-br-none'
                          : 'bg-surface-container-high text-on-surface rounded-bl-none border border-outline-variant/30'
                      )}
                    >
                      {msg.text}

                      {/* Attached Media in chat */}
                      {msg.mediaUrl && (
                        <div className="mt-2 rounded-xl overflow-hidden max-h-48 border border-white/20">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={msg.mediaUrl} alt="Chat attachment" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 px-1">
                      <span className="text-[10px] text-on-surface-variant/70 font-medium">
                        {msg.timestamp || msg.time}
                      </span>
                      {isSender && (
                        <CheckCheck className="w-3.5 h-3.5 text-primary stroke-[2.5]" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
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
                onChange={(e) => setMessageText(e.target.value)}
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
        <div className="hidden md:flex flex-1 items-center justify-center text-center p-8 bg-surface-container-lowest">
          <div>
            <Avatar name="Interstellers" size="2xl" className="mx-auto mb-3" />
            <h3 className="font-heading font-semibold text-lg text-on-surface mb-1">Select a Conversation</h3>
            <p className="text-xs text-on-surface-variant max-w-sm">
              Connect with your peers across all galaxy channels and project syncs.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
