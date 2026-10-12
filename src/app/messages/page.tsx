'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { MessagesDashboard } from '@/components/messages/MessagesDashboard';

export default function MessagesPage() {
  return (
    <AppShell title="Fellows" subtitle="Cosmic Fellow Connections • 15 Questions Protocol • Real-Time Chat">
      <MessagesDashboard />
    </AppShell>
  );
}
