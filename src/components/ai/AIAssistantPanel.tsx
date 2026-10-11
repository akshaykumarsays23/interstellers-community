'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { Bot, Send, Sparkles, X, RotateCcw, ArrowRight, Mic, AlertCircle } from 'lucide-react';
import { cn, formatMessageDate } from '@/lib/utils';

// Helper to format basic markdown (bold, inline code, bullet points) cleanly without bulky dependencies
function FormattedText({ content }: { content: string }) {
  const lines = content.split('\n');

  return (
    <div className="space-y-1.5 leading-relaxed break-words text-xs sm:text-sm">
      {lines.map((line, idx) => {
        // Bullet points
        const isBullet = line.trim().startsWith('•') || line.trim().startsWith('- ') || line.trim().startsWith('* ');
        const cleanLine = isBullet ? line.trim().replace(/^([•\-\*]\s*)/, '') : line;

        // Process bold and inline code in line
        const parts = cleanLine.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

        const renderedLine = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-semibold text-on-surface">
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith('`') && part.endsWith('`')) {
            return (
              <code
                key={pIdx}
                className="px-1.5 py-0.5 rounded bg-surface-container-highest text-primary font-mono text-[11px]"
              >
                {part.slice(1, -1)}
              </code>
            );
          }
          return <span key={pIdx}>{part}</span>;
        });

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1.5">
              <span className="text-primary mt-1 text-[10px] select-none">•</span>
              <div className="flex-1">{renderedLine}</div>
            </div>
          );
        }

        if (!cleanLine.trim()) {
          return <div key={idx} className="h-1.5" />;
        }

        return <p key={idx}>{renderedLine}</p>;
      })}
    </div>
  );
}

export const AIAssistantPanel: React.FC = () => {
  const {
    aiMessages,
    isAITyping,
    sendAIMessage,
    retryAIMessage,
    clearAIChat,
    isAIPanelOpen,
    setIsAIPanelOpen,
    setIsNovaVoiceOpen,
  } = useApp();

  const [inputPrompt, setInputPrompt] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, isAITyping]);

  if (!isAIPanelOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || isAITyping) return;
    const promptToSend = inputPrompt.trim();
    setInputPrompt('');
    sendAIMessage(promptToSend);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputPrompt(e.target.value);
    // Auto-expand textarea up to max-height
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const quickPrompts = [
    'Explain the Space Rules 🌌',
    'How does the Activity System work? 🛰️',
    'What can you help me with? 📡',
    'Explain artificial intelligence in simple words 🧠',
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
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                Nova AI
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Autonomous Cosmic Assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsNovaVoiceOpen(true)}
            className="p-1.5 text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg transition-all flex items-center gap-1 text-xs font-bold shadow-xs animate-pulse"
            title="Start Voice Live Mode"
          >
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">Voice</span>
          </button>
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
                'p-3.5 rounded-2xl text-xs sm:text-sm shadow-xs leading-relaxed',
                msg.sender === 'user'
                  ? 'bg-primary text-on-primary rounded-br-none'
                  : msg.isError
                  ? 'bg-error-container/20 text-error border border-error/40 rounded-tl-none'
                  : 'bg-surface-container text-on-surface rounded-tl-none border border-outline-variant/30'
              )}
            >
              {msg.isError ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                    <span>{msg.text}</span>
                  </div>
                  {msg.failedPrompt && (
                    <button
                      onClick={() => retryAIMessage(msg.failedPrompt!)}
                      disabled={isAITyping}
                      className="self-start mt-1 px-3 py-1 text-xs font-semibold rounded-lg bg-error/20 hover:bg-error/30 text-error border border-error/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Retry Message
                    </button>
                  )}
                </div>
              ) : (
                <FormattedText content={msg.text} />
              )}
            </div>

            <span className="text-[10px] text-on-surface-variant/70 px-1">{formatMessageDate(msg.timestamp)}</span>

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
                    disabled={isAITyping}
                    className="text-left text-xs p-2 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/40 text-on-surface transition-all flex items-center justify-between group disabled:opacity-50"
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
          <div className="self-start flex items-center gap-2.5 p-3 bg-surface-container rounded-2xl rounded-tl-none text-xs text-on-surface-variant border border-outline-variant/30">
            <span className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
            </span>
            <span className="font-medium text-on-surface-variant">Nova is thinking...</span>
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
            disabled={isAITyping}
            className="text-[11px] px-2.5 py-1 rounded-full bg-surface-container hover:bg-primary-container hover:text-on-primary-container text-on-surface-variant transition-colors shrink-0 border border-outline-variant/40 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form with Enter to send and Shift+Enter for new lines */}
      <form onSubmit={handleSubmit} className="p-3 bg-surface-bright border-t border-outline-variant/60">
        <div className="flex items-end gap-2 bg-surface-container rounded-2xl px-3 py-2 border border-transparent focus-within:border-primary focus-within:bg-surface-bright focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputPrompt}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask Nova anything (Enter to send, Shift+Enter for newline)..."
            className="flex-1 bg-transparent border-none text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant outline-none resize-none max-h-28 custom-scrollbar leading-relaxed"
            disabled={isAITyping}
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isAITyping}
            className="p-2 rounded-xl bg-primary text-on-primary disabled:opacity-40 hover:bg-primary-hover transition-all shrink-0 shadow-xs mb-0.5"
            title="Send message (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </aside>
  );
};
