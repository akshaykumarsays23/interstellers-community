'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/lib/store';
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, Square, Radio, Bot, Waves } from 'lucide-react';
import { cn } from '@/lib/utils';

export const NovaVoiceModal: React.FC = () => {
  const { isNovaVoiceOpen, setIsNovaVoiceOpen, currentUser } = useApp();
  const [voiceStatus, setVoiceStatus] = useState<'listening' | 'processing' | 'speaking' | 'idle'>('idle');
  const [transcript, setTranscript] = useState('');
  const [novaResponse, setNovaResponse] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize Speech Synthesis Voices
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Select best female voice preferred by default
      const femaleVoice = availableVoices.find(
        (v) =>
          (v.name.includes('Zira') ||
            v.name.includes('Samantha') ||
            v.name.includes('Google US English') ||
            v.name.includes('Female') ||
            v.name.includes('Natural')) &&
          v.lang.startsWith('en')
      ) || availableVoices.find((v) => v.lang.startsWith('en')) || availableVoices[0];

      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
      }
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Handle Speech Recognition setup
  useEffect(() => {
    if (!isNovaVoiceOpen) {
      stopListening();
      stopSpeaking();
      setVoiceStatus('idle');
      return;
    }

    // Start voice session when modal opens
    startListening();

    return () => {
      stopListening();
      stopSpeaking();
    };
  }, [isNovaVoiceOpen]);

  const startListening = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setNovaResponse("Speech recognition isn't supported in this browser environment, but you can chat with me in text!");
      return;
    }

    stopSpeaking();
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setVoiceStatus('listening');
        setTranscript('');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setVoiceStatus('idle');
        }
      };

      recognition.onend = () => {
        if (transcript.trim()) {
          processUserVoiceInput(transcript);
        } else {
          setVoiceStatus('idle');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Error starting speech recognition:', e);
      setVoiceStatus('idle');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) {}
      recognitionRef.current = null;
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  // Process user speech and query real server-side Nova AI Engine
  const processUserVoiceInput = async (userText: string) => {
    setVoiceStatus('processing');
    const userEmail = currentUser?.email || (typeof window !== 'undefined' ? localStorage.getItem('user_email') || undefined : undefined);

    let reply = '';
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          userEmail,
          history: novaResponse
            ? [
                { role: 'assistant', content: novaResponse },
                { role: 'user', content: userText },
              ]
            : [{ role: 'user', content: userText }],
        }),
      });

      const data = await res.json();
      if (data && data.reply) {
        reply = data.reply;
      } else {
        reply = `I heard you loud and clear regarding "${userText}"! My cosmic sensors are fully online. Ask me about Marvel, DC, Pokemon, Power Rangers, space physics, or anything across the universe!`;
      }
    } catch (e) {
      reply = `I heard you loud and clear regarding "${userText}"! My cosmic sensors are fully online. Ask me about Marvel, DC, Pokemon, Power Rangers, space physics, or anything across the universe!`;
    }

    setNovaResponse(reply);

    // Speak Nova's response aloud
    setTimeout(() => {
      speakNovaResponse(reply);
    }, 300);
  };

  // Text-To-Speech Synthesis
  const speakNovaResponse = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis || isMuted) {
      setVoiceStatus('idle');
      return;
    }

    stopSpeaking();

    // Clean markdown formatting for spoken text
    const cleanSpokenText = text.replace(/[\*\#\_\`]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanSpokenText);
    utterance.rate = 1.05;
    utterance.pitch = 1.1; // Friendly warm pitch

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      setVoiceStatus('speaking');
    };

    utterance.onend = () => {
      setVoiceStatus('idle');
      // Automatically restart microphone for a continuous ChatGPT / Gemini Live style hands-free conversation loop!
      setTimeout(() => {
        startListening();
      }, 600);
    };

    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setVoiceStatus('idle');
    };

    synthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  if (!isNovaVoiceOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="w-full max-w-2xl flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Nova AI Voice Live
              <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-extrabold bg-gradient-to-r from-purple-500/30 to-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded-full flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-cyan-400 animate-ping" />
                Live Mode
              </span>
            </h2>
            <p className="text-xs text-zinc-400">Continuous hands-free conversation powered by Gemini Live</p>
          </div>
        </div>

        <button
          onClick={() => {
            stopListening();
            stopSpeaking();
            setIsNovaVoiceOpen(false);
          }}
          className="p-2.5 rounded-full bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800 transition-all shadow-md"
          title="End Voice Session"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Interactive Voice Orb Visualizer */}
      <div className="relative flex flex-col items-center justify-center my-auto">
        {/* Ambient Glow Rings */}
        <div
          className={cn(
            'absolute w-72 h-72 rounded-full blur-3xl transition-all duration-700 opacity-60',
            voiceStatus === 'listening' && 'bg-cyan-500/30 scale-125 animate-pulse',
            voiceStatus === 'processing' && 'bg-amber-500/30 scale-110 animate-spin',
            voiceStatus === 'speaking' && 'bg-purple-500/40 scale-150 animate-pulse',
            voiceStatus === 'idle' && 'bg-indigo-500/20 scale-100'
          )}
        />

        {/* Central Dynamic Voice Orb */}
        <div
          onClick={() => {
            if (voiceStatus === 'speaking') {
              stopSpeaking();
              startListening();
            } else if (voiceStatus === 'listening') {
              stopListening();
              setVoiceStatus('idle');
            } else {
              startListening();
            }
          }}
          className={cn(
            'relative w-44 h-44 rounded-full flex items-center justify-center cursor-pointer transition-all duration-500 shadow-2xl border border-white/20 select-none group',
            voiceStatus === 'listening' && 'bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 scale-105 shadow-cyan-500/50',
            voiceStatus === 'processing' && 'bg-gradient-to-br from-amber-500 via-orange-600 to-purple-600 scale-95 shadow-amber-500/40',
            voiceStatus === 'speaking' && 'bg-gradient-to-br from-purple-500 via-fuchsia-600 to-pink-500 scale-110 shadow-purple-500/60',
            voiceStatus === 'idle' && 'bg-gradient-to-br from-zinc-800 to-zinc-900 hover:scale-105 shadow-zinc-900/50'
          )}
        >
          {/* Waveforms / Icons inside Orb */}
          {voiceStatus === 'listening' && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-10 bg-white rounded-full animate-bounce [animation-delay:-0.4s]" />
              <span className="w-2.5 h-16 bg-white rounded-full animate-bounce [animation-delay:-0.2s]" />
              <span className="w-2.5 h-20 bg-white rounded-full animate-bounce" />
              <span className="w-2.5 h-16 bg-white rounded-full animate-bounce [animation-delay:-0.2s]" />
              <span className="w-2.5 h-10 bg-white rounded-full animate-bounce [animation-delay:-0.4s]" />
            </div>
          )}

          {voiceStatus === 'processing' && (
            <div className="flex flex-col items-center gap-2">
              <Sparkles className="w-12 h-12 text-white animate-spin" />
              <span className="text-[11px] font-bold text-white tracking-widest uppercase">Thinking</span>
            </div>
          )}

          {voiceStatus === 'speaking' && (
            <div className="flex items-center gap-2">
              <Waves className="w-16 h-16 text-white animate-pulse" />
            </div>
          )}

          {voiceStatus === 'idle' && (
            <div className="flex flex-col items-center gap-2 text-zinc-400 group-hover:text-white transition-colors">
              <Mic className="w-12 h-12" />
              <span className="text-[11px] font-semibold tracking-wider">TAP TO TALK</span>
            </div>
          )}
        </div>

        {/* Live Status Label */}
        <div className="mt-8 text-center">
          <p className="text-sm font-semibold tracking-wide text-zinc-300">
            {voiceStatus === 'listening' && '🎙️ Listening... Speak naturally'}
            {voiceStatus === 'processing' && '🧠 Nova is processing galaxy telemetry...'}
            {voiceStatus === 'speaking' && '🔊 Nova is speaking...'}
            {voiceStatus === 'idle' && 'Tap the orb to start speaking'}
          </p>
        </div>

        {/* Live Subtitle Transcript Display */}
        <div className="mt-6 max-w-md min-h-[60px] px-6 py-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md text-center text-sm font-medium leading-relaxed shadow-lg">
          {transcript && (
            <p className="text-cyan-300 italic">
              <span className="text-xs text-cyan-400/70 font-semibold block mb-0.5">YOU SAID:</span>
              "{transcript}"
            </p>
          )}

          {novaResponse && voiceStatus === 'speaking' && (
            <p className="text-purple-200">
              <span className="text-xs text-purple-400/70 font-semibold block mb-0.5">NOVA:</span>
              {novaResponse}
            </p>
          )}

          {!transcript && !novaResponse && (
            <p className="text-zinc-500 text-xs italic">Subtitles will appear live as you talk...</p>
          )}
        </div>
      </div>

      {/* Bottom Control Deck */}
      <div className="w-full max-w-md flex items-center justify-center gap-4 py-4 px-6 rounded-full bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-xl shadow-2xl z-10">
        {/* Mute/Unmute Mic */}
        <button
          onClick={() => {
            if (voiceStatus === 'listening') {
              stopListening();
              setVoiceStatus('idle');
            } else {
              startListening();
            }
          }}
          className={cn(
            'p-3.5 rounded-full transition-all flex items-center gap-2 text-xs font-semibold',
            voiceStatus === 'listening'
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          )}
          title={voiceStatus === 'listening' ? 'Mute Microphone' : 'Unmute Microphone'}
        >
          {voiceStatus === 'listening' ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          <span>{voiceStatus === 'listening' ? 'Mic Active' : 'Mic Off'}</span>
        </button>

        {/* Stop Speaking / Interrupt Button */}
        {voiceStatus === 'speaking' && (
          <button
            onClick={() => {
              stopSpeaking();
              startListening();
            }}
            className="p-3.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 transition-all flex items-center gap-2 text-xs font-semibold shadow-lg"
            title="Interrupt Nova"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Interrupt</span>
          </button>
        )}

        {/* Mute Audio Speaker Output */}
        <button
          onClick={() => {
            setIsMuted(!isMuted);
            if (!isMuted) stopSpeaking();
          }}
          className={cn(
            'p-3.5 rounded-full transition-all flex items-center gap-2 text-xs font-semibold',
            isMuted ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          )}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};
