'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '@/lib/store';

// ---------------------------------------------------------------
// PLAYLIST — all songs in /public (sequential loop, no shuffle)
// ---------------------------------------------------------------
export interface SongInfo {
  src: string;
  title: string;
  artist: string;
}

export const FALLBACK_PLAYLIST: SongInfo[] = [
  { src: '/music/forever-young.mp3', title: 'Forever Young', artist: 'Alphaville' },
  { src: '/music/Alan Walker - Faded.mp3', title: 'Faded', artist: 'Alan Walker' },
  { src: '/music/Caribbean Blue X Golden Brown X Love Story (slowed + reverb) music hub lyrics.mp3', title: 'Caribbean Blue × Golden Brown × Love Story', artist: 'Music Hub' },
  { src: '/music/Ed Sheeran - Tenerife Sea (Live At Wembley Stadium 2015) HD.mp3', title: 'Tenerife Sea (Live)', artist: 'Ed Sheeran' },
  { src: '/music/Enchanted - Pride & Prejudice (2005).mp3', title: 'Enchanted', artist: 'Pride & Prejudice' },
  { src: '/music/Sakhi Pachchadanamey song.mp3', title: 'Sakhi Pachchadanamey', artist: 'Telugu Classic' },
  { src: '/music/The Stranglers - Golden Brown (Official Lyric Video) [ji1TIBybjp4].mp3', title: 'Golden Brown', artist: 'The Stranglers' },
  { src: '/music/Tumblr Girls - G-Eazy 「 𝙀𝙣𝙙𝙞𝙣𝙜 𝙡𝙤𝙤𝙥𝙚𝙙」.mp3', title: 'Tumblr Girls', artist: 'G-Eazy' },
  { src: '/music/a thousand years (speed up + lyrics).mp3', title: 'A Thousand Years (Sped Up)', artist: 'Christina Perri' },
  { src: '/music/perfect (sped up).mp3', title: 'Perfect (Sped Up)', artist: 'Ed Sheeran' },
  { src: '/music/İndila-Love Story (Türkçe çeviri).mp3', title: 'Love Story', artist: 'İndila' },
];

export const PLAYLIST = FALLBACK_PLAYLIST;

interface MusicContextType {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isRepeat: boolean;
  autoplayBlocked: boolean;
  userPlayCount: number;
  totalPlayCount: number;
  currentSongIndex: number;
  currentSong: SongInfo;
  playlist: SongInfo[];
  togglePlay: () => void;
  playSong: () => void;
  pauseSong: () => void;
  restartSong: () => void;
  seekMusic: (time: number) => void;
  updateVolume: (vol: number) => void;
  increaseVolume: () => void;
  decreaseVolume: () => void;
  toggleRepeat: () => void;
  nextSong: () => void;
  prevSong: () => void;
  jumpToSong: (index: number) => void;
  formatTime: (seconds: number) => string;
  recordSongPlay: () => Promise<void>;
  refreshMusicStats: () => Promise<void>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useApp();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playlist, setPlaylist] = useState<SongInfo[]>(FALLBACK_PLAYLIST);
  const playlistRef = useRef<SongInfo[]>(FALLBACK_PLAYLIST);
  playlistRef.current = playlist;

  // ── Use a ref for the index to avoid stale closures in audio event handlers ──
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('interstellers_current_song_index');
      if (saved !== null) {
        const n = parseInt(saved, 10);
        if (!isNaN(n) && n >= 0 && n < FALLBACK_PLAYLIST.length) return n;
      }
    }
    return 0;
  });
  const currentSongIndexRef = useRef(currentSongIndex);
  currentSongIndexRef.current = currentSongIndex;  // always up-to-date

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('interstellers_player_repeat') === 'true';
    }
    return false;
  });

  const hasCountedCurrentPlayback = useRef(false);

  const userKey = (currentUser?.email || currentUser?.id || 'guest').toLowerCase().trim();

  const [userPlayCount, setUserPlayCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`interstellers_user_plays_${userKey}`);
      const n = parseInt(saved || '', 10);
      return !isNaN(n) && n >= 0 ? n : 0;
    }
    return 0;
  });

  const [totalPlayCount, setTotalPlayCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('interstellers_total_song_plays');
      const n = parseInt(saved || '', 10);
      return !isNaN(n) && n >= 0 ? n : 24;
    }
    return 24;
  });

  const [volume, setVolume] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('interstellers_player_volume');
      const n = parseFloat(saved || '');
      return !isNaN(n) && n >= 0 && n <= 1 ? n : 0.75;
    }
    return 0.75;
  });

  // ── Core helper: load & play a specific index ────────────────────────────────
const goToIndex = useCallback((index: number, play = true) => {
  const activePlaylist = playlistRef.current.length ? playlistRef.current : FALLBACK_PLAYLIST;
  const safe = ((index % activePlaylist.length) + activePlaylist.length) % activePlaylist.length;
  const song = activePlaylist[safe];

  setCurrentSongIndex(safe);
  currentSongIndexRef.current = safe;

  try {
    localStorage.setItem(
      'interstellers_current_song_index',
      String(safe)
    );
  } catch (_) {}

  hasCountedCurrentPlayback.current = false;
  setCurrentTime(0);
  setDuration(0);
  setIsPlaying(false);
  setAutoplayBlocked(false);

  const audio = audioRef.current;

  if (!audio || !song) return;

  audio.pause();
  audio.src = song.src;
  audio.load();

  if (play) {
    audio.play()
      .then(() => {
        setIsPlaying(true);
        setAutoplayBlocked(false);
      })
      .catch((error: unknown) => {
        setIsPlaying(false);
        setAutoplayBlocked(true);
        console.error('Interstellers music playback failed:', error);
      });
  }
}, []);

  // ── Public controls ──────────────────────────────────────────────────────────
  const nextSong = useCallback(() => {
    goToIndex(currentSongIndexRef.current + 1, true);
  }, [goToIndex]);

  const prevSong = useCallback(() => {
    goToIndex(currentSongIndexRef.current - 1, true);
  }, [goToIndex]);

  const jumpToSong = useCallback((index: number) => {
    goToIndex(index, true);
  }, [goToIndex]);

  const playSong = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.play()
      .then(() => { setIsPlaying(true); setAutoplayBlocked(false); })
      .catch(() => { setAutoplayBlocked(true); });
  }, []);

  const pauseSong = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (audioRef.current?.paused) { playSong(); } else { pauseSong(); }
  }, [playSong, pauseSong]);

  const restartSong = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      hasCountedCurrentPlayback.current = false;
      audioRef.current.play()
        .then(() => { setIsPlaying(true); setAutoplayBlocked(false); })
        .catch(() => { setAutoplayBlocked(true); });
    }
  }, []);

  const seekMusic = useCallback((t: number) => {
    setCurrentTime(t);
    if (audioRef.current) audioRef.current.currentTime = t;
    if (t < 3) hasCountedCurrentPlayback.current = false;
  }, []);

  const updateVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, Math.round(v * 100) / 100));
    setVolume(clamped);
    if (audioRef.current) audioRef.current.volume = clamped;
    try { localStorage.setItem('interstellers_player_volume', String(clamped)); } catch (_) {}
  }, []);

  const increaseVolume = useCallback(() => {
    setVolume((v) => {
      const next = Math.min(1, Math.round((v + 0.1) * 100) / 100);
      if (audioRef.current) audioRef.current.volume = next;
      try { localStorage.setItem('interstellers_player_volume', String(next)); } catch (_) {}
      return next;
    });
  }, []);

  const decreaseVolume = useCallback(() => {
    setVolume((v) => {
      const next = Math.max(0, Math.round((v - 0.1) * 100) / 100);
      if (audioRef.current) audioRef.current.volume = next;
      try { localStorage.setItem('interstellers_player_volume', String(next)); } catch (_) {}
      return next;
    });
  }, []);

  const toggleRepeat = useCallback(() => {
    setIsRepeat((prev) => {
      const next = !prev;
      if (audioRef.current) audioRef.current.loop = next;
      try { localStorage.setItem('interstellers_player_repeat', String(next)); } catch (_) {}
      return next;
    });
  }, []);

  const formatTime = useCallback((s: number) => {
    if (isNaN(s) || s < 0) return '0:00';
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60);
    return `${m}:${ss < 10 ? '0' : ''}${ss}`;
  }, []);

  // ── Stats sync ───────────────────────────────────────────────────────────────
  const refreshMusicStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/music/stats?user=${encodeURIComponent(userKey)}`);
      if (res.ok) {
        const data = await res.json();
        if (typeof data.userPlays === 'number') {
          setUserPlayCount(data.userPlays);
          try { localStorage.setItem(`interstellers_user_plays_${userKey}`, String(data.userPlays)); } catch (_) {}
        }
        if (typeof data.totalPlays === 'number') {
          setTotalPlayCount(data.totalPlays);
          try { localStorage.setItem('interstellers_total_song_plays', String(data.totalPlays)); } catch (_) {}
        }
      }
    } catch (_) {}
  }, [userKey]);

  const recordSongPlay = useCallback(async () => {
    setUserPlayCount((p) => {
      const n = p + 1;
      try { localStorage.setItem(`interstellers_user_plays_${userKey}`, String(n)); } catch (_) {}
      return n;
    });
    setTotalPlayCount((p) => {
      const n = p + 1;
      try { localStorage.setItem('interstellers_total_song_plays', String(n)); } catch (_) {}
      return n;
    });
    try {
      const res = await fetch('/api/music/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: userKey }),
      });
      if (res.ok) {
        const d = await res.json();
        if (typeof d.userPlays === 'number') setUserPlayCount(d.userPlays);
        if (typeof d.totalPlays === 'number') setTotalPlayCount(d.totalPlays);
      }
    } catch (_) {}
  }, [userKey]);

  useEffect(() => {
    const saved = localStorage.getItem(`interstellers_user_plays_${userKey}`);
    const n = parseInt(saved || '', 10);
    setUserPlayCount(!isNaN(n) && n >= 0 ? n : 0);
    refreshMusicStats();
  }, [userKey, refreshMusicStats]);

  useEffect(() => {
    let isMounted = true;

    const loadPlaylist = async () => {
      try {
        const res = await fetch('/api/ambient-music');
        if (!res.ok) return;

        const data = await res.json();
        const songs = Array.isArray(data?.songs)
          ? data.songs.map((song: { url?: string; filename?: string; title?: string }) => ({
              src: song.url || '',
              title: song.title || song.filename?.replace(/\.[^/.]+$/, '') || 'Untitled track',
              artist: 'Ambient Mix',
            }))
          : [];

        if (!isMounted || songs.length === 0) return;

        setPlaylist(songs);
        const safeIndex = currentSongIndexRef.current >= songs.length ? 0 : currentSongIndexRef.current;
        if (safeIndex !== currentSongIndexRef.current) {
          setCurrentSongIndex(safeIndex);
          currentSongIndexRef.current = safeIndex;
          try { localStorage.setItem('interstellers_current_song_index', String(safeIndex)); } catch (_) {}
        }
      } catch (_) {
        // Fall back to the bundled playlist if the folder is unavailable.
      }
    };

    loadPlaylist();

    return () => {
      isMounted = false;
    };
  }, []);

  // ── Wire up the audio element once on mount ──────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const activePlaylist = playlistRef.current.length ? playlistRef.current : FALLBACK_PLAYLIST;
    audio.volume = volume;
    audio.loop = isRepeat;

    // Set the initial src (index persisted from localStorage)
    audio.src = activePlaylist[currentSongIndexRef.current]?.src || activePlaylist[0]?.src || FALLBACK_PLAYLIST[0].src;
    audio.load();

    // timeupdate
    const onTimeUpdate = () => {
      if (!audio) return;
      setCurrentTime(audio.currentTime);
      if (audio.currentTime >= 5 && !hasCountedCurrentPlayback.current) {
        hasCountedCurrentPlayback.current = true;
        recordSongPlay();
      }
    };

    // metadata
    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    // ENDED → advance to next song immediately
    const onEnded = () => {
      const activePlaylist = playlistRef.current.length ? playlistRef.current : FALLBACK_PLAYLIST;
      const nextIndex = (currentSongIndexRef.current + 1) % activePlaylist.length;
      goToIndex(nextIndex, true);
    };

    const onPlay  = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate',     onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended',          onEnded);
    audio.addEventListener('play',           onPlay);
    audio.addEventListener('pause',          onPause);

    // Attempt autoplay
    audio.play()
      .then(() => { setIsPlaying(true); setAutoplayBlocked(false); })
      .catch(() => {
        setAutoplayBlocked(true);
        // Trigger on first user interaction
        const tryPlay = () => {
          audio.play()
            .then(() => { setIsPlaying(true); setAutoplayBlocked(false); })
            .catch(() => {});
          cleanup();
        };
        const cleanup = () => {
          ['pointerdown', 'click', 'keydown', 'touchstart', 'scroll', 'mousemove'].forEach(
            (ev) => window.removeEventListener(ev, tryPlay)
          );
        };
        ['pointerdown', 'click', 'keydown', 'touchstart', 'scroll', 'mousemove'].forEach(
          (ev) => window.addEventListener(ev, tryPlay, { once: true, passive: true })
        );
      });

    return () => {
      audio.removeEventListener('timeupdate',     onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended',          onEnded);
      audio.removeEventListener('play',           onPlay);
      audio.removeEventListener('pause',          onPause);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount only — ref keeps goToIndex / recordSongPlay always fresh

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
        currentSongIndex,
        currentSong: (playlist.length ? playlist : FALLBACK_PLAYLIST)[currentSongIndex] || FALLBACK_PLAYLIST[0],
        playlist: playlist.length ? playlist : FALLBACK_PLAYLIST,
        togglePlay,
        playSong,
        pauseSong,
        restartSong,
        seekMusic,
        updateVolume,
        increaseVolume,
        decreaseVolume,
        toggleRepeat,
        nextSong,
        prevSong,
        jumpToSong,
        formatTime,
        recordSongPlay,
        refreshMusicStats,
      }}
    >
      {/* Single persistent audio element — src managed imperatively via goToIndex */}
      <audio ref={audioRef} preload="auto" className="hidden" aria-hidden="true" />
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used within a MusicProvider');
  return ctx;
};
