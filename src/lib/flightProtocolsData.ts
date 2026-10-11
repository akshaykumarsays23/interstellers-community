export interface CoreRule {
  id: number;
  title: string;
  tag: string;
  description: string;
  category: 'activity' | 'growth' | 'community' | 'guardian';
  badgeColor: string;
}

export interface ClassifiedProtocol {
  id: number;
  number: number;
  title: string;
  category: 'all' | 'orbit' | 'community' | 'guardian' | 'badges';
  tag: string;
  summary: string;
  description: string;
  color: string;
}

// SPACE RULES — FOR EVERYONE
export const CORE_7_RULES: CoreRule[] = [
  {
    id: 1,
    title: '1. 🛰️ Activity System',
    tag: 'Profile Visibility',
    description: 'Inactive for 7 days? Your profile visibility gradually decreases. Return and participate to restore it.',
    category: 'activity',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  },
  {
    id: 2,
    title: '2. 🔥 XP & Daily Missions',
    tag: 'Daily Rewards',
    description: 'Complete daily missions by posting, commenting, or helping others to earn XP.',
    category: 'growth',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  },
  {
    id: 3,
    title: '3. 🏆 Badges & Streaks',
    tag: 'Streak Milestones',
    description: 'Earn badges for 7-day, 30-day, and 100-day participation streaks.',
    category: 'growth',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
  },
  {
    id: 4,
    title: '4. 👑 Weekly Leaderboard',
    tag: 'Weekly Titles',
    description: 'The top three contributors earn weekly titles: Galaxy Commander, Star Captain, and Orbit Master.',
    category: 'growth',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  },
  {
    id: 5,
    title: '5. 🤝 Community Engagement',
    tag: 'Bonus XP',
    description: 'Welcome new members, participate in weekly themes, and earn bonus XP through meaningful interactions.',
    category: 'community',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
  },
  {
    id: 6,
    title: '6. 🧠 AI Guardian',
    tag: 'Safe Orbit',
    description: 'Detect spam, scams, harassment, and malicious links to keep the community safe.',
    category: 'guardian',
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
  },
  {
    id: 7,
    title: '7. 🚫 Fair Punishment System',
    tag: 'Graduated Response',
    description: 'First violation: Warning. Second: 24-hour cooldown. Third: Temporary suspension. Serious violations may receive immediate action.',
    category: 'guardian',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
  }
];

// 20 ADVANCED PROTOCOLS — RESERVED FOR BIG ACCOUNTS & TOP 10 (UNLOCKS POST-OCTOBER)
export const CLASSIFIED_20_PROTOCOLS: ClassifiedProtocol[] = [
  {
    id: 1,
    number: 1,
    title: 'THE 7-DAY SIGNAL RULE',
    category: 'orbit',
    tag: 'Signal Fade',
    summary: 'Activity fading policy',
    description: 'No activity for 7 days? Your signal starts fading. Your Space Rank drops and your profile becomes less visible in galaxy discovery.',
    color: 'emerald'
  },
  {
    id: 2,
    number: 2,
    title: 'THE GHOST MODE',
    category: 'orbit',
    tag: '30-Day Inactive',
    summary: 'Dormancy policy',
    description: 'Disappear for 30 days without activity? You enter Ghost Orbit. You can still log in, but profile visibility is reduced until you return and participate.',
    color: 'slate'
  },
  {
    id: 3,
    number: 3,
    title: 'DAILY MISSIONS',
    category: 'orbit',
    tag: 'XP + Streaks',
    summary: 'Daily task generation',
    description: 'Every day, the galaxy generates random missions (post, answer, share music, join polls, help a traveler). Complete it → XP + streak bonus.',
    color: 'amber'
  },
  {
    id: 4,
    number: 4,
    title: 'STREAK MILESTONES',
    category: 'orbit',
    tag: 'Badges',
    summary: 'Streak tiers',
    description: 'Participate for 7 days → Explorer Badge. 30 days → Cosmic Traveler. 100 days → Legendary Orbit.',
    color: 'purple'
  },
  {
    id: 5,
    number: 5,
    title: 'EMERGENCY WARP PASS',
    category: 'orbit',
    tag: '1-2 Passes / Mo',
    summary: 'Streak protection',
    description: 'Missed a streak day? Don\'t panic! Your Emergency Warp Pass protects your streak from resetting (1-2 free passes per month).',
    color: 'cyan'
  },
  {
    id: 6,
    number: 6,
    title: 'THE SILENT TRAVELER RULE',
    category: 'community',
    tag: 'Discovery Priority',
    summary: 'Engagement incentive',
    description: 'Lurkers who only consume content without interacting experience slightly lower discovery visibility. Active contributors are prioritized!',
    color: 'slate'
  },
  {
    id: 7,
    number: 7,
    title: 'FREQUENCY BOOST',
    category: 'community',
    tag: '+Visibility',
    summary: 'Quality multiplier',
    description: 'Helpful posts, meaningful discussions, and positive interactions increase your Frequency Level %. Higher frequency = higher reach!',
    color: 'primary'
  },
  {
    id: 8,
    number: 8,
    title: 'PLANET OF THE WEEK',
    category: 'community',
    tag: 'Weekly Themes',
    summary: 'Coordinated discussions',
    description: 'Every week, Interstellers hosts a theme ("Show us your setup", "Song for space", "Embarrassing moment"). Share to earn bonus XP.',
    color: 'indigo'
  },
  {
    id: 9,
    number: 9,
    title: 'WEEKLY LEADERBOARD',
    category: 'community',
    tag: 'Weekly Resets',
    summary: 'Podium titles',
    description: 'Top contributors get Weekly Titles: 🥇 Galaxy Commander, 🥈 Star Captain, 🥉 Orbit Master. Resets weekly so new travelers can compete!',
    color: 'amber'
  },
  {
    id: 10,
    number: 10,
    title: 'FIRST CONTACT RULE',
    category: 'community',
    tag: 'First 24h',
    summary: 'Onboarding mission',
    description: 'New travelers receive a 24h mission: Introduce yourself + first post + interact with 2 travelers. Complete it → First Contact Badge.',
    color: 'cyan'
  },
  {
    id: 11,
    number: 11,
    title: 'WELCOME A STRANGER',
    category: 'community',
    tag: 'Mutual XP',
    summary: 'Reciprocal boost',
    description: 'Welcome a new traveler to the galaxy and get a response? Both travelers receive a mutual XP boost to foster real community friendship.',
    color: 'emerald'
  },
  {
    id: 12,
    number: 12,
    title: 'RESCUE MISSION',
    category: 'community',
    tag: 'Wake-Up Signal',
    summary: 'Reactivation alerts',
    description: 'When a friend has been inactive for 14+ days: "🚨 LOST TRAVELER DETECTED". Send them a Wake-Up Signal to bring them back into orbit!',
    color: 'purple'
  },
  {
    id: 13,
    number: 13,
    title: 'CONVERSATION QUALITY',
    category: 'guardian',
    tag: 'Anti-Spam AI',
    summary: 'Signal over noise',
    description: 'Low-effort spam is filtered. 1 thoughtful, meaningful comment grants more XP than 10 spam comments. Quality over raw volume!',
    color: 'amber'
  },
  {
    id: 14,
    number: 14,
    title: 'THREE-STRIKE AIRLOCK',
    category: 'guardian',
    tag: 'Graduated Penalties',
    summary: 'Progressive enforcement',
    description: 'Rule violations use a graduated scale: Strike 1: Warning | Strike 2: 24h Cooldown | Strike 3: Temporary Airlock.',
    color: 'rose'
  },
  {
    id: 15,
    number: 15,
    title: 'COMM BLACKOUT',
    category: 'guardian',
    tag: 'Harassment Ban',
    summary: 'Targeted mute',
    description: 'Repeated harassment triggers a Communication Blackout: traveler can browse content but cannot send direct messages or post comments.',
    color: 'rose'
  },
  {
    id: 16,
    number: 16,
    title: 'SHADOW ORBIT',
    category: 'guardian',
    tag: 'Minor Violations',
    summary: 'Soft quarantine',
    description: 'Instead of instant bans, minor rule violators enter Shadow Orbit (reduced discovery, lower posting limits). Good behavior restores full status.',
    color: 'purple'
  },
  {
    id: 17,
    number: 17,
    title: 'RARE BADGES',
    category: 'badges',
    tag: 'Achievements',
    summary: 'Hall of fame',
    description: 'Unlock rare badges: 🏆 100-Day Voyager, 🌌 Galaxy Legend, 🛰️ First Contact Pioneer, 🔥 Unbroken Orbit, 👑 Founding Traveler, ✍️ Cosmic Writer.',
    color: 'amber'
  },
  {
    id: 18,
    number: 18,
    title: 'AI GUARDIAN',
    category: 'guardian',
    tag: 'Proactive AI',
    summary: 'Real-time defense',
    description: 'AI Guardian monitors for spam, scams, harassment, and copy-paste posts. It flags content for review with graduated enforcement.',
    color: 'cyan'
  },
  {
    id: 19,
    number: 19,
    title: 'LINK QUARANTINE',
    category: 'guardian',
    tag: 'Link Scanner',
    summary: 'Zero-trust links',
    description: 'External web links are checked before appearing in public feeds: "⚠️ WARP LINK SCANNING..." ensuring 100% community security.',
    color: 'emerald'
  },
  {
    id: 20,
    number: 20,
    title: 'CLASSIFIED MISSIONS',
    category: 'badges',
    tag: 'Hidden Quests',
    summary: 'Easter eggs',
    description: 'Random secret missions appear in your orbit ("🚨 CLASSIFIED MISSION: Make someone laugh"). Complete them to unlock secret badges!',
    color: 'purple'
  }
];
