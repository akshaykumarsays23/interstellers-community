'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/lib/store';
import { Avatar } from './Avatar';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Users,
  Sparkles,
  Radio,
  Volume2,
  CheckCircle2,
  PhoneCall,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const CallModal: React.FC = () => {
  const { callState, endCall, toggleMute, toggleVideo, currentUser } = useApp();

  const [callPhase, setCallPhase] = useState<'dialing' | 'ringing' | 'connected'>('dialing');
  const [friendSpeech, setFriendSpeech] = useState<string>('');
  const [userSpeechText, setUserSpeechText] = useState<string>('');
  const audioContextRef = useRef<AudioContext | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Soft cosmic ringtone generator via Web Audio API
  const playRingtoneBeep = (freq: number = 440, duration: number = 0.4) => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) audioContextRef.current = new AudioCtx();
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_) {}
  };

  // Lifecycle progression: dialing -> ringing -> connected
  useEffect(() => {
    if (!callState.isOpen) {
      setCallPhase('dialing');
      setFriendSpeech('');
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
      return;
    }

    setCallPhase('dialing');
    playRingtoneBeep(520, 0.3);

    const ringTimer = setTimeout(() => {
      setCallPhase('ringing');
      playRingtoneBeep(580, 0.4);
    }, 1500);

    const connectTimer = setTimeout(() => {
      setCallPhase('connected');
      playRingtoneBeep(880, 0.25);

      const participantName = callState.participant?.name || 'Fellow Traveler';
      const greeting = `Hey ${currentUser.name}! Transmission established! Glad you called across the stars. How is your House doing today?`;
      setFriendSpeech(greeting);

      // Synthesize friend's greeting voice if audio is enabled
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try {
          const utter = new SpeechSynthesisUtterance(greeting);
          utter.rate = 1.05;
          utter.pitch = 1.1;
          window.speechSynthesis.speak(utter);
        } catch (_) {}
      }
    }, 3500);

    return () => {
      clearTimeout(ringTimer);
      clearTimeout(connectTimer);
    };
  }, [callState.isOpen, callState.participant]);

  // Request camera video stream if video call
  useEffect(() => {
    if (!callState.isOpen || callState.type !== 'video' || callState.isVideoOff) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
      return;
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          // Camera permission denied or not available; fallback to holographic display
        });
    }

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [callState.isOpen, callState.type, callState.isVideoOff]);

  const handleSendSpeech = (text: string) => {
    setUserSpeechText(text);
    // Friend responds
    setTimeout(() => {
      const replies = [
        "That's awesome! Our House is currently grinding points on the Reactor!",
        "Definitely! Let's team up in the Multiverse Trivia clash!",
        "Catch you soon across the space stations! Stay safe out there!",
      ];
      const rep = replies[Math.floor(Math.random() * replies.length)];
      setFriendSpeech(rep);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try {
          const utter = new SpeechSynthesisUtterance(rep);
          window.speechSynthesis.speak(utter);
        } catch (_) {}
      }
    }, 1200);
  };

  if (!callState.isOpen) return null;

  const minutes = Math.floor(callState.duration / 60);
  const seconds = callState.duration % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const targetName = callState.participant?.name || callState.groupName || 'Interstellar Friend';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-surface-container-low via-surface-container to-surface-container-lowest border border-cyan-500/30 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Main Audio/Video Deck */}
        <div className="relative bg-gradient-to-br from-[#0c0d28] via-[#150f38] to-[#041a2e] h-80 sm:h-96 flex flex-col items-center justify-center p-6 text-white overflow-hidden">
          {/* Ambient cosmic lighting */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-500/25 rounded-full blur-3xl pointer-events-none" />

          {/* Top Status Ticker */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            <div className="bg-black/50 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-mono border border-white/10 flex items-center gap-2 shadow-sm">
              {callPhase === 'dialing' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-amber-300 font-bold">Dialing Quantum Channel...</span>
                </>
              )}
              {callPhase === 'ringing' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-cyan-300 font-bold">Ringing across the stars...</span>
                </>
              )}
              {callPhase === 'connected' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-300 font-bold">Connected • {formattedTime}</span>
                </>
              )}
            </div>
          </div>

          {/* Video Mode or Audio Holo-Room */}
          {callState.type === 'video' && !callState.isVideoOff ? (
            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center">
              {/* Participant video display */}
              <div className="text-center z-10">
                <Avatar
                  src={callState.participant?.avatar}
                  name={targetName}
                  size="2xl"
                  className="mx-auto mb-3 ring-4 ring-cyan-400/50 shadow-glow"
                />
                <h3 className="font-heading font-black text-lg text-white">{targetName}</h3>
                <p className="text-xs text-cyan-200/80 flex items-center justify-center gap-1 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Quantum Video Stream • 1080p 60fps
                </p>
              </div>

              {/* Self Camera PiP */}
              <div className="absolute bottom-3 right-3 w-32 h-24 bg-slate-900 rounded-xl border border-cyan-400/40 overflow-hidden shadow-2xl flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 left-2 text-[9px] font-mono text-white/90 bg-black/60 px-1 rounded">
                  You
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center z-10 max-w-md w-full">
              <div className="relative inline-block mb-4">
                <Avatar
                  src={callState.participant?.avatar}
                  name={targetName}
                  size="2xl"
                  className={cn(
                    'ring-4 transition-all duration-700 shadow-glow',
                    callPhase === 'connected' ? 'ring-emerald-400' : 'ring-cyan-400 animate-pulse'
                  )}
                />
                <span className="absolute bottom-1 right-1 p-1 bg-gradient-to-tr from-purple-500 to-cyan-500 rounded-full text-white shadow-md">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black font-heading text-white mb-1">
                {targetName}
              </h2>
              <p className="text-xs text-cyan-200 mb-3 font-mono">
                {callPhase === 'connected' ? `Active Audio Channel • ${formattedTime}` : 'Establishing orbital link...'}
              </p>

              {/* Equalizer animation when connected */}
              {callPhase === 'connected' && (
                <div className="flex items-center justify-center gap-1.5 h-6 mb-3">
                  <span className="w-1 bg-cyan-400 h-3 rounded-full animate-pulse" />
                  <span className="w-1 bg-purple-400 h-5 rounded-full animate-bounce" />
                  <span className="w-1 bg-pink-400 h-4 rounded-full animate-pulse" />
                  <span className="w-1 bg-amber-400 h-6 rounded-full animate-bounce" />
                  <span className="w-1 bg-emerald-400 h-3 rounded-full animate-pulse" />
                </div>
              )}

              {/* Real-time speech transcript from friend */}
              {friendSpeech && (
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-xs text-white leading-relaxed animate-in fade-in shadow-md">
                  <p className="text-[10px] text-cyan-300 font-extrabold uppercase mb-0.5 font-mono">
                    {targetName} Speaking:
                  </p>
                  &ldquo;{friendSpeech}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Voice Hail Chips */}
        {callPhase === 'connected' && (
          <div className="px-4 py-2.5 bg-surface-container border-b border-outline-variant/30 flex items-center gap-2 overflow-x-auto custom-scrollbar">
            <span className="text-[10px] font-bold text-on-surface-variant shrink-0">Quick Hails:</span>
            <button
              onClick={() => handleSendSpeech("All good in my House! How's your battle points?")}
              className="text-[11px] px-2.5 py-1 rounded-full bg-surface-container-high hover:bg-primary hover:text-white transition-all shrink-0 font-medium border border-outline-variant/40"
            >
              🚀 All good in my House!
            </button>
            <button
              onClick={() => handleSendSpeech("Ready for the next House Clash?")}
              className="text-[11px] px-2.5 py-1 rounded-full bg-surface-container-high hover:bg-primary hover:text-white transition-all shrink-0 font-medium border border-outline-variant/40"
            >
              ⚔️ Ready for House Clash?
            </button>
            <button
              onClick={() => handleSendSpeech("Catch you later among the stars!")}
              className="text-[11px] px-2.5 py-1 rounded-full bg-surface-container-high hover:bg-primary hover:text-white transition-all shrink-0 font-medium border border-outline-variant/40"
            >
              👋 Catch you later!
            </button>
          </div>
        )}

        {/* Control Bar */}
        <div className="p-4 sm:p-5 bg-surface-container-low flex items-center justify-center gap-4">
          <button
            onClick={toggleMute}
            className={cn(
              'p-3.5 rounded-full border transition-all duration-200 shadow-md flex items-center justify-center active:scale-95',
              callState.isMuted
                ? 'bg-error text-on-error border-error shadow-error/30'
                : 'bg-surface-container-highest text-on-surface hover:bg-surface-container hover:text-primary border-outline-variant'
            )}
            title={callState.isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {callState.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleVideo}
            className={cn(
              'p-3.5 rounded-full border transition-all duration-200 shadow-md flex items-center justify-center active:scale-95',
              callState.isVideoOff
                ? 'bg-error text-on-error border-error shadow-error/30'
                : 'bg-surface-container-highest text-on-surface hover:bg-surface-container hover:text-primary border-outline-variant'
            )}
            title={callState.isVideoOff ? 'Turn video on' : 'Turn video off'}
          >
            {callState.isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          <button
            onClick={endCall}
            className="px-6 py-3.5 rounded-full bg-error hover:bg-red-700 text-on-error font-black text-xs sm:text-sm shadow-lg shadow-error/30 transition-all flex items-center gap-2 active:scale-95"
            title="Leave / End Call"
          >
            <PhoneOff className="w-5 h-5" />
            <span>End Transmission</span>
          </button>
        </div>

      </div>
    </div>
  );
};
