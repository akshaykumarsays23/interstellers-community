'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import {
  Hash,
  Users,
  Phone,
  Video,
  Search,
  Pin,
  Send,
  Sparkles,
  Plus,
  Smile,
  Shield,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const GroupChatHub: React.FC = () => {
  const {
    groups,
    activeGroupId,
    setActiveGroupId,
    activeGroup,
    sendGroupMessage,
    startCall,
    currentUser,
  } = useApp();

  const [messageText, setMessageText] = useState('');
  const [showRoster, setShowRoster] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeGroup?.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeGroup) return;

    sendGroupMessage(activeGroup.id, messageText);
    setMessageText('');
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-surface">
      {/* Channels Sidebar */}
      <aside
        className={cn(
          'w-full md:w-[320px] lg:w-[360px] bg-surface-container-lowest border-r border-outline-variant/60 flex flex-col h-full shrink-0 z-10',
          !showMobileList ? 'hidden md:flex' : 'flex'
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-outline-variant/60 bg-surface-bright flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-xl text-on-surface">Spaces & Groups</h2>
            <p className="text-xs text-on-surface-variant">Galactic team channels</p>
          </div>
          <Badge variant="primary" size="sm">
            {groups.length} channels
          </Badge>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
          {groups.map((grp) => {
            const isActive = grp.id === activeGroupId;
            return (
              <button
                key={grp.id}
                onClick={() => {
                  setActiveGroupId(grp.id);
                  setShowMobileList(false);
                }}
                className={cn(
                  'w-full p-3 rounded-xl text-left transition-all border flex items-start gap-3 group',
                  isActive
                    ? 'bg-surface-container-low border-primary shadow-xs'
                    : 'border-transparent hover:bg-surface-container-low/60'
                )}
              >
                <div
                  className={cn(
                    'p-2 rounded-xl text-primary shrink-0 transition-colors',
                    isActive ? 'bg-primary text-on-primary' : 'bg-surface-container'
                  )}
                >
                  <Hash className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                      {grp.name}
                    </h3>
                    <span className="text-[10px] text-on-surface-variant flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {grp.onlineCount}
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">
                    {grp.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Group Chat Stream */}
      {activeGroup ? (
        <section
          className={cn(
            'flex-1 flex flex-col bg-surface-container-lowest h-full relative',
            showMobileList ? 'hidden md:flex' : 'flex'
          )}
        >
          {/* Header */}
          <header className="bg-surface-bright px-4 sm:px-6 h-16 border-b border-outline-variant/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setShowMobileList(true)}
                className="md:hidden p-1.5 text-on-surface-variant hover:text-primary rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="p-2 rounded-xl bg-primary text-on-primary">
                <Hash className="w-5 h-5" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-heading font-semibold text-base sm:text-lg text-on-surface truncate">
                    {activeGroup.name}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-medium hidden sm:inline-flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {activeGroup.membersCount} Members
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant truncate">{activeGroup.description}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                onClick={() => startCall('audio', undefined, activeGroup.name)}
                className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary transition-colors"
                title="Start Voice Huddle"
              >
                <Phone className="w-4 h-4" />
              </button>

              <button
                onClick={() => startCall('video', undefined, activeGroup.name)}
                className="p-2 rounded-xl bg-primary hover:bg-primary-hover text-on-primary shadow-xs transition-colors"
                title="Start Video Stage"
              >
                <Video className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowRoster(!showRoster)}
                className={cn(
                  'p-2 rounded-xl hover:bg-surface-container text-on-surface-variant transition-colors',
                  showRoster && 'bg-surface-container text-primary font-bold'
                )}
                title="Toggle Member Roster"
              >
                <Users className="w-4 h-4" />
              </button>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Pinned Note Banner */}
              {activeGroup.pinnedNote && (
                <div className="px-4 py-2 bg-gradient-to-r from-primary-fixed/30 to-social-blue/10 border-b border-outline-variant/40 flex items-center justify-between text-xs text-on-surface">
                  <div className="flex items-center gap-2 min-w-0">
                    <Pin className="w-3.5 h-3.5 text-primary shrink-0 fill-primary" />
                    <span className="truncate font-medium">{activeGroup.pinnedNote}</span>
                  </div>
                  <Badge variant="primary" size="sm" className="shrink-0 ml-2">
                    Pinned Spec
                  </Badge>
                </div>
              )}

              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
                {activeGroup.messages.map((msg) => {
                  const isCurrentUser = msg.senderId === currentUser.id;
                  const senderUser =
                    activeGroup.members.find((m) => m.id === msg.senderId) ||
                    (isCurrentUser ? currentUser : undefined);

                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex items-start gap-3 max-w-[85%] sm:max-w-[75%]',
                        isCurrentUser && 'ml-auto flex-row-reverse'
                      )}
                    >
                      <Avatar
                        src={senderUser?.avatar}
                        name={senderUser?.name || 'Explorer'}
                        size="sm"
                        className="mt-1"
                      />

                      <div className={cn('flex flex-col gap-1', isCurrentUser && 'items-end')}>
                        <div className="flex items-center gap-2 px-1">
                          <span className="font-semibold text-xs text-on-surface">
                            {senderUser?.name || 'Community Member'}
                          </span>
                          <span className="text-[10px] text-on-surface-variant">
                            {msg.timestamp || msg.time}
                          </span>
                        </div>

                        <div
                          className={cn(
                            'p-3.5 rounded-2xl text-xs sm:text-sm shadow-xs leading-relaxed',
                            isCurrentUser
                              ? 'bg-primary text-on-primary rounded-tr-none'
                              : 'bg-surface-container-high text-on-surface rounded-tl-none border border-outline-variant/30'
                          )}
                        >
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer Form */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 sm:p-4 bg-surface-bright border-t border-outline-variant/60 shrink-0"
              >
                <div className="flex items-center gap-2 bg-surface-container rounded-full px-4 py-2 border border-transparent focus-within:border-primary focus-within:bg-surface-bright focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={`Message #${activeGroup.name}...`}
                    className="flex-1 bg-transparent border-none text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="p-2 rounded-full bg-primary text-on-primary disabled:opacity-40 hover:bg-primary-hover shadow-xs transition-all shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Space Members Roster Drawer */}
            {showRoster && (
              <aside className="w-64 bg-surface-container-low border-l border-outline-variant/60 p-4 overflow-y-auto hidden lg:block custom-scrollbar">
                <h3 className="font-heading font-semibold text-xs uppercase tracking-wider text-on-surface-variant mb-3">
                  Channel Roster ({activeGroup.members.length})
                </h3>

                <div className="space-y-3">
                  {activeGroup.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar
                          src={member.avatar}
                          name={member.name}
                          status={member.status}
                          showStatus
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-on-surface truncate">{member.name}</p>
                          <p className="text-[10px] text-on-surface-variant truncate">{member.role}</p>
                        </div>
                      </div>

                      {member.id === 'user_me' && (
                        <span title="Admin">
                          <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </aside>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
};
