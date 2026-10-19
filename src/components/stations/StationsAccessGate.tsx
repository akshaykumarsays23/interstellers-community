'use client';

import React from 'react';
import { LockKeyhole, Radio } from 'lucide-react';

interface StationsAccessGateProps {
  children: React.ReactNode;
}

export const StationsAccessGate: React.FC<StationsAccessGateProps> = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = React.useState<boolean | null>(null);
  const [pin, setPin] = React.useState('');
  const [error, setError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    fetch('/api/stations/access', { cache: 'no-store' })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) {
          throw new Error(body.error || 'Unable to verify Space Stations access');
        }
        if (isMounted) setIsUnlocked(body.unlocked === true);
      })
      .catch((requestError: unknown) => {
        if (isMounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Unable to verify Space Stations access'
          );
          setIsUnlocked(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/stations/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error || 'Unable to unlock Space Stations');
      }
      setIsUnlocked(body.unlocked === true);
      setPin('');
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to unlock Space Stations'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUnlocked === true) return <>{children}</>;

  return (
    <section className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-cyan-500/25 bg-surface-container-low p-8 text-center shadow-[0_0_35px_rgba(0,240,255,0.08)]">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
          {isUnlocked === null ? (
            <Radio className="h-7 w-7 animate-pulse" />
          ) : (
            <LockKeyhole className="h-7 w-7" />
          )}
        </div>
        <h2 className="mb-2 text-xl font-bold text-on-surface">Space Stations Locked</h2>
        <p className="mb-6 text-sm text-on-surface-variant">
          Enter the access PIN to open the Space Stations.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="stations-pin" className="sr-only">
            Space Stations PIN
          </label>
          <input
            id="stations-pin"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={32}
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            placeholder="Enter PIN"
            disabled={isUnlocked === null || isSubmitting}
            className="w-full rounded-xl border border-cyan-500/25 bg-background px-4 py-3 text-center tracking-[0.35em] text-on-surface outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            disabled={isUnlocked === null || isSubmitting || pin.length === 0}
            className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-bold text-slate-950 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Checking PIN…' : 'Unlock Stations'}
          </button>
        </form>
        {error && (
          <p role="alert" className="mt-4 text-sm text-red-400">
            {error}
          </p>
        )}
      </div>
    </section>
  );
};
