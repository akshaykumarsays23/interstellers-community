'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { SpaceHouseView } from '@/components/groups/SpaceHouseView';

export default function GroupsPage() {
  return (
    <AppShell title="Space House" subtitle="4 Multiverse Houses • 1 House for 1 Month • Compete & Chat">
      <SpaceHouseView />
    </AppShell>
  );
}
