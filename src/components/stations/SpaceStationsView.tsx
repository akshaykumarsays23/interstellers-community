'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { Compass, Sparkles, Users, MessageSquare } from 'lucide-react';

export const SpaceStationsView: React.FC = () => {
  const { stations } = useApp();

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-on-surface flex items-center gap-2">
            <Compass className="w-6 h-6 text-primary" />
            🪐 INTERSTELLERS SPACE STATIONS
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant">Themed community hubs and cross-station Wormholes across the network</p>
        </div>
      </div>

      {/* Grid of 7 Space Stations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {stations.map((station) => (
          <div
            key={station.id}
            className="rounded-3xl border border-outline-variant/60 bg-surface-container overflow-hidden hover:border-primary/50 transition-all flex flex-col justify-between shadow-sm group"
          >
            {/* Station Banner */}
            <div className="h-32 relative overflow-hidden bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={station.bannerUrl}
                alt={station.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-black/30" />

              {/* Icon & Title Overlay */}
              <div className="absolute bottom-3 left-4 flex items-center gap-3">
                <span className="text-3xl p-2 rounded-2xl bg-surface-bright/90 backdrop-blur-md shadow-md border border-white/20">
                  {station.icon}
                </span>
                <h3 className="text-lg font-bold text-white drop-shadow-md">{station.name}</h3>
              </div>

              {/* Active Wormhole Badge if present */}
              {station.activeWormhole && (
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-purple-600/90 text-white font-extrabold text-[10px] flex items-center gap-1 border border-purple-300 shadow-md animate-pulse">
                  <Sparkles className="w-3 h-3" /> 🌀 WORMHOLE ACTIVE: {station.activeWormhole.connectedStationName}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col justify-between flex-1 gap-4">
              <p className="text-xs text-on-surface-variant leading-relaxed">{station.description}</p>

              <div className="flex items-center justify-between text-xs pt-3 border-t border-outline-variant/40 text-on-surface-variant">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-semibold">
                    <Users className="w-3.5 h-3.5 text-social-blue" /> {station.membersCount}
                  </span>
                  <span className="flex items-center gap-1 font-semibold">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> {station.postsCount}
                  </span>
                </div>

                <button className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-hover transition-all shadow-xs">
                  Dock Station 🚀
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
