'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { SettingsView } from '@/components/settings/SettingsView';

export default function SettingsPage() {
  return (
    <AppShell title="Preferences" subtitle="Custom profile and galaxy options">
      <SettingsView />
    </AppShell>
  );
}
