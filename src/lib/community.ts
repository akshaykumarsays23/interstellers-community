import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { getDb } from '@/lib/db';
import { AuthConfigurationError, isAdminEmail, normalizeEmail, verifySessionToken } from '@/lib/auth';

export type HouseId = 'marvel' | 'dc' | 'pokemon' | 'power_rangers';
export type { PostCategory } from '@/lib/types';

export interface CommunityUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  handle: string;
  house?: HouseId;
  houseAssignedAt?: number;
}

export function isHouseId(value: unknown): value is HouseId {
  return value === 'marvel' || value === 'dc' || value === 'pokemon' || value === 'power_rangers';
}

export function getCommunitySql(): NeonQueryFunction<false, false> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is not configured');
  return neon(databaseUrl);
}

async function createCommunitySchema(
  sql: NeonQueryFunction<false, false>
): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS interstellers_post_likes (
      post_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (post_id, user_id)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS interstellers_post_comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS interstellers_point_transactions (
      idempotency_key TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_data JSONB NOT NULL,
      house TEXT,
      activity_type TEXT NOT NULL,
      related_id TEXT NOT NULL,
      points BIGINT NOT NULL CHECK (points > 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS interstellers_points_user_created_idx
    ON interstellers_point_transactions (user_id, created_at DESC)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS interstellers_points_house_created_idx
    ON interstellers_point_transactions (house, created_at DESC)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS interstellers_points_activity_created_idx
    ON interstellers_point_transactions (activity_type, created_at DESC)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS interstellers_points_related_activity_idx
    ON interstellers_point_transactions (related_id, activity_type)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS interstellers_comments_post_created_idx
    ON interstellers_post_comments (post_id, created_at)
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS interstellers_house_assignments (
      user_id TEXT PRIMARY KEY,
      house TEXT CHECK (house IS NULL OR house IN ('marvel', 'dc', 'pokemon', 'power_rangers')),
      character TEXT,
      house_changed_at TIMESTAMPTZ
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS interstellers_house_chat (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      house TEXT NOT NULL CHECK (house IN ('marvel', 'dc', 'pokemon', 'power_rangers')),
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS interstellers_house_chat_history_idx
    ON interstellers_house_chat (house, created_at DESC)
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS interstellers_posts (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    ALTER TABLE interstellers_posts
    ADD COLUMN IF NOT EXISTS created_by TEXT
  `;
  await sql`
    ALTER TABLE interstellers_posts
    ADD COLUMN IF NOT EXISTS house TEXT
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS interstellers_posts_created_idx
    ON interstellers_posts (created_at DESC)
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS interstellers_deleted_posts (
      id TEXT PRIMARY KEY,
      deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS interstellers_post_poll_votes (
      post_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      option_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (post_id, user_id)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS interstellers_house_challenge_attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      house TEXT NOT NULL CHECK (house IN ('marvel', 'dc', 'pokemon', 'power_rangers')),
      question_ids JSONB NOT NULL,
      option_order JSONB NOT NULL,
      draft_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
      status TEXT NOT NULL CHECK (status IN ('in_progress', 'submitted')),
      answers JSONB,
      correct_count INTEGER,
      points INTEGER,
      started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      submitted_at TIMESTAMPTZ
    )
  `;
  await sql`
    ALTER TABLE interstellers_house_challenge_attempts
    ADD COLUMN IF NOT EXISTS draft_answers JSONB NOT NULL DEFAULT '{}'::jsonb
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS interstellers_house_challenge_user_started_idx
    ON interstellers_house_challenge_attempts (user_id, started_at DESC)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS interstellers_house_challenge_house_submitted_idx
    ON interstellers_house_challenge_attempts (house, submitted_at DESC)
  `;
}

let communitySchemaPromise: Promise<void> | null = null;

export function ensureCommunitySchema(sql: NeonQueryFunction<false, false>): Promise<void> {
  if (!communitySchemaPromise) {
    communitySchemaPromise = createCommunitySchema(sql).catch((error) => {
      communitySchemaPromise = null;
      throw error;
    });
  }
  return communitySchemaPromise;
}

export function getCommunityUser(request: Request): CommunityUser | null {
  const cookieHeader = request.headers.get('cookie');
  const cookie = cookieHeader?.match(/(?:^|;\s*)interstellers_session=([^;]*)/)?.[1];
  const bearer = request.headers.get('authorization');
  const token = cookie
    ? decodeURIComponent(cookie)
    : bearer?.startsWith('Bearer ')
      ? bearer.slice(7)
      : null;
  let session: ReturnType<typeof verifySessionToken>;
  try {
    session = verifySessionToken(token);
  } catch (error) {
    if (!(error instanceof AuthConfigurationError)) throw error;
    console.error('Authentication configuration error: AUTH_SECRET is missing or invalid.');
    return null;
  }
  if (!session.valid || !session.user) return null;

  const email = normalizeEmail(session.user.email);
  const db = getDb();
  const isHost = isAdminEmail(email);
  const registration = db.registrations.find(
    (candidate) => normalizeEmail(candidate.email) === email
  );
  const isApproved =
    isHost ||
    registration?.status === 'approved' ||
    ((!registration || (registration.status !== 'pending' && registration.status !== 'rejected')) &&
      db.approvedEmails.some((approvedEmail) => normalizeEmail(approvedEmail) === email));

  if (!isApproved) return null;

  return {
    id: isHost
      ? 'user_host'
      : registration?.id || `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
    name: isHost ? 'Akshay Kumar' : registration?.name || session.user.name,
    email,
    avatar: registration?.avatar || (isHost ? '/avatar.png' : ''),
    role: isHost ? 'Host Admin' : 'Community Member',
    handle: (registration?.name || session.user.name).toLowerCase().replace(/\s+/g, '_'),
    house: registration?.house,
    houseAssignedAt: registration?.houseAssignedAt,
  };
}

export function makePostAuthor(user: CommunityUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    handle: user.handle,
    avatar: user.avatar,
    bio: '',
    role: user.role,
    status: 'online' as const,
    isVerified: true,
    house: user.house,
    houseAssignedAt: user.houseAssignedAt,
  };
}

export async function ensureHouseAssignment(
  sql: NeonQueryFunction<false, false>,
  user: CommunityUser
): Promise<{ house: HouseId | null; character: string | null; houseAssignedAt: number | null }> {
  const legacyTimestamp = user.house
    ? new Date(user.houseAssignedAt ?? Date.now()).toISOString()
    : null;
  await sql`
    INSERT INTO interstellers_house_assignments (user_id, house, character, house_changed_at)
    VALUES (${user.id}, ${user.house ?? null}, NULL, ${legacyTimestamp}::timestamptz)
    ON CONFLICT (user_id) DO NOTHING
  `;
  const rows = await sql`
    SELECT house, character, house_changed_at
    FROM interstellers_house_assignments
    WHERE user_id = ${user.id}
  `;
  const row = rows[0];
  return {
    house: isHouseId(row?.house) ? row.house : null,
    character: typeof row?.character === 'string' ? row.character : null,
    houseAssignedAt: row?.house_changed_at ? new Date(row.house_changed_at as string).getTime() : null,
  };
}

export async function getHouseScores(
  sql: NeonQueryFunction<false, false>
): Promise<Record<HouseId, number>> {
  const scores: Record<HouseId, number> = {
    marvel: 0,
    dc: 0,
    pokemon: 0,
    power_rangers: 0,
  };
  const rows = await sql`
    SELECT house, COALESCE(SUM(points), 0)::float8 AS points
    FROM interstellers_point_transactions
    WHERE house IS NOT NULL
    GROUP BY house
  `;
  for (const row of rows) {
    if (isHouseId(row.house)) scores[row.house] = Number(row.points);
  }
  return scores;
}

export async function getHouseMemberCounts(
  sql: NeonQueryFunction<false, false>
): Promise<Record<HouseId, number>> {
  const counts: Record<HouseId, number> = {
    marvel: 0,
    dc: 0,
    pokemon: 0,
    power_rangers: 0,
  };
  const rows = await sql`
    SELECT house, COUNT(*)::int AS members
    FROM interstellers_house_assignments
    WHERE house IS NOT NULL
    GROUP BY house
  `;
  for (const row of rows) {
    if (isHouseId(row.house)) counts[row.house] = Number(row.members);
  }
  return counts;
}

export async function awardHousePoints(
  sql: NeonQueryFunction<false, false>,
  user: CommunityUser,
  house: HouseId,
  activityType: string,
  relatedId: string,
  points: number
): Promise<boolean> {
  const key = `${user.id}:${activityType}:${relatedId}`;
  const inserted = await sql`
    INSERT INTO interstellers_point_transactions (
      idempotency_key, user_id, user_data, house, activity_type, related_id, points
    )
    VALUES (
      ${key},
      ${user.id},
      ${JSON.stringify({ name: user.name, handle: user.handle, avatar: user.avatar })}::jsonb,
      ${house},
      ${activityType},
      ${relatedId},
      ${points}
    )
    ON CONFLICT (idempotency_key) DO NOTHING
    RETURNING idempotency_key
  `;
  return inserted.length > 0;
}
