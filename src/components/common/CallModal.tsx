'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { Avatar } from './Avatar';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export const CallModal: React.FC = () => {
  const { callState, endCall, toggleMute, toggleVideo } = useApp();

  if (!callState.isOpen) return null;

  const minutes = Math.floor(callState.duration / 60);
  const seconds = callState.duration % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Video Canvas or Audio Room */}
        <div className="relative bg-gradient-to-br from-inverse-surface via-slate-900 to-black h-80 sm:h-96 flex flex-col items-center justify-center p-6 text-white overflow-hidden">
          {/* Ambient cosmic lighting */}
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-primary/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-social-blue/30 rounded-full blur-3xl pointer-events-none" />

          {callState.type === 'video' && !callState.isVideoOff ? (
            <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center">
              {/* Simulated video stream */}
              <div className="text-center">
                <Avatar
                  src={callState.participant?.avatar}
                  name={callState.participant?.name || callState.groupName}
                  size="2xl"
                  className="mx-auto mb-3 ring-4 ring-primary/40 animate-pulse"
                />
                <p className="font-semibold text-lg">{callState.participant?.name || callState.groupName}</p>
                <p className="text-xs text-white/70 flex items-center justify-center gap-1 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  HD Encrypted Galaxy Stream Active
                </p>
              </div>

              {/* Self view pip */}
              <div className="absolute bottom-3 right-3 w-28 h-20 bg-slate-800 rounded-lg border border-white/20 overflow-hidden flex items-center justify-center shadow-lg">
                <span className="text-[10px] text-white/80 font-medium">You (Camera On)</span>
              </div>
            </div>
          ) : (
            <div className="text-center z-10">
              <div className="relative inline-block mb-4">
                <Avatar
                  src={callState.participant?.avatar}
                  name={callState.participant?.name || callState.groupName}
                  size="2xl"
                  className="ring-4 ring-primary shadow-glow"
                />
                <span className="absolute bottom-1 right-1 p-1 bg-emerald-500 rounded-full text-white">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">
                {callState.participant?.name || callState.groupName || 'Interstellar Conference'}
              </h2>
              <p className="text-sm text-primary-fixed mb-2 font-mono">{formattedTime}</p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs text-white/80 border border-white/10">
                <Users className="w-3.5 h-3.5" />
                <span>Interstellar Audio Channel</span>
              </div>
            </div>
          )}

          {/* Call Status Badge */}
          <div className="absolute top-4 left-4 bg-black/40 backdrop-blur px-3 py-1 rounded-full text-xs font-mono text-emerald-400 border border-white/10 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Connected • {formattedTime}
          </div>
        </div>

        {/* Control Bar */}
        <div className="p-4 sm:p-6 bg-surface-container flex items-center justify-center gap-4">
          <button
            onClick={toggleMute}
            className={cn(
              'p-3.5 rounded-full border transition-all duration-200 shadow-sm flex items-center justify-center',
              callState.isMuted
                ? 'bg-error text-on-error border-error'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high border-outline-variant'
            )}
            title={callState.isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {callState.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleVideo}
            className={cn(
              'p-3.5 rounded-full border transition-all duration-200 shadow-sm flex items-center justify-center',
              callState.isVideoOff
                ? 'bg-error text-on-error border-error'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high border-outline-variant'
            )}
            title={callState.isVideoOff ? 'Turn video on' : 'Turn video off'}
          >
            {callState.isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          <button
            onClick={endCall}
            className="px-6 py-3.5 rounded-full bg-error hover:bg-red-700 text-on-error font-semibold text-sm shadow-md transition-all flex items-center gap-2"
            title="End call"
          >
            <PhoneOff className="w-5 h-5" />
            <span>Leave Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};
