'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { FriendsDirectory } from '@/components/friends/FriendsDirectory';

export default function FriendsPage() {
  return (
    <AppShell title="Connections & Directory" subtitle="Explore and manage your interplanetary network">
      <FriendsDirectory />
    </AppShell>
  );
}
