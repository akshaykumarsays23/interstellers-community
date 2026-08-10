'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { MessagesDashboard } from '@/components/messages/MessagesDashboard';

export default function MessagesPage() {
  return (
    <AppShell title="Direct Messages" subtitle="Encrypted real-time communications">
      <MessagesDashboard />
    </AppShell>
  );
}
