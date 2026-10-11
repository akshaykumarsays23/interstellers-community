'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '@/lib/store';

interface MusicContextType {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isRepeat: boolean;
  autoplayBlocked: boolean;
  userPlayCount: number;
  totalPlayCount: number;
  togglePlay: () => void;
  playSong: () => void;
  pauseSong: () => void;
  restartSong: () => void;
  seekMusic: (time: number) => void;
  updateVolume: (vol: number) => void;
  increaseVolume: () => void;
  decreaseVolume: () => void;
  toggleRepeat: () => void;
  formatTime: (seconds: number) => string;
  recordSongPlay: () => Promise<void>;
  refreshMusicStats: () => Promise<void>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useApp();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [autoplayBlocked, setAutoplayBlocked] = useState<boolean>(false);

  // Extract a unique, consistent key for the current active user
  const userKey = (currentUser?.email || currentUser?.id || 'guest').toLowerCase().trim();

  // Personal play count for the current user
  const [userPlayCount, setUserPlayCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`interstellers_user_plays_${userKey}`);
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 0) return parsed;
      }
    }
    return 0;
  });

  // Global community play count across all users
  const [totalPlayCount, setTotalPlayCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('interstellers_total_song_plays');
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 0) return parsed;
      }
    }
    return 24;
  });

  // Track if current play session has already been counted (milestone: 5 seconds)
  const hasCountedCurrentPlayback = useRef<boolean>(false);

  // Volume state (default 75%)
  const [volume, setVolume] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('interstellers_player_volume');
      if (saved !== null) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) return parsed;
      }
    }
    return 0.75;
  });

  // Repeat setting (default TRUE so song loops continuously)
  const [isRepeat, setIsRepeat] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('interstellers_player_repeat');
      if (saved !== null) return saved === 'true';
    }
    return true;
  });

  // Synchronize stats from backend
  const refreshMusicStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/music/stats?user=${encodeURIComponent(userKey)}`);
      if (res.ok) {
        const data = await res.json();
        if (typeof data.userPlays === 'number') {
          setUserPlayCount(data.userPlays);
          try {
            localStorage.setItem(`interstellers_user_plays_${userKey}`, data.userPlays.toString());
          } catch (_) {}
        }
        if (typeof data.totalPlays === 'number') {
          setTotalPlayCount(data.totalPlays);
          try {
            localStorage.setItem('interstellers_total_song_plays', data.totalPlays.toString());
          } catch (_) {}
        }
      }
    } catch (e) {
      console.warn('[Music] Error fetching stats:', e);
    }
  }, [userKey]);

  // When active user identity changes (login, switch account, guest), reload user-specific stats
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`interstellers_user_plays_${userKey}`);
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 0) {
          setUserPlayCount(parsed);
        } else {
          setUserPlayCount(0);
        }
      } else {
        setUserPlayCount(0);
      }
    }
    refreshMusicStats();
  }, [userKey, refreshMusicStats]);

  // Record a play (optimistic local update + server sync)
  const recordSongPlay = useCallback(async () => {
    // 1. Optimistic local updates
    setUserPlayCount((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem(`interstellers_user_plays_${userKey}`, next.toString());
      } catch (_) {}
      return next;
    });

    setTotalPlayCount((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem('interstellers_total_song_plays', next.toString());
      } catch (_) {}
      return next;
    });

    // 2. Sync with backend API
    try {
      const res = await fetch('/api/music/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: userKey }),
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.userPlays === 'number') setUserPlayCount(data.userPlays);
        if (typeof data.totalPlays === 'number') setTotalPlayCount(data.totalPlays);
      }
    } catch (err) {
      console.warn('[Music] Failed to sync play count with server:', err);
    }
  }, [userKey]);

  // Synchronize volume
  const updateVolume = useCallback((newVol: number) => {
    const clamped = Math.max(0, Math.min(1, Math.round(newVol * 100) / 100));
    setVolume(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    try {
      localStorage.setItem('interstellers_player_volume', clamped.toString());
    } catch (_) {}
  }, []);

  const increaseVolume = useCallback(() => {
    updateVolume(Math.min(1, volume + 0.1));
  }, [updateVolume, volume]);

  const decreaseVolume = useCallback(() => {
    updateVolume(Math.max(0, volume - 0.1));
  }, [updateVolume, volume]);

  const toggleRepeat = useCallback(() => {
    const nextRepeat = !isRepeat;
    setIsRepeat(nextRepeat);
    if (audioRef.current) {
      audioRef.current.loop = nextRepeat;
    }
    try {
      localStorage.setItem('interstellers_player_repeat', nextRepeat.toString());
    } catch (_) {}
  }, [isRepeat]);

  const playSong = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.play()
      .then(() => {
        setIsPlaying(true);
        setAutoplayBlocked(false);
      })
      .catch(() => {
        setAutoplayBlocked(true);
      });
  }, []);

  const pauseSong = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pauseSong();
    } else {
      playSong();
    }
  }, [isPlaying, pauseSong, playSong]);

  const restartSong = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    hasCountedCurrentPlayback.current = false;
    audio.play().then(() => setIsPlaying(true)).catch(() => {});
  }, []);

  const seekMusic = useCallback((targetTime: number) => {
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
    // Rewind back before 3s resets count eligibility for next play milestone
    if (targetTime < 3) {
      hasCountedCurrentPlayback.current = false;
    }
  }, []);

  const formatTime = useCallback((seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }, []);

  // Persistent Autoplay on website open
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.loop = isRepeat;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        })
        .catch(() => {
          setAutoplayBlocked(true);

          const triggerAutoPlay = () => {
            if (audioRef.current) {
              audioRef.current.play()
                .then(() => {
                  setIsPlaying(true);
                  setAutoplayBlocked(false);
                })
                .catch(() => {});
            }
            cleanup();
          };

          const cleanup = () => {
            window.removeEventListener('pointerdown', triggerAutoPlay);
            window.removeEventListener('click', triggerAutoPlay);
            window.removeEventListener('keydown', triggerAutoPlay);
            window.removeEventListener('touchstart', triggerAutoPlay);
            window.removeEventListener('scroll', triggerAutoPlay);
            window.removeEventListener('mousemove', triggerAutoPlay);
            window.removeEventListener('focus', triggerAutoPlay);
          };

          window.addEventListener('pointerdown', triggerAutoPlay, { once: true, passive: true });
          window.addEventListener('click', triggerAutoPlay, { once: true });
          window.addEventListener('keydown', triggerAutoPlay, { once: true });
          window.addEventListener('touchstart', triggerAutoPlay, { once: true, passive: true });
          window.addEventListener('scroll', triggerAutoPlay, { once: true, passive: true });
          window.addEventListener('mousemove', triggerAutoPlay, { once: true, passive: true });
          window.addEventListener('focus', triggerAutoPlay, { once: true, passive: true });
        });
    }
  }, []); // Run only once at app root

  const onTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      setCurrentTime(current);

      // Milestone: Count as a valid listen once user reaches 5 seconds of playback
      if (current >= 5 && !hasCountedCurrentPlayback.current) {
        hasCountedCurrentPlayback.current = true;
        recordSongPlay();
      }
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const onEnded = () => {
    hasCountedCurrentPlayback.current = false;
    if (isRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    } else {
      setIsPlaying(false);
    }
  };

  return (
    <MusicContext.Provider
      value={{
        isPlaying,
        currentTime,
        duration,
        volume,
        isRepeat,
        autoplayBlocked,
        userPlayCount,
        totalPlayCount,
        togglePlay,
        playSong,
        pauseSong,
        restartSong,
        seekMusic,
        updateVolume,
        increaseVolume,
        decreaseVolume,
        toggleRepeat,
        formatTime,
        recordSongPlay,
        refreshMusicStats,
      }}
    >
      {/* Root Persistent HTML Audio Element */}
      <audio
        ref={audioRef}
        src="/forever-young.mp3"
        preload="auto"
        loop={isRepeat}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="hidden"
        aria-hidden="true"
      />
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
