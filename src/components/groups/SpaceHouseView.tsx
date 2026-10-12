'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/lib/store';
import { Avatar } from '@/components/common/Avatar';
import {
  Shield,
  Zap,
  Trophy,
  Flame,
  Sparkles,
  Bot,
  MessageSquare,
  Send,
  Users,
  Timer,
  CheckCircle2,
  Lock,
  Gamepad2,
  Sword,
  Play,
  RotateCcw,
  Star,
  Radio,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type HouseId = 'marvel' | 'dc' | 'pokemon' | 'power_rangers';

interface Character {
  id: string;
  name: string;
  subtitle: string;
  house: HouseId;
  avatar: string;
  badge: string;
  quote: string;
}

const CHARACTERS_20: Character[] = [
  // Marvel (5)
  {
    id: 'spiderman',
    name: 'Spider-Man',
    subtitle: 'Peter Parker • Web-Slinger',
    house: 'marvel',
    avatar: '🕷️',
    badge: 'Marvel Icon',
    quote: 'With great power comes great responsibility.',
  },
  {
    id: 'ironman',
    name: 'Iron Man',
    subtitle: 'Tony Stark • Armored Avenger',
    house: 'marvel',
    avatar: '🦾',
    badge: 'Genius Inventor',
    quote: 'I am Iron Man. Let\'s light up the universe.',
  },
  {
    id: 'thor',
    name: 'Thor Odinson',
    subtitle: 'God of Thunder • Asgard',
    house: 'marvel',
    avatar: '⚡',
    badge: 'Thunder God',
    quote: 'Bring me Thanos! For Asgard and the galaxy!',
  },
  {
    id: 'cap',
    name: 'Captain America',
    subtitle: 'Steve Rogers • First Avenger',
    house: 'marvel',
    avatar: '🛡️',
    badge: 'First Avenger',
    quote: 'I can do this all day. Assemble!',
  },
  {
    id: 'wolverine',
    name: 'Wolverine',
    subtitle: 'Logan • Adamantium Claws',
    house: 'marvel',
    avatar: '🐺',
    badge: 'Weapon X',
    quote: 'I\'m the best there is at what I do.',
  },

  // DC (5)
  {
    id: 'batman',
    name: 'The Dark Knight (Batman)',
    subtitle: 'Bruce Wayne • Gotham Detective',
    house: 'dc',
    avatar: '🦇',
    badge: 'Gotham Guardian',
    quote: 'I am vengeance. I am the night. I am Batman.',
  },
  {
    id: 'superman',
    name: 'Superman',
    subtitle: 'Kal-El • Man of Steel',
    house: 'dc',
    avatar: '🦸‍♂️',
    badge: 'Symbol of Hope',
    quote: 'There is a superhero in all of us. Hope never dies.',
  },
  {
    id: 'flash',
    name: 'The Flash',
    subtitle: 'Barry Allen • Scarlet Speedster',
    house: 'dc',
    avatar: '⚡',
    badge: 'Speed Force',
    quote: 'Life doesn\'t give us purpose. We give life purpose.',
  },
  {
    id: 'wonderwoman',
    name: 'Wonder Woman',
    subtitle: 'Diana Prince • Themyscira',
    house: 'dc',
    avatar: '⚔️',
    badge: 'Amazonian Warrior',
    quote: 'Only love can truly save the world.',
  },
  {
    id: 'joker',
    name: 'The Joker',
    subtitle: 'Clown Prince of Chaos',
    house: 'dc',
    avatar: '🃏',
    badge: 'Master of Chaos',
    quote: 'Why so serious? Let\'s put a smile on that face.',
  },

  // Pokemon (5)
  {
    id: 'pikachu',
    name: 'Pikachu',
    subtitle: 'Electric Mouse • Volt Tackle',
    house: 'pokemon',
    avatar: '⚡',
    badge: 'Electric Legend',
    quote: 'Pika Pika! Unleashing Thunderbolt!',
  },
  {
    id: 'charizard',
    name: 'Charizard',
    subtitle: 'Flame Dragon • Seismic Toss',
    house: 'pokemon',
    avatar: '🔥',
    badge: 'Fire Titan',
    quote: 'Roaring inferno! Burning brighter than stars.',
  },
  {
    id: 'mewtwo',
    name: 'Mewtwo',
    subtitle: 'Psychic Titan • Genetic Marvel',
    house: 'pokemon',
    avatar: '🔮',
    badge: 'Psychic Sovereign',
    quote: 'The circumstances of birth are irrelevant; what you do with life defines you.',
  },
  {
    id: 'gengar',
    name: 'Gengar',
    subtitle: 'Shadow Ghost • Night Shade',
    house: 'pokemon',
    avatar: '👻',
    badge: 'Shadow Trickster',
    quote: 'Grinning from the shadows with spectral power!',
  },
  {
    id: 'rayquaza',
    name: 'Rayquaza',
    subtitle: 'Sky High Dragon • Ozone Ruler',
    house: 'pokemon',
    avatar: '🐉',
    badge: 'Ozone Monarch',
    quote: 'Descending from the stratosphere to command the skies.',
  },

  // Power Rangers (5)
  {
    id: 'red_ranger',
    name: 'Red Ranger (Jason / Tommy)',
    subtitle: 'Tyrannosaurus • Team Leader',
    house: 'power_rangers',
    avatar: '🔴',
    badge: 'Squad Commander',
    quote: 'It\'s Morphin Time! Tyrannosaurus Red!',
  },
  {
    id: 'green_ranger',
    name: 'Green Ranger',
    subtitle: 'Dragonzord • Dragon Dagger',
    house: 'power_rangers',
    avatar: '🐲',
    badge: 'Dragon Warrior',
    quote: 'Dragon Dagger summoned! Dragonzord power!',
  },
  {
    id: 'white_ranger',
    name: 'White Ranger',
    subtitle: 'Tigerzord • Saba Blade',
    house: 'power_rangers',
    avatar: '🐅',
    badge: 'White Light Leader',
    quote: 'White Ranger Power! May the light guide us.',
  },
  {
    id: 'blue_ranger',
    name: 'Blue Ranger (Billy)',
    subtitle: 'Triceratops • Tech Genius',
    house: 'power_rangers',
    avatar: '🔷',
    badge: 'Tactical Mind',
    quote: 'Triceratops power! Science and strength combined.',
  },
  {
    id: 'megazord',
    name: 'Megazord',
    subtitle: 'Titan of the Morphin Grid',
    house: 'power_rangers',
    avatar: '🤖',
    badge: 'Ultimate Titan',
    quote: 'Megazord power sequence activated! Stand together!',
  },
];

const HOUSE_METADATA: Record<
  HouseId,
  {
    name: string;
    tagline: string;
    color: string;
    border: string;
    accent: string;
    icon: string;
    description: string;
  }
> = {
  marvel: {
    name: 'Marvel House',
    tagline: 'Earth\'s Mightiest Heroes & Multiverse Legends',
    color: 'from-rose-950/80 via-red-900/50 to-amber-950/60',
    border: 'border-rose-500/40',
    accent: 'text-rose-400',
    icon: '🛡️',
    description: 'Champions of courage, ingenuity, and cosmic justice led by Spider-Man and Iron Man.',
  },
  dc: {
    name: 'DC House',
    tagline: 'Gotham Darkness & The Multiverse Trinity',
    color: 'from-blue-950/80 via-indigo-950/60 to-slate-950/80',
    border: 'border-blue-500/40',
    accent: 'text-cyan-300',
    icon: '🦇',
    description: 'Masters of detective intellect, speed, and divine power led by The Dark Knight and Superman.',
  },
  pokemon: {
    name: 'Pokemon House',
    tagline: 'Elemental Power & Legendary Evolution',
    color: 'from-amber-950/80 via-emerald-950/50 to-yellow-950/60',
    border: 'border-amber-500/40',
    accent: 'text-amber-300',
    icon: '⚡',
    description: 'Elemental synergy, legendary trainers, and thunderous power led by Pikachu and Charizard.',
  },
  power_rangers: {
    name: 'Power Rangers House',
    tagline: 'Morphin Grid Synergy & Megazord Might',
    color: 'from-red-950/80 via-cyan-950/50 to-emerald-950/60',
    border: 'border-cyan-500/40',
    accent: 'text-emerald-300',
    icon: '🦖',
    description: 'Courage, unity, and giant Zord combat harnessing the infinite Morphin Grid.',
  },
};

interface HouseChatMessage {
  id: string;
  senderName: string;
  senderAvatar: string;
  house: HouseId;
  text: string;
  timestamp: string;
}

const INITIAL_HOUSE_CHATS: HouseChatMessage[] = [
  {
    id: 'hc_1',
    senderName: 'Akshay Kumar',
    senderAvatar: '/avatar.png',
    house: 'marvel',
    text: 'Welcome all Houses! "Time is never coming back, remember time is never..." Compete hard this month!',
    timestamp: '10:14 AM',
  },
  {
    id: 'hc_2',
    senderName: 'Bruce_Knight',
    senderAvatar: '/avatar.png',
    house: 'dc',
    text: 'DC House has already generated +250 reactor points today. Gotham leads the galaxy!',
    timestamp: '10:22 AM',
  },
  {
    id: 'hc_3',
    senderName: 'Ash_Ketchum',
    senderAvatar: '/avatar.png',
    house: 'pokemon',
    text: 'Pikachu just hit 100,000 volts on the power reactor! Pokemon House is taking the trophy.',
    timestamp: '10:35 AM',
  },
  {
    id: 'hc_4',
    senderName: 'Tommy_Oliver',
    senderAvatar: '/avatar.png',
    house: 'power_rangers',
    text: 'Dragonzord is locked into the colosseum. Power Rangers assemble for the clash!',
    timestamp: '10:48 AM',
  },
];

export const SpaceHouseView: React.FC = () => {
  const {
    currentUser,
    userHouse,
    userHouseCharacter,
    userHouseAssignedAt,
    houseScores,
    assignUserHouse,
    addHousePoints,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'hub' | 'games' | 'chat'>('hub');
  const [selectedCharacterFilter, setSelectedCharacterFilter] = useState<'all' | HouseId>('all');
  const [chatMessages, setChatMessages] = useState<HouseChatMessage[]>(INITIAL_HOUSE_CHATS);
  const [inputMessage, setInputMessage] = useState('');
  const [chatChannel, setChatChannel] = useState<'house_hq' | 'global_colosseum'>('house_hq');

  // Mini-Games states
  const [reactorPower, setReactorPower] = useState(0);
  const [triviaStep, setTriviaStep] = useState(0);
  const [triviaScore, setTriviaScore] = useState(0);
  const [triviaFinished, setTriviaFinished] = useState(false);
  const [arenaResult, setArenaResult] = useState<string | null>(null);

  // Time remaining calculation (30 days from assignment)
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  const assignedTimestamp = userHouseAssignedAt || Date.now();
  const timeRemainingMs = Math.max(0, assignedTimestamp + THIRTY_DAYS_MS - Date.now());
  const daysLeft = Math.floor(timeRemainingMs / (24 * 60 * 60 * 1000));
  const hoursLeft = Math.floor((timeRemainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  // Sorting Ceremony selection handler
  const handleSelectCharacter = (char: Character) => {
    assignUserHouse(char.house, char.name);

    // Speak Nova's announcement aloud
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        const houseTitle = HOUSE_METADATA[char.house].name;
        const announcement = `Sorting protocol complete! Because you chose ${char.name}, you are hereby assigned to ${houseTitle}! Galactic law binds you to this house for 1 month. Fight for your house!`;
        const utter = new SpeechSynthesisUtterance(announcement);
        utter.rate = 1.05;
        window.speechSynthesis.speak(utter);
      } catch (_) {}
    }
  };

  // Reactor Core Tap Game
  const handleTapReactor = () => {
    if (!userHouse) return;
    setReactorPower((prev) => prev + 1);
    addHousePoints(userHouse, 5);
  };

  // Trivia Questions
  const triviaQuestions = [
    {
      q: 'Which character said "With great power comes great responsibility"?',
      opts: ['Spider-Man (Uncle Ben)', 'Batman', 'Mewtwo', 'Red Ranger'],
      ans: 0,
      house: 'marvel',
    },
    {
      q: 'What is the real identity of Gotham\'s Dark Knight?',
      opts: ['Clark Kent', 'Bruce Wayne', 'Peter Parker', 'Tommy Oliver'],
      ans: 1,
      house: 'dc',
    },
    {
      q: 'Which Pokemon possesses the move "Thunderbolt" as its signature trademark?',
      opts: ['Charizard', 'Pikachu', 'Gengar', 'Rayquaza'],
      ans: 1,
      house: 'pokemon',
    },
    {
      q: 'What giant titan do the Power Rangers summon when uniting their Dinozords?',
      opts: ['Megazord', 'Dragonzord', 'Optimus', 'Buster Machine'],
      ans: 0,
      house: 'power_rangers',
    },
    {
      q: 'How long are travelers required to stay in their Space House in Interstellers?',
      opts: ['1 Day', '1 Week', '1 Month (30 Days)', '1 Year'],
      ans: 2,
      house: 'all',
    },
  ];

  const handleAnswerTrivia = (chosenIdx: number) => {
    const isCorrect = chosenIdx === triviaQuestions[triviaStep].ans;
    if (isCorrect && userHouse) {
      setTriviaScore((prev) => prev + 1);
      addHousePoints(userHouse, 25);
    }

    if (triviaStep + 1 < triviaQuestions.length) {
      setTriviaStep((prev) => prev + 1);
    } else {
      setTriviaFinished(true);
    }
  };

  const handleArenaDuel = () => {
    if (!userHouse) return;
    const roll = Math.floor(Math.random() * 100) + 1;
    if (roll > 40) {
      addHousePoints(userHouse, 50);
      setArenaResult(`Victory! Your champion rolled ${roll} Power Units. +50 Points awarded to ${HOUSE_METADATA[userHouse].name}! 🏆`);
    } else {
      addHousePoints(userHouse, 10);
      setArenaResult(`Close battle! Rolled ${roll} Power Units. +10 Points tactical experience earned. ⚔️`);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !userHouse) return;

    const newMsg: HouseChatMessage = {
      id: `hc_${Date.now()}`,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      house: userHouse,
      text: inputMessage.trim(),
      timestamp: 'Just now',
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
    addHousePoints(userHouse, 2);
  };

  // Sort Leaderboard
  const sortedHouses = (['pokemon', 'marvel', 'dc', 'power_rangers'] as HouseId[]).sort(
    (a, b) => houseScores[b] - houseScores[a]
  );

  // If user is not sorted yet, show Nova Sorting Ceremony
  if (!userHouse) {
    const filteredChars =
      selectedCharacterFilter === 'all'
        ? CHARACTERS_20
        : CHARACTERS_20.filter((c) => c.house === selectedCharacterFilter);

    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
        {/* Nova Sorting Ceremony Header */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-purple-950/80 via-slate-900 to-cyan-950/80 border border-cyan-500/40 shadow-2xl overflow-hidden">
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-cyan-500/25 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Bot className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-wide flex items-center gap-2">
                  NOVA&apos;S SPACE HOUSE SORTING CEREMONY
                  <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-400/20 text-cyan-300 font-mono font-bold border border-cyan-400/40">
                    4 HOUSES PROTOCOL
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-cyan-200/90 font-medium">
                  1 House • 1 Month • Choose Your Favorite Champion
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md text-xs sm:text-sm text-slate-200 leading-relaxed space-y-2">
              <p className="font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Nova AI Speaking:</span>
              </p>
              <p>
                &ldquo;Welcome, Space Traveler! To enter our <strong>Space House League</strong>, tell me:
                <strong> Who is your absolute favorite character?</strong>
              </p>
              <p className="text-cyan-200 font-semibold">
                Select 1 character from our 20 legends across the 4 Houses. If you select Batman, you go to <strong>DC House</strong>. If you select Spider-Man, you go to <strong>Marvel House</strong>. If you select Pikachu, you go to <strong>Pokemon House</strong>. If you select Red Ranger, you go to <strong>Power Rangers House</strong>!
              </p>
              <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-400/30 text-amber-300 font-bold text-xs flex items-center gap-2">
                <Timer className="w-4 h-4 text-amber-400" />
                <span>GALACTIC LAW: You are locked into your chosen House for 1 FULL MONTH (30 Days). Choose wisely!</span>
              </div>
            </div>
          </div>
        </div>

        {/* House Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          <button
            onClick={() => setSelectedCharacterFilter('all')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0',
              selectedCharacterFilter === 'all'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
            )}
          >
            All 20 Champions
          </button>
          <button
            onClick={() => setSelectedCharacterFilter('marvel')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5',
              selectedCharacterFilter === 'marvel'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-surface-container text-rose-400 hover:bg-rose-950/30'
            )}
          >
            <span>🛡️ Marvel House (5)</span>
          </button>
          <button
            onClick={() => setSelectedCharacterFilter('dc')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5',
              selectedCharacterFilter === 'dc'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-surface-container text-cyan-400 hover:bg-blue-950/30'
            )}
          >
            <span>🦇 DC House (5)</span>
          </button>
          <button
            onClick={() => setSelectedCharacterFilter('pokemon')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5',
              selectedCharacterFilter === 'pokemon'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-surface-container text-amber-400 hover:bg-amber-950/30'
            )}
          >
            <span>⚡ Pokemon House (5)</span>
          </button>
          <button
            onClick={() => setSelectedCharacterFilter('power_rangers')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5',
              selectedCharacterFilter === 'power_rangers'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-surface-container text-emerald-400 hover:bg-emerald-950/30'
            )}
          >
            <span>🦖 Power Rangers (5)</span>
          </button>
        </div>

        {/* 20 Character Selection Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredChars.map((char) => {
            const hMeta = HOUSE_METADATA[char.house];
            return (
              <div
                key={char.id}
                className={cn(
                  'rounded-2xl border p-5 flex flex-col justify-between shadow-card hover:shadow-xl transition-all duration-300 bg-surface-container-lowest group relative overflow-hidden',
                  hMeta.border
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl p-2.5 rounded-2xl bg-surface-container shadow-inner border border-outline-variant/30">
                      {char.avatar}
                    </span>
                    <span className={cn('text-[10px] font-extrabold px-2 py-0.5 rounded-full border', hMeta.accent)}>
                      {hMeta.name}
                    </span>
                  </div>

                  <h3 className="font-heading font-black text-base text-on-surface mb-0.5 group-hover:text-primary transition-colors">
                    {char.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-medium mb-3">
                    {char.subtitle}
                  </p>

                  <p className="text-[11px] text-on-surface-variant/90 italic bg-surface-container-high/40 p-2.5 rounded-xl border border-outline-variant/30 leading-snug mb-4">
                    &ldquo;{char.quote}&rdquo;
                  </p>
                </div>

                <button
                  onClick={() => handleSelectCharacter(char)}
                  className="w-full py-2.5 px-3 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95 group-hover:shadow-primary/30"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Choose As My Champion</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // User is already sorted into a House!
  const myHouseMeta = HOUSE_METADATA[userHouse];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-300">
      
      {/* House Headquarters Banner */}
      <div className={cn('relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br border shadow-2xl overflow-hidden text-white', myHouseMeta.color, myHouseMeta.border)}>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-4xl p-3 rounded-2xl bg-black/40 border border-white/20 backdrop-blur-md shadow-lg">
                {myHouseMeta.icon}
              </span>
              <div>
                <span className="text-xs font-mono font-black text-cyan-300 uppercase tracking-widest block">
                  OFFICIAL RESIDENCE
                </span>
                <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
                  {myHouseMeta.name}
                </h1>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 font-medium">
              Champion: <strong className="text-amber-300">{userHouseCharacter}</strong> • {myHouseMeta.tagline}
            </p>
          </div>

          {/* 30-Day Residency Countdown Timer */}
          <div className="p-4 rounded-2xl bg-black/60 border border-white/20 backdrop-blur-md shadow-xl flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
              <Timer className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono font-extrabold text-amber-300">
                1-Month Residency Lock
              </p>
              <p className="text-base sm:text-lg font-heading font-black text-white tabular-nums">
                {daysLeft} Days, {hoursLeft} Hours Left
              </p>
              <p className="text-[10px] text-slate-300">
                Locked into this house for 30 days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Leaderboard Across All 4 Houses */}
      <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-500">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-black text-base text-on-surface">
              4 HOUSES GLOBAL LEADERBOARD
            </h3>
          </div>
          <span className="text-xs text-on-surface-variant font-medium">
            The house with the most points wins galactic supremacy!
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sortedHouses.map((hId, index) => {
            const meta = HOUSE_METADATA[hId];
            const score = houseScores[hId];
            const isMyHouse = hId === userHouse;

            return (
              <div
                key={hId}
                className={cn(
                  'p-4 rounded-xl border transition-all flex flex-col justify-between',
                  isMyHouse
                    ? 'bg-primary/10 border-primary ring-2 ring-primary/30 shadow-md'
                    : 'bg-surface-container border-outline-variant/40'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{meta.icon}</span>
                  <span className="text-xs font-black font-mono px-2 py-0.5 rounded-full bg-surface-bright text-on-surface">
                    #{index + 1} Rank
                  </span>
                </div>

                <div>
                  <h4 className="font-heading font-bold text-sm text-on-surface">
                    {meta.name}
                  </h4>
                  <p className="text-lg font-heading font-black text-primary tabular-nums mt-0.5">
                    {score.toLocaleString()} pts
                  </p>
                </div>

                {isMyHouse && (
                  <span className="mt-2 text-[10px] font-extrabold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Your Active House
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/40 pb-2">
        <button
          onClick={() => setActiveTab('hub')}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all',
            activeTab === 'hub'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
          )}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>House Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('games')}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all',
            activeTab === 'games'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
          )}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>House Games & Points Battles</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-mono">Earn Pts</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all',
            activeTab === 'chat'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
          )}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Global House Chat</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono">Live</span>
        </button>
      </div>

      {/* TAB 1: HUB OVERVIEW */}
      {activeTab === 'hub' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-card space-y-4">
              <h3 className="font-heading font-black text-lg text-on-surface flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>House Creed & Monthly Directive</span>
              </h3>
              <p className="text-xs sm:text-sm text-on-surface leading-relaxed">
                {myHouseMeta.description}
              </p>

              <div className="p-4 rounded-xl bg-surface-container-high/60 border border-outline-variant/40 space-y-2 text-xs">
                <p className="font-bold text-amber-400">Rules of the House:</p>
                <ul className="list-disc list-inside space-y-1 text-on-surface-variant">
                  <li><strong>1 House for 1 Month:</strong> You cannot transfer to another house until the 30-day galactic timer expires.</li>
                  <li><strong>Contribute Points:</strong> Play the Reactor clicker, complete trivia questions, and win arena duels to climb the leaderboard.</li>
                  <li><strong>House Brotherhood:</strong> Support fellow house members and represent your champions with pride!</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-card space-y-3">
              <h4 className="font-heading font-bold text-sm text-on-surface">Quick Actions</h4>
              <button
                onClick={() => setActiveTab('games')}
                className="w-full py-2.5 px-3 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-xs hover:bg-primary-hover flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>Play Games to Boost Points</span>
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className="w-full py-2.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs flex items-center justify-center gap-2 border border-outline-variant/40"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open House Chat Room</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MINI-GAMES & BATTLES */}
      {activeTab === 'games' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Game 1: Reactor Power Core Clicker */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-card flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">GAME #1 • TAP REACTOR</span>
                <span className="text-xs font-bold text-emerald-400">+5 pts / tap</span>
              </div>
              <h3 className="font-heading font-black text-base text-on-surface">
                House Reactor Power Core
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Rapidly charge your House&apos;s quantum plasma core to inject points directly into your House total!
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-cyan-500/30 flex flex-col items-center justify-center space-y-3">
              <button
                type="button"
                onClick={handleTapReactor}
                className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500 via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.6)] active:scale-90 transition-transform cursor-pointer"
                title="Tap to generate points!"
              >
                <Zap className="w-10 h-10 animate-pulse text-amber-300" />
              </button>
              <p className="text-xs font-mono font-bold text-cyan-300 tabular-nums">
                Taps: {reactorPower} • Points Earned: +{reactorPower * 5} pts
              </p>
            </div>
          </div>

          {/* Game 2: Multiverse Trivia Duel */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-card flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">GAME #2 • TRIVIA DUEL</span>
                <span className="text-xs font-bold text-purple-400">+25 pts / answer</span>
              </div>
              <h3 className="font-heading font-black text-base text-on-surface">
                Multiverse Trivia Clash
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Test your knowledge of Marvel, DC, Pokemon, and Power Rangers!
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/40 space-y-3">
              {!triviaFinished ? (
                <>
                  <div className="flex justify-between text-[11px] font-mono text-on-surface-variant">
                    <span>Question {triviaStep + 1} of {triviaQuestions.length}</span>
                    <span className="text-primary font-bold">{triviaScore} Correct</span>
                  </div>
                  <p className="text-xs font-bold text-on-surface">
                    {triviaQuestions[triviaStep].q}
                  </p>
                  <div className="space-y-1.5">
                    {triviaQuestions[triviaStep].opts.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswerTrivia(i)}
                        className="w-full text-left p-2 rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary text-xs font-medium transition-all"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-4 space-y-2">
                  <Trophy className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="font-bold text-sm text-on-surface">Trivia Completed!</p>
                  <p className="text-xs text-emerald-400 font-mono">Score: {triviaScore} / {triviaQuestions.length} (+{triviaScore * 25} House Points)</p>
                  <button
                    onClick={() => {
                      setTriviaStep(0);
                      setTriviaScore(0);
                      setTriviaFinished(false);
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-primary text-on-primary font-bold mt-2"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Game 3: Hero Arena Clash */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-card flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">GAME #3 • ARENA CLASH</span>
                <span className="text-xs font-bold text-cyan-400">+50 pts / win</span>
              </div>
              <h3 className="font-heading font-black text-base text-on-surface">
                Cosmic Arena Power Duel
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Send your champion into the arena against other House guardians!
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/40 space-y-3 text-center">
              <Sword className="w-10 h-10 text-cyan-400 mx-auto animate-bounce" />
              <button
                onClick={handleArenaDuel}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-black text-xs shadow-md active:scale-95 transition-all"
              >
                Clash in the Arena ⚔️
              </button>
              {arenaResult && (
                <p className="text-xs text-on-surface font-semibold bg-surface-bright p-2 rounded-lg border border-outline-variant/30 animate-in fade-in">
                  {arenaResult}
                </p>
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: GLOBAL HOUSE CHAT */}
      {activeTab === 'chat' && (
        <div className="h-[520px] rounded-2xl bg-surface-container-lowest border border-outline-variant/60 flex flex-col overflow-hidden shadow-card">
          {/* Chat Header Channels */}
          <div className="p-3 bg-surface-container border-b border-outline-variant/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChatChannel('house_hq')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                  chatChannel === 'house_hq'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                )}
              >
                # {myHouseMeta.name} HQ
              </button>
              <button
                onClick={() => setChatChannel('global_colosseum')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                  chatChannel === 'global_colosseum'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                )}
              >
                # 4-Houses Colosseum (Inter-House Banter)
              </button>
            </div>
            <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Frequency
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {chatMessages.map((msg) => {
              const senderMeta = HOUSE_METADATA[msg.house];
              const isMine = msg.senderName === currentUser.name;

              return (
                <div
                  key={msg.id}
                  className={cn('flex items-start gap-2.5', isMine ? 'justify-end' : 'justify-start')}
                >
                  {!isMine && (
                    <Avatar src={msg.senderAvatar} name={msg.senderName} size="sm" />
                  )}

                  <div
                    className={cn(
                      'max-w-md p-3 rounded-2xl border text-xs shadow-xs space-y-1',
                      isMine
                        ? 'bg-primary text-on-primary border-primary'
                        : 'bg-surface-container text-on-surface border-outline-variant/40'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold flex items-center gap-1">
                        <span>{msg.senderName}</span>
                        <span className="text-[10px] opacity-75 font-mono">({senderMeta?.name.replace(' House', '')})</span>
                      </span>
                      <span className="text-[10px] opacity-70">{msg.timestamp}</span>
                    </div>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>

                  {isMine && (
                    <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Chat Composer */}
          <form onSubmit={handleSendMessage} className="p-3 bg-surface-container border-t border-outline-variant/40 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Transmit message to ${chatChannel === 'house_hq' ? myHouseMeta.name : '4 Houses Colosseum'}... (+2 House pts)`}
              className="flex-1 bg-surface-container-high rounded-xl px-4 py-2 text-xs text-on-surface placeholder:text-on-surface-variant outline-none border border-outline-variant/40 focus:border-primary"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
