import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import {
  ensureCommunitySchema,
  ensureHouseAssignment,
  getCommunitySql,
  getCommunityUser,
  isHouseId,
} from '@/lib/community';

export const dynamic = 'force-dynamic';

const HOUSE_LOCK_MS = 30 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  const user = getCommunityUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'A profile object is required.' }, { status: 400 });
    }

    let houseAssignment: { house: string; character: string | null; houseAssignedAt: number } | null = null;
    if (body.house !== undefined) {
      if (!isHouseId(body.house)) {
        return NextResponse.json({ error: 'Choose one of the four available Houses.' }, { status: 400 });
      }
      if (typeof body.character !== 'string' || !body.character.trim() || body.character.length > 80) {
        return NextResponse.json({ error: 'A valid House champion is required.' }, { status: 400 });
      }

      const sql = getCommunitySql();
      await ensureCommunitySchema(sql);
      const current = await ensureHouseAssignment(sql, user);
      if (current.house === body.house) {
        return NextResponse.json({
          success: true,
          house: current.house,
          character: current.character || body.character.trim(),
          houseAssignedAt: current.houseAssignedAt,
          unchanged: true,
        });
      }

      const updated = await sql`
        WITH changed AS (
          UPDATE interstellers_house_assignments
          SET house = ${body.house},
              character = ${body.character.trim()},
              house_changed_at = NOW()
          WHERE user_id = ${user.id}
            AND (
              house IS NULL
              OR house_changed_at <= NOW() - INTERVAL '30 days'
            )
          RETURNING house, character, house_changed_at
        ),
        house_points AS (
          INSERT INTO interstellers_point_transactions (
            idempotency_key, user_id, user_data, house, activity_type, related_id, points
          )
          SELECT
            ${user.id} || ':house_selection:' || EXTRACT(EPOCH FROM changed.house_changed_at)::text,
            ${user.id},
            ${JSON.stringify({ name: user.name, handle: user.handle, avatar: user.avatar })}::jsonb,
            changed.house,
            'house_selection',
            EXTRACT(EPOCH FROM changed.house_changed_at)::text,
            100
          FROM changed
          ON CONFLICT (idempotency_key) DO NOTHING
        )
        SELECT house, character, house_changed_at FROM changed
      `;

      if (updated.length === 0) {
        const expires = current.houseAssignedAt === null
          ? null
          : current.houseAssignedAt + HOUSE_LOCK_MS;
        const remaining = expires === null ? 0 : Math.max(0, expires - Date.now());
        return NextResponse.json(
          {
            error: 'Your House selection is locked for 30 days. You can change Houses after the current residency ends.',
            house: current.house,
            houseAssignedAt: current.houseAssignedAt,
            lockExpiresAt: expires,
            remainingMs: remaining,
          },
          { status: 409 }
        );
      }

      houseAssignment = {
        house: updated[0].house as string,
        character: updated[0].character as string,
        houseAssignedAt: new Date(updated[0].house_changed_at as string).getTime(),
      };
    }

    const db = getDb();
    const registration = db.registrations.find((entry) => entry.email.toLowerCase() === user.email);
    if (registration) {
      if (typeof body.name === 'string') registration.name = body.name.slice(0, 80);
      if (typeof body.bio === 'string') registration.bio = body.bio.slice(0, 1000);
      if (typeof body.role === 'string') registration.role = body.role.slice(0, 80);
      if (typeof body.avatar === 'string') registration.avatar = body.avatar.slice(0, 2_000_000);
      if (houseAssignment) {
        registration.house = houseAssignment.house as typeof registration.house;
        registration.houseAssignedAt = houseAssignment.houseAssignedAt;
      }
    }
    saveDb(db);
    if (typeof body.avatar === 'string') {
      const sql = getCommunitySql();
      await ensureCommunitySchema(sql);
      await sql`
        UPDATE interstellers_posts
        SET data = jsonb_set(data, '{author,avatar}', to_jsonb(${body.avatar.slice(0, 2_000_000)}::text), true)
        WHERE created_by = ${user.id}
      `;
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated.',
      ...(houseAssignment ?? {}),
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Profile update failed. Please try again.' }, { status: 500 });
  }
}
