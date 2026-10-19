'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
  showStatus?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-24 h-24 text-2xl',
};

const statusClasses = {
  online: 'bg-online',
  offline: 'bg-surface-dim',
  away: 'bg-amber-500',
  busy: 'bg-error',
};

const statusSizeClasses = {
  xs: 'w-1.5 h-1.5 border',
  sm: 'w-2 h-2 border',
  md: 'w-2.5 h-2.5 border-[1.5px]',
  lg: 'w-3 h-3 border-2',
  xl: 'w-3.5 h-3.5 border-2',
  '2xl': 'w-5 h-5 border-[3px]',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'User',
  size = 'md',
  status,
  showStatus = false,
  className,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      <div
        className={cn(
          'relative rounded-full overflow-hidden flex items-center justify-center font-semibold text-primary bg-surface-container-high border border-outline-variant/40 shadow-xs',
          sizeClasses[size]
        )}
      >
        {src && !imageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {showStatus && status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-surface',
            statusClasses[status],
            statusSizeClasses[size]
          )}
          title={`Status: ${status}`}
        />
      )}
    </div>
  );
};
