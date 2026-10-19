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
  Rocket,
  House,
  Orbit,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const UserProfileModal: React.FC = () => {
  const router = useRouter();
  const {
    selectedProfileUser,
    closeUserProfile,
    currentUser,
    connections,
    startCall,
    startChatWithUser,
    userHouse,
    userHouseAssignedAt,
  } = useApp();

  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [failedZoomImageSrc, setFailedZoomImageSrc] = useState<string | null>(null);

  if (!selectedProfileUser) return null;

  const profileUser =
    selectedProfileUser.id === currentUser.id || selectedProfileUser.handle === currentUser.handle
      ? currentUser
      : connections.find(
          (user) =>
            user.id === selectedProfileUser.id ||
            user.handle.toLowerCase() === selectedProfileUser.handle.toLowerCase()
        ) || selectedProfileUser;
  const isMe = profileUser.id === currentUser.id || profileUser.handle === currentUser.handle;

  const openPhotoZoom = () => {
    setZoomScale(1);
    setFailedZoomImageSrc(null);
    setIsZoomOpen(true);
  };

  const handleStartChat = () => {
    startChatWithUser(profileUser);
    closeUserProfile();
    router.push('/messages');
  };

  const handleStartAudioCall = () => {
    closeUserProfile();
    startCall('audio', profileUser);
  };

  const handleStartVideoCall = () => {
    closeUserProfile();
    startCall('video', profileUser);
  };

  // Determine user's house
  const houseConfig: Record<string, { name: string; color: string; badge: string }> = {
    marvel: { name: 'Marvel House', color: 'profile-house-label--marvel', badge: 'Avengers Core' },
    dc: { name: 'DC House', color: 'profile-house-label--dc', badge: 'Gotham Citadel' },
    pokemon: { name: 'Pokemon House', color: 'profile-house-label--pokemon', badge: 'Electric League' },
    power_rangers: { name: 'Power Rangers House', color: 'profile-house-label--power-rangers', badge: 'Morphin Grid' },
  };
  const selectedHouse = isMe ? userHouse : profileUser.house || null;
  const activeHouse = selectedHouse ? houseConfig[selectedHouse] : null;
  const residencyAssignedAt = isMe ? userHouseAssignedAt : profileUser.houseAssignedAt ?? null;
  const residencyDaysRemaining =
    activeHouse && residencyAssignedAt !== null && Number.isFinite(residencyAssignedAt)
      ? Math.max(
          0,
          Math.ceil(
            (residencyAssignedAt + 30 * 24 * 60 * 60 * 1000 - Date.now()) /
              (24 * 60 * 60 * 1000)
          )
        )
      : null;
  const residencyLabel =
    residencyDaysRemaining === null
      ? 'No Active Cycle'
      : residencyDaysRemaining > 0
        ? `${residencyDaysRemaining} Days Left`
        : 'Cycle Complete';
  const houseLabel = activeHouse
    ? `${activeHouse.name} • ${activeHouse.badge}`
    : 'House Not Assigned';
  const houseValue = activeHouse?.name.replace(' House', '') || 'Not Assigned';
  const statusColor = {
    online: 'profile-status-dot--online',
    offline: 'profile-status-dot--offline',
    away: 'profile-status-dot--away',
    busy: 'profile-status-dot--busy',
  }[profileUser.status];
  const profileInitials = profileUser.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Main Profile Card Modal */}
      <div className="profile-cosmic-backdrop fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-5 animate-in fade-in duration-200">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-modal-name"
          className="profile-cosmic-panel relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[600px] flex-col overflow-hidden rounded-[22px] animate-in zoom-in-95 duration-200 sm:max-h-[calc(100dvh-2.5rem)]"
        >
          
          {/* Header Banner */}
          <div className="profile-cosmic-header relative flex min-h-[174px] shrink-0 items-start justify-between gap-3 overflow-hidden p-4 sm:min-h-[184px] sm:px-6 sm:py-4">
            <div className="profile-nebula profile-nebula--violet pointer-events-none absolute -left-10 top-5 h-36 w-44 rounded-full" />
            <div className="profile-nebula profile-nebula--cyan pointer-events-none absolute -bottom-14 right-1/4 h-36 w-48 rounded-full" />
            <div className="profile-planet pointer-events-none absolute" />

            <span className={cn('profile-house-label relative z-10 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md sm:text-[11px]', activeHouse?.color)}>
              <Rocket className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{houseLabel}</span>
            </span>

            <button
              type="button"
              onClick={() => {
                setIsZoomOpen(false);
                closeUserProfile();
              }}
              aria-label="Close profile"
              className="profile-close-control relative z-10 shrink-0 rounded-full p-1.5 text-white transition-all"
              title="Close Profile"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Avatar & Core Profile Info */}
          <div className="profile-cosmic-content relative overflow-y-auto px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
            {/* Avatar with Zoom Overlay Button */}
            <div className="profile-avatar-orbit group relative -mt-[62px] mb-2 inline-flex sm:-mt-[68px]">
              <div
                role="button"
                tabIndex={0}
                aria-label={`Zoom ${profileUser.name}'s profile photo`}
                onClick={openPhotoZoom}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openPhotoZoom();
                  }
                }}
                className="profile-avatar-frame relative cursor-zoom-in overflow-hidden rounded-full transition-transform hover:scale-[1.04]"
                title="Click to Zoom Profile Picture"
              >
                <Avatar
                  src={profileUser.avatar}
                  name={profileUser.name}
                  status={profileUser.status}
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
                onClick={openPhotoZoom}
                className="profile-avatar-zoom absolute bottom-0 right-0 rounded-full p-1.5 text-xs transition-transform active:scale-95"
                title="Enlarge and Zoom Avatar"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Name, Handle, Badges */}
            <div className="mb-4 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 id="profile-modal-name" className="profile-cosmic-name font-heading text-xl font-black text-white sm:text-2xl">
                  {profileUser.name}
                </h3>
                {profileUser.isVerified && (
                  <ShieldCheck className="w-5 h-5 text-social-blue fill-social-blue/20" />
                )}
                {isMe && (
                  <span className="profile-your-account rounded-full border px-2 py-0.5 text-[10px] font-extrabold">
                    Your Profile
                  </span>
                )}
              </div>

              <p className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-300 sm:text-sm">
                <span>@{profileUser.handle}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-cyan-200">
                  <Users className="h-3.5 w-3.5" />
                  {profileUser.profileRole || profileUser.role || 'Community Member'}
                </span>
              </p>
            </div>

            {/* Bio */}
            {profileUser.bio ? (
              <div className="profile-quote mb-4 flex items-start gap-2.5 rounded-2xl p-3.5 text-xs leading-relaxed sm:text-sm">
                <Rocket className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                <p className="font-medium italic text-slate-100">&ldquo;{profileUser.bio}&rdquo;</p>
              </div>
            ) : (
              <div className="profile-quote mb-4 flex items-start gap-2.5 rounded-2xl p-3 text-xs italic leading-relaxed sm:text-sm">
                <Rocket className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                <p className="text-slate-300">No bio added yet.</p>
              </div>
            )}

            {/* Stats Grid */}
            <div className="mb-4 grid grid-cols-3 gap-2 sm:mb-5 sm:gap-3">
              <div className="profile-cosmic-card profile-cosmic-card--house rounded-2xl p-2.5 sm:p-3.5">
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-300 sm:text-[11px]">
                  <House className="h-3.5 w-3.5 text-fuchsia-300" />
                  House
                </div>
                <p className="mt-1 truncate text-xs font-black text-fuchsia-200 sm:text-sm">{houseValue}</p>
              </div>
              <div className="profile-cosmic-card profile-cosmic-card--residency rounded-2xl p-2.5 sm:p-3.5">
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-300 sm:text-[11px]">
                  <Orbit className="h-3.5 w-3.5 text-cyan-300" />
                  Residency
                </div>
                <p className="mt-1 truncate text-xs font-black text-cyan-200 sm:text-sm">{residencyLabel}</p>
              </div>
              <div className="profile-cosmic-card profile-cosmic-card--status rounded-2xl p-2.5 sm:p-3.5">
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-300 sm:text-[11px]">
                  Status
                </div>
                <p className="mt-1 flex items-center justify-center gap-1.5 truncate text-xs font-black capitalize text-slate-100 sm:text-sm">
                  <span className={cn('profile-status-dot', statusColor)} />
                  {profileUser.status}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setZoomScale(1);
                  setIsZoomOpen(true);
                }}
                className="profile-cosmic-button flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-all"
              >
                <ZoomIn className="h-3.5 w-3.5 text-cyan-200" />
                <span>Zoom Photo</span>
              </button>

              {!isMe && (
                <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                  <button
                    type="button"
                    onClick={handleStartChat}
                    className="profile-secondary-action flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Fellow Chat</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStartAudioCall}
                    className="profile-secondary-action flex min-h-10 min-w-10 items-center justify-center rounded-xl px-3 py-2 text-slate-100 transition-all"
                    title={`Audio call ${profileUser.name}`}
                  >
                    <Phone className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleStartVideoCall}
                    className="profile-secondary-action flex min-h-10 min-w-10 items-center justify-center rounded-xl px-3 py-2 text-slate-100 transition-all"
                    title={`Video call ${profileUser.name}`}
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
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
              <span className="text-xs font-black truncate">{profileUser.name}&apos;s Profile Picture</span>
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
              className="relative aspect-square w-[min(78vw,24rem)] overflow-hidden rounded-3xl ring-4 ring-cyan-400/50 shadow-[0_0_50px_rgba(6,182,212,0.5)] bg-slate-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {profileUser.avatar && failedZoomImageSrc !== profileUser.avatar ? (
                <img
                  src={profileUser.avatar}
                  alt={profileUser.name}
                  onError={() => setFailedZoomImageSrc(profileUser.avatar)}
                  className="h-full w-full select-none object-contain"
                />
              ) : (
                <div className="profile-zoom-initials flex h-full w-full items-center justify-center text-6xl font-bold text-cyan-100">
                  {profileInitials}
                </div>
              )}
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
