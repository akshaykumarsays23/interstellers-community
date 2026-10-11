'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import {
  ShieldCheck,
  Check,
  X,
  UserCheck,
  Clock,
  Mail,
  UserPlus,
  Sparkles,
} from 'lucide-react';

export const ApprovalsModal: React.FC = () => {
  const {
    isApprovalsModalOpen,
    setIsApprovalsModalOpen,
    registrationRequests,
    approveRegistration,
    rejectRegistration,
    registerNewUser,
    activeDevicesCount,
    totalDevicesCount,
  } = useApp();

  if (!isApprovalsModalOpen) return null;

  const pendingRequests = registrationRequests.filter((r) => r.status === 'pending');
  const approvedRequests = registrationRequests.filter((r) => r.status === 'approved');

  const handleSimulateFriend = () => {
    const names = ['Rohan Sharma', 'Ananya Patel', 'Vikram Sethi', 'Pooja Verma'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomEmail = `${randomName.toLowerCase().replace(/\s+/g, '')}${Math.floor(Math.random() * 90 + 10)}@gmail.com`;
    registerNewUser(randomName, randomEmail);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary text-on-primary shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-lg text-on-surface">
                  Host Approvals Queue
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary text-on-primary">
                  {pendingRequests.length} Pending
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{activeDevicesCount} Active Devices</span>
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Managed by Host Admin (Akshay) • {totalDevicesCount} total registered device(s)
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsApprovalsModalOpen(false)}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice */}
        <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/40 text-xs text-on-surface-variant flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="leading-tight">
            New users who register with Gmail are held in the waiting lobby until you approve their access. Approved members can immediately log in and explore.
          </p>
        </div>

        {/* Pending Requests List */}
        <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
          {pendingRequests.length === 0 ? (
            <div className="py-8 text-center bg-surface-container-low/50 rounded-xl border border-outline-variant/40 space-y-2">
              <UserCheck className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold text-on-surface">All caught up!</p>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                No users are currently waiting in the approval queue. New registrations from friends will appear here.
              </p>
            </div>
          ) : (
            pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-xs hover:shadow-card transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={req.avatar} name={req.name} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-semibold text-xs sm:text-sm text-on-surface truncate">
                        {req.name}
                      </h4>
                      <Badge variant="primary" size="sm">
                        Waiting
                      </Badge>
                    </div>
                    <p className="text-xs text-on-surface-variant flex items-center gap-1 truncate mt-0.5">
                      <Mail className="w-3 h-3 text-primary" />
                      <span>{req.email}</span>
                      {req.timestamp && <span className="text-[10px] text-slate-400 ml-1">• {req.timestamp}</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => approveRegistration(req.id)}
                    className="flex items-center gap-1 bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs transition-colors"
                    title="Approve and grant access"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => rejectRegistration(req.id)}
                    className="p-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-error rounded-xl transition-colors"
                    title="Decline access"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recently Approved History */}
        {approvedRequests.length > 0 && (
          <div className="pt-2 border-t border-outline-variant/30">
            <h4 className="text-xs font-semibold text-on-surface-variant mb-2">
              Approved Platform Members ({approvedRequests.length})
            </h4>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto custom-scrollbar">
              {approvedRequests.map((req) => (
                <div
                  key={req.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs border border-emerald-500/20"
                  title={req.email}
                >
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="font-semibold">{req.name}</span>
                  <span className="text-[10px] opacity-75">({req.email})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between">
          <button
            onClick={handleSimulateFriend}
            className="flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Simulate friend registration</span>
          </button>

          <button
            onClick={() => setIsApprovalsModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
