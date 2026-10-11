'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

interface MusicContextType {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isRepeat: boolean;
  autoplayBlocked: boolean;
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
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [autoplayBlocked, setAutoplayBlocked] = useState<boolean>(false);

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
    audio.play().then(() => setIsPlaying(true)).catch(() => {});
  }, []);

  const seekMusic = useCallback((targetTime: number) => {
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
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
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const onEnded = () => {
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
