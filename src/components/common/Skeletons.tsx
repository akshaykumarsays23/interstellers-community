'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// ── Base shimmer block ───────────────────────────────────────────────────────
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      // Light mode: soft lavender shimmer
      'rounded-lg bg-gradient-to-r from-surface-container-low via-surface-container-high to-surface-container-low',
      'bg-[length:200%_100%] animate-pulse',
      // Dark mode: deep cosmic shimmer with neon tint
      'dark:from-[rgba(9,16,40,0.8)] dark:via-[rgba(20,30,65,0.95)] dark:to-[rgba(9,16,40,0.8)]',
      // Respect reduced motion
      'motion-reduce:animate-none motion-reduce:opacity-70',
      className,
    )}
    aria-hidden="true"
    role="presentation"
  />
);

// ── Post card skeleton ───────────────────────────────────────────────────────
export const PostCardSkeleton: React.FC = () => (
  <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-5 sm:p-6 mb-6 shadow-card overflow-hidden">
    {/* Header */}
    <div className="flex items-center gap-3 mb-4">
      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-2.5 w-48" />
      </div>
      <Skeleton className="h-6 w-14 rounded-full" />
    </div>

    {/* Body lines */}
    <div className="space-y-2 mb-4">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="h-3 w-3/4" />
    </div>

    {/* Optional media placeholder */}
    <Skeleton className="h-48 w-full rounded-xl mb-4" />

    {/* Action bar */}
    <div className="flex items-center gap-3 pt-3 border-t border-outline-variant/30">
      <Skeleton className="h-7 w-16 rounded-lg" />
      <Skeleton className="h-7 w-16 rounded-lg" />
      <Skeleton className="h-7 w-16 rounded-lg" />
      <Skeleton className="h-7 w-7 rounded-lg ml-auto" />
    </div>
  </div>
);

// ── Feed skeleton (multiple cards) ───────────────────────────────────────────
export const FeedSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div>
    {Array.from({ length: count }).map((_, i) => (
      <PostCardSkeleton key={i} />
    ))}
  </div>
);

// ── Profile card skeleton ────────────────────────────────────────────────────
export const ProfileCardSkeleton: React.FC = () => (
  <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-5 shadow-card">
    <div className="flex items-center gap-3 mb-4">
      <Skeleton className="w-14 h-14 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-36" />
      </div>
    </div>
    <Skeleton className="h-3 w-full mb-2" />
    <Skeleton className="h-3 w-4/5 mb-4" />
    <div className="flex gap-2">
      <Skeleton className="h-8 flex-1 rounded-xl" />
      <Skeleton className="h-8 flex-1 rounded-xl" />
    </div>
  </div>
);

// ── Chat thread skeleton ─────────────────────────────────────────────────────
export const ChatThreadSkeleton: React.FC = () => (
  <div className="flex items-center gap-3 p-3.5 border-b border-outline-variant/30">
    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="flex justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-2.5 w-12" />
      </div>
      <Skeleton className="h-2.5 w-40" />
    </div>
  </div>
);

// ── Message bubble skeleton ──────────────────────────────────────────────────
export const MessageSkeleton: React.FC<{ isSender?: boolean }> = ({ isSender = false }) => (
  <div className={cn('flex items-end gap-2.5 max-w-[75%]', isSender ? 'self-end flex-row-reverse' : 'self-start')}>
    {!isSender && <Skeleton className="w-7 h-7 rounded-full shrink-0 mb-1" />}
    <div className="space-y-1.5">
      <Skeleton className={cn('h-10 rounded-2xl', isSender ? 'rounded-br-none w-40' : 'rounded-bl-none w-52')} />
      <Skeleton className="h-2 w-16" />
    </div>
  </div>
);

// ── Message stream skeleton (a natural conversation shape) ───────────────────
export const MessageStreamSkeleton: React.FC = () => (
  <div className="flex flex-col gap-4 p-4">
    <MessageSkeleton isSender={false} />
    <MessageSkeleton isSender={true} />
    <MessageSkeleton isSender={false} />
    <MessageSkeleton isSender={true} />
    <MessageSkeleton isSender={false} />
  </div>
);

// ── Trending panel skeleton ──────────────────────────────────────────────────
export const TrendingPanelSkeleton: React.FC = () => (
  <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-4 shadow-card">
    <Skeleton className="h-4 w-28 mb-4" />
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-2 w-14" />
          </div>
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

// ── Moments row skeleton ─────────────────────────────────────────────────────
export const MomentsRowSkeleton: React.FC = () => (
  <div className="flex items-center gap-3 overflow-hidden pb-2 px-1 mb-4">
    {Array.from({ length: 7 }).map((_, i) => (
      <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
        <Skeleton className="w-12 h-12 rounded-full" />
        <Skeleton className="h-2.5 w-10" />
      </div>
    ))}
  </div>
);

// ── Online travelers widget skeleton ─────────────────────────────────────────
export const OnlineWidgetSkeleton: React.FC = () => (
  <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-4 shadow-card mb-4">
    <div className="flex items-center justify-between mb-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2.5 p-1.5">
          <Skeleton className="w-7 h-7 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-2 w-14" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
