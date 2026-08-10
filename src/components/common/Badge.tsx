'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'error' | 'surface' | 'cosmic';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'surface',
  size = 'sm',
  className,
}) => {
  const variantClasses = {
    primary: 'bg-primary-container text-on-primary-container',
    secondary: 'bg-secondary-container text-on-secondary-container',
    outline: 'border border-outline-variant text-on-surface-variant bg-transparent',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    error: 'bg-error-container text-on-error-container',
    surface: 'bg-surface-container-high text-on-surface-variant',
    cosmic: 'bg-gradient-to-r from-primary/15 to-social-blue/15 text-primary border border-primary/20',
  };

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 rounded-full font-medium',
    md: 'text-sm px-3 py-1 rounded-full font-semibold',
  };

  return (
    <span className={cn('inline-flex items-center gap-1 leading-none', variantClasses[variant], sizeClasses[size], className)}>
      {children}
    </span>
  );
};
