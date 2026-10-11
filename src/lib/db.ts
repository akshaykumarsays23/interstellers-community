import fs from 'fs';
import path from 'path';

export interface DbRegistration {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isAvatarLocked?: boolean;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface VerificationCodeEntry {
  code: string;
  expiresAt: number;
  name?: string;
  createdAt: number;
}

export interface VisitorSession {
  id: string;
  ip?: string;
  userAgent?: string;
  deviceType: 'Mobile' | 'Desktop' | 'Tablet';
  lastSeen: number;
  firstSeen: number;
}

export interface DeleteRequestInfo {
  requestedBy: string;
  requestedByName: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface DbMessage {
  id: string;
  senderId: string;
  senderHandle: string;
  senderName?: string;
  text: string;
  mediaUrl?: string;
  timestamp: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
  deleteRequest?: DeleteRequestInfo;
}

export interface MusicStats {
  totalPlays: number;
  userPlays: Record<string, number>;
  lastPlayedAt?: number;
}

export interface DbData {
  registrations: DbRegistration[];
  approvedEmails: string[];
  verificationCodes?: Record<string, VerificationCodeEntry>;
  posts?: any[];
  visitorSessions?: VisitorSession[];
  messages?: Record<string, DbMessage[]>;
  musicStats?: MusicStats;
}

import os from 'os';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');
const TMP_FILE = path.join(os.tmpdir(), 'interstellers_db.json');

const INITIAL_DB: DbData = {
  registrations: [],
  approvedEmails: ['akshaycricketer1230@gmail.com', 'akshay@interstellers.space', 'akshay@gmail.com', 'akshay'],
  verificationCodes: {},
  posts: [],
  visitorSessions: [],
  musicStats: {
    totalPlays: 24,
    userPlays: {},
  },
};

// In-memory runtime cache for serverless environments where disk writes are restricted
let inMemoryDb: DbData | null = null;

function ensureDbIntegrity(db: any): DbData {
  if (!db || typeof db !== 'object') {
    db = { ...INITIAL_DB };
  }
  if (!Array.isArray(db.registrations)) {
    db.registrations = [];
  }
  if (!Array.isArray(db.approvedEmails)) {
    db.approvedEmails = ['akshaycricketer1230@gmail.com', 'akshay@interstellers.space', 'akshay@gmail.com', 'akshay'];
  }
  if (!db.verificationCodes || typeof db.verificationCodes !== 'object') {
    db.verificationCodes = {};
  }
  if (!db.musicStats || typeof db.musicStats !== 'object') {
    db.musicStats = { totalPlays: 24, userPlays: {} };
  }
  if (typeof db.musicStats.totalPlays !== 'number') {
    db.musicStats.totalPlays = 24;
  }
  if (!db.musicStats.userPlays || typeof db.musicStats.userPlays !== 'object') {
    db.musicStats.userPlays = {};
  }
  return db as DbData;
}

export function getDb(): DbData {
  if (inMemoryDb) {
    return ensureDbIntegrity(inMemoryDb);
  }

  try {
    let parsed: any = null;

    // 1. Try reading bundled db.json
    if (fs.existsSync(DB_FILE)) {
      try {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        parsed = JSON.parse(content);
      } catch (e) {
        console.warn('[DB] Failed reading DB_FILE:', e);
      }
    }

    // 2. Try merging with ephemeral /tmp db if exists (for Vercel serverless writes)
    if (fs.existsSync(TMP_FILE)) {
      try {
        const tmpContent = fs.readFileSync(TMP_FILE, 'utf-8');
        const tmpParsed = JSON.parse(tmpContent);
        if (tmpParsed) {
          if (!parsed) {
            parsed = tmpParsed;
          } else {
            // Merge registrations
            if (Array.isArray(tmpParsed.registrations)) {
              const existingIds = new Set((parsed.registrations || []).map((r: any) => r.id || r.email));
              tmpParsed.registrations.forEach((r: any) => {
                if (!existingIds.has(r.id || r.email)) {
                  parsed.registrations.unshift(r);
                }
              });
            }
            // Merge approved emails
            if (Array.isArray(tmpParsed.approvedEmails)) {
              parsed.approvedEmails = Array.from(new Set([...(parsed.approvedEmails || []), ...tmpParsed.approvedEmails]));
            }
            // Merge verification codes
            if (tmpParsed.verificationCodes) {
              parsed.verificationCodes = { ...(parsed.verificationCodes || {}), ...tmpParsed.verificationCodes };
            }
            // Merge music stats
            if (tmpParsed.musicStats) {
              const currentTotal = Math.max(parsed.musicStats?.totalPlays || 0, tmpParsed.musicStats.totalPlays || 0);
              const mergedUserPlays = { ...(parsed.musicStats?.userPlays || {}), ...(tmpParsed.musicStats.userPlays || {}) };
              parsed.musicStats = { totalPlays: currentTotal, userPlays: mergedUserPlays, lastPlayedAt: tmpParsed.musicStats.lastPlayedAt };
            }
          }
        }
      } catch (e) {
        console.warn('[DB] Failed reading TMP_FILE:', e);
      }
    }

    if (!parsed) {
      parsed = { ...INITIAL_DB };
    }

    inMemoryDb = ensureDbIntegrity(parsed);
    return inMemoryDb;
  } catch (err) {
    console.error('Error reading db:', err);
    inMemoryDb = { ...INITIAL_DB };
    return inMemoryDb;
  }
}

export function saveDb(data: DbData) {
  try {
    const verifiedData = ensureDbIntegrity(data);
    inMemoryDb = verifiedData;

    // 1. Try writing to primary DB_FILE (local dev / persistent storage)
    let wrotePrimary = false;
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(verifiedData, null, 2), 'utf-8');
      wrotePrimary = true;
    } catch (err: any) {
      // On Vercel, filesystem is read-only (EROFS)
      console.warn('[DB] Primary file write skipped or read-only (expected on Vercel):', err?.message || err);
    }

    // 2. Write to /tmp if primary failed or for serverless warm persistence
    if (!wrotePrimary) {
      try {
        fs.writeFileSync(TMP_FILE, JSON.stringify(verifiedData, null, 2), 'utf-8');
      } catch (tmpErr) {
        console.warn('[DB] Fallback /tmp write error:', tmpErr);
      }
    }
  } catch (err) {
    console.error('Error saving db:', err);
  }
}
