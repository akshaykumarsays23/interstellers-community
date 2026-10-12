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
import { NovaVoiceModal } from '@/components/ai/NovaVoiceModal';
import { GalaxyTelescopeModal } from '@/components/common/GalaxyTelescopeModal';
import { TimeCapsuleModal } from '@/components/common/TimeCapsuleModal';
import { UserProfileModal } from '@/components/common/UserProfileModal';

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
  const [isTelescopeOpen, setIsTelescopeOpen] = React.useState<boolean>(false);
  const [isCapsuleOpen, setIsCapsuleOpen] = React.useState<boolean>(false);

  if (!isAuthenticated) {
    return <AuthLandingView />;
  }

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col antialiased relative selection:bg-cyan-500 selection:text-white">
      {/* Cockpit Bridge Ambient Nebula Glows */}
      <div className="fixed top-0 left-1/4 w-[550px] h-[300px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-1/4 w-[500px] h-[350px] bg-purple-600/12 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-1/3 w-[600px] h-[300px] bg-pink-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="flex-1 flex h-screen overflow-hidden">
        {/* Docked Sidebar (Desktop) */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
          <TopHeader
            title={title}
            subtitle={subtitle}
            onNewPostClick={onNewPostClick}
            onTelescopeClick={() => setIsTelescopeOpen(true)}
            onCapsuleClick={() => setIsCapsuleOpen(true)}
          />

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

      {/* Nova AI Voice Mode Overlay (ChatGPT & Gemini Live Style) */}
      <NovaVoiceModal />

      {/* Share / Invite Friends Modal */}
      <ShareModal />

      {/* Member Approvals Queue Modal (for Akshay) */}
      <ApprovalsModal />

      {/* Galaxy Telescope Scanner Modal */}
      <GalaxyTelescopeModal isOpen={isTelescopeOpen} onClose={() => setIsTelescopeOpen(false)} />

      {/* Time Capsule Future Transmission Modal */}
      <TimeCapsuleModal isOpen={isCapsuleOpen} onClose={() => setIsCapsuleOpen(false)} />

      {/* Full User Profile & Lightbox Zoom Modal */}
      <UserProfileModal />
    </div>
  );
};
