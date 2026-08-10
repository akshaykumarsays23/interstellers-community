'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { GroupChatHub } from '@/components/groups/GroupChatHub';

export default function GroupsPage() {
  return (
    <AppShell title="Group Chat Hub" subtitle="Collaborative team spaces and topic streams">
      <GroupChatHub />
    </AppShell>
  );
}
