'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import {
  Compass,
  Radio,
  Zap,
  Gamepad2,
  Clock,
  Award,
  Globe2,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Volume2,
  Play,
  Pause,
} from 'lucide-react';

export const GalacticRadarPanel: React.FC = () => {
  const { currentUser, posts, activeDevicesCount, totalDevicesCount } = useApp();
  const [orbitSpeed, setOrbitSpeed] = useState<number>(27640);
  const [solarIndex, setSolarIndex] = useState<number>(4.2);

  useEffect(() => {
    const interval = setInterval(() => {
      setOrbitSpeed(27640 + Math.floor(Math.random() * 40 - 20));
      setSolarIndex(Number((4.2 + (Math.random() * 0.4 - 0.2)).toFixed(1)));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {/* 1. Space Traveler Flight Telemetry Card */}
      <div className="bg-surface-container-lowest/80 rounded-2xl border border-outline-variant/60 p-4 shadow-card backdrop-blur-md">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-outline-variant/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-xs text-on-surface uppercase tracking-wider">
                Galactic Telemetry
              </h3>
              <p className="text-[10px] text-on-surface-variant">Real-time Station Orbit</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            LIVE LINK
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-surface-container/60 p-2.5 rounded-xl border border-outline-variant/30">
            <div className="flex items-center justify-between text-[10px] text-on-surface-variant mb-1">
              <span>Orbit Speed</span>
              <Globe2 className="w-3 h-3 text-cyan-400" />
            </div>
            <p className="font-mono text-sm font-bold text-on-surface">
              {orbitSpeed.toLocaleString()} <span className="text-[9px] text-on-surface-variant font-normal">km/h</span>
            </p>
          </div>

          <div className="bg-surface-container/60 p-2.5 rounded-xl border border-outline-variant/30">
            <div className="flex items-center justify-between text-[10px] text-on-surface-variant mb-1">
              <span>Solar Index</span>
              <Zap className="w-3 h-3 text-amber-400" />
            </div>
            <p className="font-mono text-sm font-bold text-amber-400">
              {solarIndex} <span className="text-[9px] text-on-surface-variant font-normal">KP</span>
            </p>
          </div>
        </div>

        {/* Live Active Explorers Online Badge */}
        <div className="flex items-center justify-between bg-primary/10 border border-primary/20 p-2.5 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="font-medium text-on-surface">Explorers Online</span>
          </div>
          <span className="font-mono font-bold text-primary">
            {activeDevicesCount || 1} / {totalDevicesCount || 1}
          </span>
        </div>
      </div>

      {/* 2. Quick Command Shortcuts */}
      <div className="bg-surface-container-lowest/80 rounded-2xl border border-outline-variant/60 p-4 shadow-card backdrop-blur-md">
        <h3 className="font-heading font-bold text-xs text-on-surface uppercase tracking-wider mb-3 px-1">
          Space Hub Direct Access
        </h3>

        <div className="space-y-1.5">
          <Link
            href="/arcade"
            className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container/40 hover:bg-surface-container-high/80 border border-outline-variant/30 text-on-surface transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                <Gamepad2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold">Galactic Arcade</p>
                <p className="text-[10px] text-on-surface-variant">Cosmic Quiz & Star Games</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/stations"
            className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container/40 hover:bg-surface-container-high/80 border border-outline-variant/30 text-on-surface transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold">Space Stations</p>
                <p className="text-[10px] text-on-surface-variant">Explore Outposts & Hubs</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/onemonth"
            className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container/40 hover:bg-surface-container-high/80 border border-outline-variant/30 text-on-surface transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold">Mission Timeline</p>
                <p className="text-[10px] text-on-surface-variant">30-Day Launch Progress</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* 3. Community Flight Status Banner */}
      <div className="bg-gradient-to-br from-purple-900/40 via-indigo-950/60 to-slate-900/80 rounded-2xl border border-purple-500/30 p-4 shadow-lg text-white backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-2 text-purple-300 text-xs font-semibold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interstellers Status</span>
        </div>
        <h4 className="font-heading font-bold text-sm text-white mb-1">
          Galaxy Feed Active
        </h4>
        <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
          All systems nominal. {posts.length} transmission logs recorded across deep space channels.
        </p>
        <div className="flex items-center gap-2 text-[10px] font-mono text-purple-200 bg-purple-500/20 px-2.5 py-1 rounded-lg border border-purple-500/30 w-fit">
          <span>HOST: AKSHAY KUMAR</span>
        </div>
      </div>
    </div>
  );
};
