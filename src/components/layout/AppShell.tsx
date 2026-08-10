'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { MobileNav } from './MobileNav';
import { AIAssistantPanel } from '@/components/ai/AIAssistantPanel';
import { CallModal } from '@/components/common/CallModal';
import { ShareModal } from '@/components/common/ShareModal';
import { ApprovalsModal } from '@/components/common/ApprovalsModal';
import { AuthLandingView } from '@/components/auth/AuthLandingView';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onNewPostClick?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  title,
  subtitle,
  onNewPostClick,
}) => {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <AuthLandingView />;
  }

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col antialiased">
      <div className="flex-1 flex h-screen overflow-hidden">
        {/* Docked Sidebar (Desktop) */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
          <TopHeader title={title} subtitle={subtitle} onNewPostClick={onNewPostClick} />

          {/* Dynamic Route Canvas */}
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0 custom-scrollbar bg-background">
            {children}
          </main>
        </div>

        {/* Right Collapsible AI Assistant Panel */}
        <AIAssistantPanel />
      </div>

      {/* Floating Bottom Navigation (Mobile Only) */}
      <MobileNav />

      {/* Active Audio/Video Call Overlay */}
      <CallModal />

      {/* Share / Invite Friends Modal */}
      <ShareModal />

      {/* Member Approvals Queue Modal (for Akshay) */}
      <ApprovalsModal />
    </div>
  );
};
