'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { SpaceStation } from '@/lib/types';
import { Avatar } from '@/components/common/Avatar';
import {
  Compass,
  Sparkles,
  Users,
  MessageSquare,
  Radio,
  Zap,
  Shield,
  Activity,
  X,
  Send,
  Orbit,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Wifi,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StationLogMessage {
  id: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
}

export const SpaceStationsView: React.FC = () => {
  const { stations, currentUser } = useApp();

  const [dockedStation, setDockedStation] = useState<SpaceStation | null>(null);
  const [airlockStatus, setAirlockStatus] = useState<'open' | 'cycling' | 'pressurized'>('pressurized');
  const [reactorPower, setReactorPower] = useState(94);
  const [radarPingResult, setRadarPingResult] = useState<string | null>(null);
  const [stationLogs, setStationLogs] = useState<Record<string, StationLogMessage[]>>({
    station_tech: [
      { id: '1', senderName: 'Nova AI', senderAvatar: '/avatar.png', text: 'Quantum neural compilers operating at 99.98% efficiency.', timestamp: '12m ago' },
      { id: '2', senderName: 'Akshay Kumar', senderAvatar: '/avatar.png', text: 'Welcome to Tech Station deck! Next-gen software protocols active.', timestamp: '5m ago' },
    ],
    station_gaming: [
      { id: '3', senderName: 'Arcade Commander', senderAvatar: '/avatar.png', text: 'High score recorded on Asteroid Dodge: 14,800 pts!', timestamp: '22m ago' },
    ],
  });
  const [logInput, setLogInput] = useState('');
  const [isWarping, setIsWarping] = useState(false);

  // Play quick audio synthesized beep
  const playStationSound = (freq = 600, duration = 0.2) => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_) {}
  };

  const handleDockStation = (st: SpaceStation) => {
    setDockedStation(st);
    setAirlockStatus('pressurized');
    setRadarPingResult(null);
    playStationSound(520, 0.3);
  };

  const handleCycleAirlock = () => {
    setAirlockStatus('cycling');
    playStationSound(300, 0.5);
    setTimeout(() => {
      setAirlockStatus('pressurized');
      playStationSound(780, 0.25);
    }, 1800);
  };

  const handleBoostReactor = () => {
    setReactorPower((prev) => Math.min(100, prev + 2));
    playStationSound(900, 0.2);
  };

  const handleScanRadar = () => {
    playStationSound(640, 0.3);
    const discoveries = [
      '📡 Radar Ping: Intercepted peaceful frequency from Jupiter Sector.',
      '🛸 Radar Ping: Detected 3 cargo vessels in orbital docking pattern.',
      '✨ Radar Ping: Auroral solar flare passing harmlessly through station deflector shields.',
      '🌀 Radar Ping: Micro-wormhole detected 40,000 km off the starboard bow.',
    ];
    setRadarPingResult(discoveries[Math.floor(Math.random() * discoveries.length)]);
  };

  const handlePostStationLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logInput.trim() || !dockedStation) return;

    const newLog: StationLogMessage = {
      id: `log_${Date.now()}`,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: logInput.trim(),
      timestamp: 'Just now',
    };

    setStationLogs((prev) => ({
      ...prev,
      [dockedStation.id]: [...(prev[dockedStation.id] || []), newLog],
    }));
    setLogInput('');
    playStationSound(850, 0.15);
  };

  const handleJumpWormhole = (targetStationId: string) => {
    setIsWarping(true);
    playStationSound(440, 0.6);
    setTimeout(() => {
      const target = stations.find((s) => s.id === targetStationId);
      if (target) {
        setDockedStation(target);
      }
      setIsWarping(false);
      playStationSound(880, 0.3);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-purple-950/70 via-slate-900 to-cyan-950/70 border border-cyan-500/40 shadow-xl overflow-hidden text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-inner">
              <Compass className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black font-heading text-white tracking-wide">
                🪐 INTERSTELLERS SPACE STATIONS
              </h1>
              <p className="text-xs sm:text-sm text-cyan-200/90 font-medium">
                7 Living Orbital Hubs • Interactive Command Decks & Quantum Wormholes
              </p>
            </div>
          </div>
        </div>

        <div className="z-10 flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            All Stations Online
          </span>
        </div>
      </div>

      {/* Grid of Space Stations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {stations.map((station) => (
          <div
            key={station.id}
            onClick={() => handleDockStation(station)}
            className="rounded-3xl border border-cyan-500/30 bg-surface-container-lowest overflow-hidden hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-all flex flex-col justify-between shadow-card group cursor-pointer"
          >
            {/* Station Banner */}
            <div className="h-36 relative overflow-hidden bg-slate-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={station.bannerUrl}
                alt={station.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-black/40 to-transparent" />

              {/* Icon & Title Overlay */}
              <div className="absolute bottom-3 left-4 flex items-center gap-3">
                <span className="text-3xl p-2 rounded-2xl bg-black/60 backdrop-blur-md shadow-md border border-cyan-400/30">
                  {station.icon}
                </span>
                <div>
                  <h3 className="text-base font-black text-white drop-shadow-md">{station.name}</h3>
                  <span className="text-[10px] text-cyan-300 font-mono flex items-center gap-1">
                    <Radio className="w-2.5 h-2.5 animate-pulse text-cyan-400" /> Channel Active
                  </span>
                </div>
              </div>

              {/* Active Wormhole Badge */}
              {station.activeWormhole && (
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold text-[10px] flex items-center gap-1 border border-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.5)] animate-pulse">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>WORMHOLE ACTIVE</span>
                </div>
              )}
            </div>

            {/* Content & Dock Trigger */}
            <div className="p-5 flex flex-col justify-between flex-1 gap-4">
              <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">
                {station.description}
              </p>

              <div className="flex items-center justify-between text-xs pt-3 border-t border-cyan-500/20 text-on-surface-variant">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-semibold text-xs text-cyan-300">
                    <Users className="w-3.5 h-3.5 text-cyan-400" /> {station.membersCount}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-xs text-fuchsia-300">
                    <MessageSquare className="w-3.5 h-3.5 text-fuchsia-400" /> {station.postsCount}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDockStation(station);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-500 hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] text-white font-black text-xs transition-all shadow-md flex items-center gap-1.5 active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Dock Station 🚀</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Station Command Deck Modal */}
      {dockedStation && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-surface-container-low via-surface-container to-surface-container-lowest border border-cyan-500/40 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Command Deck Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-950/80 via-slate-900 to-cyan-950/80 border-b border-white/10 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-xl bg-black/50 border border-white/20">
                  {dockedStation.icon}
                </span>
                <div>
                  <h2 className="font-heading font-black text-lg sm:text-xl text-white flex items-center gap-2">
                    {dockedStation.name} • COMMAND DECK
                  </h2>
                  <p className="text-xs text-cyan-200 font-medium">
                    {dockedStation.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDockedStation(null)}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all"
                title="Undock & Close Deck"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Deck Telemetry & Modules Body */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              
              {/* Telemetry Dials Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-surface-container border border-outline-variant/40 space-y-1">
                  <p className="text-[10px] text-on-surface-variant font-mono uppercase font-bold">Deflector Shields</p>
                  <p className="text-base font-heading font-black text-emerald-400">100% Stable</p>
                </div>

                <div className="p-3 rounded-2xl bg-surface-container border border-outline-variant/40 space-y-1">
                  <p className="text-[10px] text-on-surface-variant font-mono uppercase font-bold">Plasma Reactor</p>
                  <p className="text-base font-heading font-black text-cyan-400 tabular-nums">{reactorPower}% Power</p>
                </div>

                <div className="p-3 rounded-2xl bg-surface-container border border-outline-variant/40 space-y-1">
                  <p className="text-[10px] text-on-surface-variant font-mono uppercase font-bold">Atmosphere</p>
                  <p className="text-base font-heading font-black text-purple-400">99.8% O₂ / 1.0G</p>
                </div>

                <div className="p-3 rounded-2xl bg-surface-container border border-outline-variant/40 space-y-1">
                  <p className="text-[10px] text-on-surface-variant font-mono uppercase font-bold">Airlock Status</p>
                  <p className="text-base font-heading font-black text-amber-400 capitalize">
                    {airlockStatus}
                  </p>
                </div>
              </div>

              {/* Interactive Module Operations */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Cycle Airlock Button */}
                <button
                  type="button"
                  onClick={handleCycleAirlock}
                  disabled={airlockStatus === 'cycling'}
                  className="p-3.5 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-left transition-all group active:scale-95"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Orbit className="w-5 h-5 text-amber-400 group-hover:rotate-180 transition-transform duration-700" />
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                      {airlockStatus === 'cycling' ? 'Cycling...' : 'Pressure Lock'}
                    </span>
                  </div>
                  <h4 className="font-heading font-bold text-xs text-on-surface">Cycle Airlock Chamber</h4>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Pressurize or decompress orbital bay</p>
                </button>

                {/* Boost Reactor Button */}
                <button
                  type="button"
                  onClick={handleBoostReactor}
                  className="p-3.5 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-left transition-all group active:scale-95"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Zap className="w-5 h-5 text-cyan-400 group-hover:scale-125 transition-transform" />
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                      Inject Plasma
                    </span>
                  </div>
                  <h4 className="font-heading font-bold text-xs text-on-surface">Supercharge Reactor</h4>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Pump core plasma energy (+2% boost)</p>
                </button>

                {/* Scan Long-Range Radar */}
                <button
                  type="button"
                  onClick={handleScanRadar}
                  className="p-3.5 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-left transition-all group active:scale-95"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Radio className="w-5 h-5 text-purple-400 group-hover:animate-ping" />
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                      Ping Radar
                    </span>
                  </div>
                  <h4 className="font-heading font-bold text-xs text-on-surface">Scan Deep Radar</h4>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Detect nearby celestial anomalies</p>
                </button>
              </div>

              {/* Radar Scan Result Banner */}
              {radarPingResult && (
                <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-400/40 text-xs text-cyan-200 font-mono flex items-center gap-2 animate-in fade-in">
                  <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>{radarPingResult}</span>
                </div>
              )}

              {/* Active Wormhole Teleport Bay */}
              {dockedStation.activeWormhole && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-purple-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      QUANTUM WORMHOLE GATE ACTIVE
                    </span>
                    <h4 className="font-heading font-black text-sm text-white">
                      Direct Teleport to {dockedStation.activeWormhole.connectedStationName}
                    </h4>
                    <p className="text-xs text-slate-300">
                      Zero-latency jump across lightyears. Gateway collapses in {dockedStation.activeWormhole.endsAt}.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleJumpWormhole(dockedStation.activeWormhole!.connectedStationId)}
                    disabled={isWarping}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black text-xs transition-all shadow-lg shadow-purple-500/30 flex items-center gap-2 shrink-0 active:scale-95"
                  >
                    <span>{isWarping ? 'Warping Spacetime...' : 'Jump Through Wormhole 🌀'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Station Transmission Logs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-bold text-xs text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-primary" />
                    <span>Station Frequency Log // Live Chatter</span>
                  </h4>
                  <span className="text-[10px] text-on-surface-variant font-mono">Channel: 142.8 MHz</span>
                </div>

                <div className="h-40 overflow-y-auto p-3 rounded-2xl bg-surface-container border border-outline-variant/40 space-y-2.5 custom-scrollbar">
                  {(stationLogs[dockedStation.id] || []).length === 0 ? (
                    <p className="text-xs text-on-surface-variant text-center py-6">
                      No logs recorded yet. Be the first to broadcast on this station deck!
                    </p>
                  ) : (
                    (stationLogs[dockedStation.id] || []).map((msg) => (
                      <div key={msg.id} className="p-2.5 rounded-xl bg-surface-container-high/60 border border-outline-variant/30 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-primary">{msg.senderName}</span>
                          <span className="text-[10px] text-on-surface-variant font-mono">{msg.timestamp}</span>
                        </div>
                        <p className="text-on-surface leading-snug">{msg.text}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Broadcast Form */}
                <form onSubmit={handlePostStationLog} className="flex gap-2">
                  <input
                    type="text"
                    value={logInput}
                    onChange={(e) => setLogInput(e.target.value)}
                    placeholder={`Transmit log message to ${dockedStation.name}...`}
                    className="flex-1 bg-surface-container rounded-xl px-4 py-2 text-xs text-on-surface outline-none border border-outline-variant/40 focus:border-primary"
                  />
                  <button
                    type="submit"
                    disabled={!logInput.trim()}
                    className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-xs disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Broadcast</span>
                  </button>
                </form>
              </div>

            </div>

            {/* Deck Footer */}
            <div className="p-4 bg-surface-container border-t border-outline-variant/40 flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Docked & Synchronized
              </span>

              <button
                type="button"
                onClick={() => setDockedStation(null)}
                className="px-5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-xs border border-outline-variant/40 transition-all"
              >
                Undock & Return to Orbit
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
