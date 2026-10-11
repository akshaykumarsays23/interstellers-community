'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ArcadeDashboard } from '@/components/arcade/ArcadeDashboard';

export default function ArcadePage() {
  return (
    <AppShell
      title="🎮 INTERSTELLERS ARCADE"
      subtitle="Play 5 cosmic mini-games, compete on leaderboards, complete flight missions & earn Star Credits"
    >
      <ArcadeDashboard />
    </AppShell>
  );
}
