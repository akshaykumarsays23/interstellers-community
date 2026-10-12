'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Avatar } from './Avatar';
import {
  X,
  ShieldCheck,
  Sparkles,
  Phone,
  Video,
  MessageSquare,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Calendar,
  Award,
  Zap,
  Star,
  Users,
  Compass,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const UserProfileModal: React.FC = () => {
  const router = useRouter();
  const {
    selectedProfileUser,
    closeUserProfile,
    currentUser,
    startCall,
    startChatWithUser,
    userHouse,
  } = useApp();

  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  if (!selectedProfileUser) return null;

  const isMe = selectedProfileUser.id === currentUser.id || selectedProfileUser.handle === currentUser.handle;

  const handleStartChat = () => {
    startChatWithUser(selectedProfileUser);
    closeUserProfile();
    router.push('/messages');
  };

  const handleStartAudioCall = () => {
    closeUserProfile();
    startCall('audio', selectedProfileUser);
  };

  const handleStartVideoCall = () => {
    closeUserProfile();
    startCall('video', selectedProfileUser);
  };

  // Determine user's house
  const houseBadge = isMe && userHouse ? userHouse : 'marvel';
  const houseConfig: Record<string, { name: string; color: string; badge: string }> = {
    marvel: { name: 'Marvel House', color: 'bg-red-500/20 text-red-400 border-red-500/40', badge: 'Avengers Core 🛡️' },
    dc: { name: 'DC House', color: 'bg-blue-500/20 text-cyan-300 border-blue-500/40', badge: 'Gotham Citadel 🦇' },
    pokemon: { name: 'Pokemon House', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', badge: 'Electric League ⚡' },
    power_rangers: { name: 'Power Rangers House', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', badge: 'Morphin Grid 🦖' },
  };
  const activeHouse = houseConfig[houseBadge] || houseConfig.marvel;

  return (
    <>
      {/* Main Profile Card Modal */}
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-gradient-to-b from-surface-container-low via-surface-container to-surface-container-lowest border border-outline-variant/60 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
          
          {/* Header Banner */}
          <div className="h-28 bg-gradient-to-r from-purple-900/60 via-indigo-900/60 to-cyan-900/60 relative overflow-hidden p-4 flex justify-between items-start">
            <div className="absolute -top-10 -left-10 w-36 h-36 bg-purple-500/30 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-cyan-500/30 rounded-full blur-2xl pointer-events-none" />

            <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shadow-sm backdrop-blur-md', activeHouse.color)}>
              {activeHouse.name} • {activeHouse.badge}
            </span>

            <button
              onClick={closeUserProfile}
              className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all shadow-md"
              title="Close Profile"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Avatar & Core Profile Info */}
          <div className="px-6 pb-6 pt-0 relative">
            {/* Avatar with Zoom Overlay Button */}
            <div className="relative -mt-14 mb-3 inline-block group">
              <div
                onClick={() => {
                  setZoomScale(1);
                  setIsZoomOpen(true);
                }}
                className="cursor-zoom-in relative rounded-full overflow-hidden ring-4 ring-primary/40 shadow-xl transition-transform hover:scale-105"
                title="Click to Zoom Profile Picture"
              >
                <Avatar
                  src={selectedProfileUser.avatar}
                  name={selectedProfileUser.name}
                  status={selectedProfileUser.status}
                  showStatus
                  size="2xl"
                />
                {/* Zoom hover indicator */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold">
                  <ZoomIn className="w-5 h-5 mb-0.5 text-cyan-300" />
                  <span>Zoom</span>
                </div>
              </div>

              {/* Quick Zoom Trigger Pill */}
              <button
                type="button"
                onClick={() => {
                  setZoomScale(1);
                  setIsZoomOpen(true);
                }}
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-on-primary hover:bg-primary-hover shadow-md text-xs transition-transform active:scale-95"
                title="Enlarge and Zoom Avatar"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Name, Handle, Badges */}
            <div className="space-y-1 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-heading font-black text-xl text-on-surface">
                  {selectedProfileUser.name}
                </h3>
                {selectedProfileUser.isVerified && (
                  <ShieldCheck className="w-5 h-5 text-social-blue fill-social-blue/20" />
                )}
                {isMe && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                    Your Profile
                  </span>
                )}
              </div>

              <p className="text-xs text-on-surface-variant font-medium flex items-center gap-2">
                <span>@{selectedProfileUser.handle}</span>
                <span>•</span>
                <span className="text-primary font-semibold">{selectedProfileUser.role || 'Galactic Explorer'}</span>
              </p>
            </div>

            {/* Bio */}
            {selectedProfileUser.bio ? (
              <div className="p-3.5 rounded-2xl bg-surface-container-high/60 border border-outline-variant/40 mb-4 text-xs text-on-surface leading-relaxed">
                <p className="italic text-on-surface font-medium">&ldquo;{selectedProfileUser.bio}&rdquo;</p>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-surface-container-high/40 border border-outline-variant/30 mb-4 text-xs text-on-surface-variant italic">
                &ldquo;Time is never coming back, remember time is never... Exploring the galactic frontier.&rdquo;
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-center">
                <p className="text-[10px] text-on-surface-variant font-medium uppercase">House</p>
                <p className="text-xs font-black text-primary truncate mt-0.5">{activeHouse.name.replace(' House', '')}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-center">
                <p className="text-[10px] text-on-surface-variant font-medium uppercase">Residency</p>
                <p className="text-xs font-black text-emerald-400 mt-0.5">30-Day Cycle</p>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-center">
                <p className="text-[10px] text-on-surface-variant font-medium uppercase">Status</p>
                <p className="text-xs font-black text-cyan-400 mt-0.5 capitalize">{selectedProfileUser.status}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setZoomScale(1);
                  setIsZoomOpen(true);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-outline-variant/40"
              >
                <ZoomIn className="w-3.5 h-3.5 text-primary" />
                <span>Zoom Photo</span>
              </button>

              {!isMe && (
                <>
                  <button
                    onClick={handleStartChat}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Fellow Chat</span>
                  </button>

                  <button
                    onClick={handleStartAudioCall}
                    className="p-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface hover:text-primary transition-all border border-outline-variant/40"
                    title={`Audio call ${selectedProfileUser.name}`}
                  >
                    <Phone className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleStartVideoCall}
                    className="p-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface hover:text-primary transition-all border border-outline-variant/40"
                    title={`Video call ${selectedProfileUser.name}`}
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Lightbox High-Resolution Zoom Lightbox */}
      {isZoomOpen && (
        <div
          onClick={() => setIsZoomOpen(false)}
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200"
        >
          {/* Zoom Controls Top Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg flex items-center justify-between z-10 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span className="text-xs font-black truncate">{selectedProfileUser.name}&apos;s Profile Picture</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-cyan-300">
                {Math.round(zoomScale * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.max(0.5, prev - 0.25))}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setZoomScale(1)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                title="Reset Zoom (100%)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.min(3, prev + 0.25))}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="p-1.5 rounded-lg bg-rose-500/30 hover:bg-rose-500/50 text-rose-300 transition-all border border-rose-500/40"
                title="Close Zoom"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scalable Avatar Canvas */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex-1 w-full flex items-center justify-center overflow-hidden p-4"
          >
            <div
              style={{ transform: `scale(${zoomScale})`, transition: 'transform 0.2s ease-out' }}
              className="relative max-w-sm sm:max-w-md w-72 h-72 sm:w-96 sm:h-96 rounded-3xl overflow-hidden ring-4 ring-cyan-400/50 shadow-[0_0_50px_rgba(6,182,212,0.5)] bg-slate-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedProfileUser.avatar || '/avatar.png'}
                alt={selectedProfileUser.name}
                className="w-full h-full object-cover select-none"
              />
            </div>
          </div>

          {/* Zoom Instruction Footer */}
          <div className="text-center text-xs text-slate-300 pb-2">
            Click anywhere outside or the X button to close zoom • Use + and - buttons to magnify up to 300%
          </div>
        </div>
      )}
    </>
  );
};
