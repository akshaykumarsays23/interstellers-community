'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { SpaceStationsView } from '@/components/stations/SpaceStationsView';

export default function StationsPage() {
  return (
    <AppShell
      title="🪐 SPACE STATIONS"
      subtitle="Themed community hubs and cross-station Wormhole discoveries"
    >
      <SpaceStationsView />
    </AppShell>
  );
}
