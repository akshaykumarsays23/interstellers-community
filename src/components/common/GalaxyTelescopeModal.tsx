'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { INITIAL_USERS } from '@/lib/data';
import { Telescope, X, Compass, Sparkles, MessageSquare, RefreshCw } from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { cn } from '@/lib/utils';

interface GalaxyTelescopeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GalaxyTelescopeModal: React.FC<GalaxyTelescopeModalProps> = ({ isOpen, onClose }) => {
  const { startChatWithUser, setActiveChatId, setIsAIPanelOpen } = useApp();
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [matchedUserIdx, setMatchedUserIdx] = useState<number>(0);

  if (!isOpen) return null;

  const candidates = INITIAL_USERS;
  const currentTarget = candidates[matchedUserIdx % candidates.length];

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setMatchedUserIdx((prev) => prev + 1);
      setIsScanning(false);
    }, 1200);
  };

  const handleMakeFirstContact = () => {
    const threadId = startChatWithUser(currentTarget);
    setActiveChatId(threadId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-surface-container border border-cyan-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col items-center text-center gap-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md animate-pulse">
            <Telescope className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold font-heading text-on-surface">🔭 GALAXY TELESCOPE</h3>
          <p className="text-xs text-on-surface-variant">Scanning cosmic orbits for compatible travelers...</p>
        </div>

        {/* Scanner View */}
        {isScanning ? (
          <div className="py-12 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-cyan-500/30 border-t-cyan-400 animate-spin" />
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-widest animate-pulse">
              Scanning Frequency Channels...
            </span>
          </div>
        ) : (
          <div className="w-full p-5 rounded-2xl bg-surface-container-high border border-white/10 flex flex-col items-center gap-4 relative">
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-extrabold uppercase tracking-wider">
              UNKNOWN TRAVELER DETECTED
            </span>

            <Avatar src={currentTarget.avatar} name={currentTarget.name} size="xl" />

            <div>
              <h4 className="text-base font-bold text-on-surface">{currentTarget.name}</h4>
              <p className="text-xs text-on-surface-variant">@{currentTarget.handle} • {currentTarget.role}</p>
            </div>

            {/* Compatibility Meters */}
            <div className="w-full space-y-2 pt-2 border-t border-white/10 text-xs">
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant">Music Vibe Match</span>
                <span className="text-emerald-400 font-extrabold">91%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 w-[91%]" />
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-on-surface-variant">Interests & Tech</span>
                <span className="text-cyan-400 font-extrabold">84%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 w-[84%]" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full pt-2">
              <button
                onClick={handleScan}
                className="py-2.5 px-4 rounded-xl bg-surface-container border border-outline-variant/40 hover:bg-surface-bright text-on-surface font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Rescan
              </button>

              <button
                onClick={handleMakeFirstContact}
                className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 text-black font-extrabold text-xs hover:bg-cyan-400 transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" /> MAKE FIRST CONTACT 🚀
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
