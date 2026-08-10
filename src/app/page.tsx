'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { FeedView } from '@/components/feed/FeedView';

export default function HomePage() {
  return (
    <AppShell
      title="Galaxy Feed"
      subtitle="Discover community discussions, release notes, and space insights"
    >
      <FeedView />
    </AppShell>
  );
}
