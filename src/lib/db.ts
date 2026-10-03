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

export interface DbData {
  registrations: DbRegistration[];
  approvedEmails: string[];
  verificationCodes?: Record<string, VerificationCodeEntry>;
  posts?: any[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

const INITIAL_DB: DbData = {
  registrations: [],
  approvedEmails: ['akshaycricketer1230@gmail.com', 'akshay@interstellers.space', 'akshay@gmail.com', 'akshay'],
  verificationCodes: {},
  posts: [],
};

export function getDb(): DbData {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
      return INITIAL_DB;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (!parsed.verificationCodes) {
      parsed.verificationCodes = {};
    }
    return parsed;
  } catch (err) {
    console.error('Error reading db:', err);
    return INITIAL_DB;
  }
}

export function saveDb(data: DbData) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db:', err);
  }
}
