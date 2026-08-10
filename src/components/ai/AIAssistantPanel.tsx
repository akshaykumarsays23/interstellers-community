'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { Bot, Send, Sparkles, X, RotateCcw, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const AIAssistantPanel: React.FC = () => {
  const { aiMessages, isAITyping, sendAIMessage, clearAIChat, isAIPanelOpen, setIsAIPanelOpen } = useApp();
  const [inputPrompt, setInputPrompt] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, isAITyping]);

  if (!isAIPanelOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isAITyping) return;
    sendAIMessage(inputPrompt);
    setInputPrompt('');
  };

  const quickPrompts = [
    "Summarize unread community threads",
    "Draft a new post for #design-sync",
    "Find contacts in Orbital Systems",
    "Review platform security guidelines",
  ];

  return (
    <aside className="w-full xl:w-[380px] h-full bg-surface-container-lowest border-l border-outline-variant/60 flex flex-col shrink-0 z-20 shadow-floating xl:shadow-none animate-in slide-in-from-right duration-200">
      {/* AI Panel Header */}
      <div className="p-4 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-low">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary-container text-on-primary flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-heading font-bold text-sm text-on-surface">Interstellar AI</h2>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                Nova v3
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected to Galaxy Workspace
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={clearAIChat}
            className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-colors"
            title="Reset Conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsAIPanelOpen(false)}
            className="p-1.5 text-on-surface-variant hover:text-error hover:bg-surface-container-high rounded-lg transition-colors"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3.5 bg-background custom-scrollbar">
        {aiMessages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex flex-col gap-1 max-w-[90%]',
              msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
            )}
          >
            <div
              className={cn(
                'p-3.5 rounded-2xl text-xs sm:text-sm shadow-xs leading-relaxed whitespace-pre-wrap',
                msg.sender === 'user'
                  ? 'bg-primary text-on-primary rounded-br-none'
                  : 'bg-surface-container text-on-surface rounded-tl-none border border-outline-variant/30'
              )}
            >
              {msg.text}
            </div>

            <span className="text-[10px] text-on-surface-variant/70 px-1">{msg.timestamp}</span>

            {/* Suggested prompt chips if present */}
            {msg.suggestedActions && msg.suggestedActions.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-2 w-full">
                <p className="text-[11px] font-semibold text-primary flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Suggested Inquiries:
                </p>
                {msg.suggestedActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendAIMessage(action)}
                    className="text-left text-xs p-2 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/40 text-on-surface transition-all flex items-center justify-between group"
                  >
                    <span className="line-clamp-1">{action}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isAITyping && (
          <div className="self-start flex items-center gap-2 p-3 bg-surface-container rounded-2xl rounded-tl-none text-xs text-on-surface-variant border border-outline-variant/30">
            <span className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
            </span>
            <span>Nova is formulating galaxy telemetry...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Fast Prompts Bar */}
      <div className="px-3 py-2 bg-surface-container-low border-t border-outline-variant/40 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
        {quickPrompts.slice(0, 2).map((prompt, i) => (
          <button
            key={i}
            onClick={() => sendAIMessage(prompt)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-surface-container hover:bg-primary-container hover:text-on-primary-container text-on-surface-variant transition-colors shrink-0 border border-outline-variant/40"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 bg-surface-bright border-t border-outline-variant/60">
        <div className="flex items-center gap-2 bg-surface-container rounded-full px-3 py-1.5 border border-transparent focus-within:border-primary focus-within:bg-surface-bright focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask Nova anything about the galaxy..."
            className="flex-1 bg-transparent border-none text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant outline-none"
            disabled={isAITyping}
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isAITyping}
            className="p-1.5 rounded-full bg-primary text-on-primary disabled:opacity-40 hover:bg-primary-hover transition-all shrink-0 shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </aside>
  );
};
