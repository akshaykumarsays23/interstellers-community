'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Package, X, Clock, Sparkles, CheckCircle2 } from 'lucide-react';

interface TimeCapsuleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TimeCapsuleModal: React.FC<TimeCapsuleModalProps> = ({ isOpen, onClose }) => {
  const { createTimeCapsule } = useApp();
  const [content, setContent] = useState<string>('');
  const [unlockDate, setUnlockDate] = useState<string>('2027-10-07');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    createTimeCapsule(content, unlockDate);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setContent('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-surface-container border border-purple-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-heading text-on-surface">📦 TIME CAPSULE TRANSMISSION</h3>
            <p className="text-xs text-on-surface-variant">Seal a future message to be unlocked across time</p>
          </div>
        </div>

        {isSuccess ? (
          <div className="py-8 flex flex-col items-center text-center gap-3 text-emerald-400">
            <CheckCircle2 className="w-12 h-12 animate-bounce" />
            <h4 className="text-lg font-bold text-on-surface">Time Capsule Sealed!</h4>
            <p className="text-xs text-on-surface-variant">Your transmission will unlock on {unlockDate}.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-on-surface mb-1 block">Capsule Message</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write a message to your future self or community travelers..."
                rows={4}
                className="w-full p-3.5 rounded-2xl bg-surface-container-high border border-outline-variant/50 text-xs text-on-surface outline-none focus:border-purple-500 transition-all resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-on-surface mb-1 block flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-purple-400" /> Unlock Date
              </label>
              <input
                type="date"
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
                className="w-full p-3 rounded-xl bg-surface-container-high border border-outline-variant/50 text-xs text-on-surface outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={!content.trim()}
              className="py-3 px-6 rounded-2xl bg-purple-500 text-white font-extrabold text-xs hover:bg-purple-400 disabled:opacity-50 transition-all shadow-md mt-2 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> SEAL TIME CAPSULE 📦
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
