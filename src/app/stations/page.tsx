'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { SpaceStationsView } from '@/components/stations/SpaceStationsView';
import { StationsAccessGate } from '@/components/stations/StationsAccessGate';

export default function StationsPage() {
  return (
    <AppShell
      title="🪐 SPACE STATIONS"
      subtitle="Themed community hubs and cross-station Wormhole discoveries"
    >
      <StationsAccessGate>
        <SpaceStationsView />
      </StationsAccessGate>
    </AppShell>
  );
}
