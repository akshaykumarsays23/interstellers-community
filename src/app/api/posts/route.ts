import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import {
  ensureCommunitySchema,
  ensureHouseAssignment,
  getCommunitySql,
  getCommunityUser,
  isHouseId,
  makePostAuthor,
} from '@/lib/community';
import { formatTime } from '@/lib/utils';
import type { Post } from '@/lib/types';

export const dynamic = 'force-dynamic';
const MAX_CONTENT_LENGTH = 5000;
const MAX_MEDIA_LENGTH = 2_000_000;
const MAX_FEED_POSTS = 100;

async function preparePosts(sql: ReturnType<typeof getCommunitySql>) {
  await ensureCommunitySchema(sql);
  await sql`
    UPDATE interstellers_posts
    SET created_by = data->'author'->>'id',
        house = CASE
          WHEN data->'author'->>'house' IN ('marvel', 'dc', 'pokemon', 'power_rangers')
          THEN data->'author'->>'house'
          ELSE NULL
        END
    WHERE created_by IS NULL
  `;
  const legacyDb = getDb();
  const deletedIds = Array.isArray(legacyDb.deletedPostIds) ? legacyDb.deletedPostIds : [];
  for (const id of deletedIds) {
    if (typeof id !== 'string' || !id) continue;
    await sql`
      INSERT INTO interstellers_deleted_posts (id)
      VALUES (${id})
      ON CONFLICT (id) DO NOTHING
    `;
    await sql`DELETE FROM interstellers_posts WHERE id = ${id}`;
  }
  for (const post of legacyDb.posts || []) {
    if (!post || typeof post.id !== 'string' || !post.id || deletedIds.includes(post.id)) continue;
    const createdAt = post.createdAt && !Number.isNaN(Date.parse(post.createdAt))
      ? new Date(post.createdAt).toISOString()
      : new Date().toISOString();
    const house = isHouseId(post.author?.house) ? post.author.house : null;
    await sql`
      INSERT INTO interstellers_posts (id, data, created_by, house, created_at)
      SELECT
        ${post.id},
        ${JSON.stringify(post)}::jsonb,
        ${typeof post.author?.id === 'string' ? post.author.id : null},
        ${house},
        ${createdAt}::timestamptz
      WHERE NOT EXISTS (
        SELECT 1 FROM interstellers_deleted_posts WHERE id = ${post.id}
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }
}

function validPostId(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 160;
}

export async function GET(request: Request) {
  const user = getCommunityUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const sql = getCommunitySql();
    await preparePosts(sql);
    const house = new URL(request.url).searchParams.get('house');
    if (house && !isHouseId(house)) {
      return NextResponse.json({ error: 'Invalid House filter.' }, { status: 400 });
    }
    const rows = house
      ? await sql`
          SELECT p.data, EXISTS (
            SELECT 1 FROM interstellers_post_likes l
            WHERE l.post_id = p.id AND l.user_id = ${user.id}
          ) AS is_liked, (
            SELECT option_id FROM interstellers_post_poll_votes v
            WHERE v.post_id = p.id AND v.user_id = ${user.id}
          ) AS poll_vote
          FROM interstellers_posts p
          WHERE p.house = ${house}
            AND NOT EXISTS (SELECT 1 FROM interstellers_deleted_posts d WHERE d.id = p.id)
          ORDER BY p.created_at DESC
          LIMIT ${MAX_FEED_POSTS}
        `
      : await sql`
          SELECT p.data, EXISTS (
            SELECT 1 FROM interstellers_post_likes l
            WHERE l.post_id = p.id AND l.user_id = ${user.id}
          ) AS is_liked, (
            SELECT option_id FROM interstellers_post_poll_votes v
            WHERE v.post_id = p.id AND v.user_id = ${user.id}
          ) AS poll_vote
          FROM interstellers_posts p
          WHERE NOT EXISTS (SELECT 1 FROM interstellers_deleted_posts d WHERE d.id = p.id)
          ORDER BY p.created_at DESC
          LIMIT ${MAX_FEED_POSTS}
        `;
    const deleted = await sql`SELECT id FROM interstellers_deleted_posts`;
    return NextResponse.json(
      {
        posts: rows.map((row) => {
          const post = { ...(row.data as Post), isLiked: row.is_liked === true };
          if (post.poll) post.poll.userVotedOptionId = (row.poll_vote as string | null) || undefined;
          return post;
        }),
        deletedPostIds: deleted.map((row) => row.id),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Post fetch failed:', error);
    return NextResponse.json({ error: 'Posts are temporarily unavailable.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = getCommunityUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'A post action is required.' }, { status: 400 });
    }
    const sql = getCommunitySql();
    await preparePosts(sql);

    if (body.action === 'migrate_legacy') {
      if (!Array.isArray(body.posts) || body.posts.length > 100) {
        return NextResponse.json({ error: 'Legacy post migration is limited to 100 posts.' }, { status: 400 });
      }
      const assignment = await ensureHouseAssignment(sql, user);
      let migrated = 0;
      for (const legacy of body.posts) {
        if (
          !legacy ||
          typeof legacy.id !== 'string' ||
          legacy.id.length > 160 ||
          (legacy.author?.id !== user.id &&
            legacy.author?.email?.toLowerCase() !== user.email &&
            legacy.author?.handle?.toLowerCase() !== user.handle.toLowerCase()) ||
          typeof legacy.content !== 'string' ||
          !legacy.content.trim() ||
          legacy.content.length > MAX_CONTENT_LENGTH ||
          (legacy.mediaUrl && (typeof legacy.mediaUrl !== 'string' || legacy.mediaUrl.length > MAX_MEDIA_LENGTH))
        ) continue;

        const post: Post = {
          id: legacy.id,
          author: { ...makePostAuthor(user), house: assignment.house ?? undefined },
          content: legacy.content.trim(),
          createdAt: legacy.createdAt && !Number.isNaN(Date.parse(legacy.createdAt))
            ? new Date(legacy.createdAt).toISOString()
            : new Date().toISOString(),
          timestamp: typeof legacy.timestamp === 'string' ? legacy.timestamp.slice(0, 80) : formatTime(),
          likes: Number.isInteger(legacy.likes) ? Math.max(0, legacy.likes) : 0,
          commentsCount: Number.isInteger(legacy.commentsCount) ? Math.max(0, legacy.commentsCount) : 0,
          sharesCount: Number.isInteger(legacy.sharesCount) ? Math.max(0, legacy.sharesCount) : 0,
          mediaUrl: typeof legacy.mediaUrl === 'string' ? legacy.mediaUrl : undefined,
          mediaType: legacy.mediaType === 'video' || legacy.mediaType === 'link' ? legacy.mediaType : 'image',
          tags: Array.isArray(legacy.tags)
            ? legacy.tags.filter((tag: unknown): tag is string => typeof tag === 'string').slice(0, 10)
            : [],
          comments: Array.isArray(legacy.comments) ? legacy.comments.slice(-100) : [],
          poll: legacy.poll,
          isLiked: false,
          isBookmarked: false,
        };
        const result = await sql`
          INSERT INTO interstellers_posts (id, data, created_by, house, created_at)
          SELECT ${post.id}, ${JSON.stringify(post)}::jsonb, ${user.id}, ${assignment.house},
            ${post.createdAt}::timestamptz
          WHERE NOT EXISTS (
            SELECT 1 FROM interstellers_deleted_posts WHERE id = ${post.id}
          )
          ON CONFLICT (id) DO NOTHING
          RETURNING id
        `;
        if (result.length) migrated++;
        else {
          await sql`
            UPDATE interstellers_posts
            SET created_by = ${user.id}, house = ${assignment.house}
            WHERE id = ${post.id}
              AND (created_by IS NULL OR data->'author'->>'email' = ${user.email}
                OR data->'author'->>'handle' = ${user.handle})
          `;
        }
      }
      return NextResponse.json({ success: true, migrated });
    }

    if (body.action === 'create') {
      const content = typeof body.content === 'string' ? body.content.trim() : '';
      if (!content || content.length > MAX_CONTENT_LENGTH) {
        return NextResponse.json({ error: 'Post text must contain 1–5000 characters.' }, { status: 400 });
      }
      if (body.mediaUrl !== undefined && body.mediaUrl !== null &&
        (typeof body.mediaUrl !== 'string' || body.mediaUrl.length > MAX_MEDIA_LENGTH)) {
        return NextResponse.json({ error: 'Post media exceeds the 2 MB limit.' }, { status: 413 });
      }
      const assignment = await ensureHouseAssignment(sql, user);
      const post: Post = {
        id: `post_${randomUUID()}`,
        author: { ...makePostAuthor(user), house: assignment.house ?? undefined },
        content,
        createdAt: new Date().toISOString(),
        timestamp: formatTime(),
        likes: 0,
        commentsCount: 0,
        sharesCount: 0,
        isLiked: false,
        isBookmarked: false,
        mediaUrl: typeof body.mediaUrl === 'string' ? body.mediaUrl : undefined,
        mediaType: body.mediaType === 'video' ? 'video' : body.mediaType === 'image' ? 'image' : undefined,
        tags: Array.isArray(body.tags)
          ? body.tags.filter((tag: unknown): tag is string => typeof tag === 'string').slice(0, 10)
          : [],
        comments: [],
      };
      await sql`
        INSERT INTO interstellers_posts (id, data, created_by, house, created_at)
        VALUES (${post.id}, ${JSON.stringify(post)}::jsonb, ${user.id}, ${assignment.house}, ${post.createdAt}::timestamptz)
      `;
      return NextResponse.json({ success: true, post }, { status: 201 });
    }

    if (body.action === 'update') {
      if (!validPostId(body.postId)) return NextResponse.json({ error: 'A valid post ID is required.' }, { status: 400 });
      const content = typeof body.content === 'string' ? body.content.trim() : '';
      if (!content || content.length > MAX_CONTENT_LENGTH) {
        return NextResponse.json({ error: 'Post text must contain 1–5000 characters.' }, { status: 400 });
      }
      if (body.mediaUrl !== undefined && body.mediaUrl !== null &&
        (typeof body.mediaUrl !== 'string' || body.mediaUrl.length > MAX_MEDIA_LENGTH)) {
        return NextResponse.json({ error: 'Post media exceeds the 2 MB limit.' }, { status: 413 });
      }
      const rows = body.mediaUrl === undefined
        ? await sql`
            UPDATE interstellers_posts
            SET data = jsonb_set(data, '{content}', to_jsonb(${content}::text), true)
            WHERE id = ${body.postId} AND created_by = ${user.id}
            RETURNING data
          `
        : await sql`
            UPDATE interstellers_posts
            SET data = jsonb_set(
              jsonb_set(data, '{content}', to_jsonb(${content}::text), true),
              '{mediaUrl}', ${body.mediaUrl === null ? 'null' : JSON.stringify(body.mediaUrl)}::jsonb, true
            )
            WHERE id = ${body.postId} AND created_by = ${user.id}
            RETURNING data
          `;
      if (!rows.length) return NextResponse.json({ error: 'Post not found or not owned by you.' }, { status: 404 });
      return NextResponse.json({ success: true, post: rows[0].data });
    }

    if (body.action === 'like') {
      if (!validPostId(body.postId)) return NextResponse.json({ error: 'A valid post ID is required.' }, { status: 400 });
      const rows = await sql`
        WITH removed AS (
          DELETE FROM interstellers_post_likes
          WHERE post_id = ${body.postId} AND user_id = ${user.id}
          RETURNING post_id
        ),
        added AS (
          INSERT INTO interstellers_post_likes (post_id, user_id)
          SELECT ${body.postId}, ${user.id}
          WHERE NOT EXISTS (SELECT 1 FROM removed)
            AND EXISTS (SELECT 1 FROM interstellers_posts WHERE id = ${body.postId})
          ON CONFLICT (post_id, user_id) DO NOTHING
          RETURNING post_id
        ),
        changed AS (
          UPDATE interstellers_posts
          SET data = jsonb_set(
            data,
            '{likes}',
            to_jsonb(GREATEST(0, COALESCE((data->>'likes')::int, 0)
              + CASE WHEN EXISTS (SELECT 1 FROM added) THEN 1 ELSE -1 END)),
            true
          )
          WHERE id = ${body.postId}
            AND (EXISTS (SELECT 1 FROM added) OR EXISTS (SELECT 1 FROM removed))
          RETURNING data
        )
        SELECT data, EXISTS (SELECT 1 FROM added) AS is_liked FROM changed
      `;
      if (!rows.length) return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
      return NextResponse.json({ success: true, post: { ...(rows[0].data as Post), isLiked: rows[0].is_liked } });
    }

    if (body.action === 'comment') {
      if (!validPostId(body.postId)) return NextResponse.json({ error: 'A valid post ID is required.' }, { status: 400 });
      const content = typeof body.content === 'string' ? body.content.trim() : '';
      if (!content || content.length > 1000) {
        return NextResponse.json({ error: 'Comments must contain 1–1000 characters.' }, { status: 400 });
      }
      const comment = {
        id: `comment_${randomUUID()}`,
        author: makePostAuthor(user),
        content,
        timestamp: formatTime(),
        likes: 0,
      };
      const rows = await sql`
        UPDATE interstellers_posts
        SET data = jsonb_set(
          jsonb_set(
            data,
            '{comments}',
            COALESCE(data->'comments', '[]'::jsonb) || ${JSON.stringify(comment)}::jsonb,
            true
          ),
          '{commentsCount}',
          to_jsonb(COALESCE((data->>'commentsCount')::int, 0) + 1),
          true
        )
        WHERE id = ${body.postId}
        RETURNING data
      `;
      if (!rows.length) return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
      return NextResponse.json({ success: true, post: rows[0].data });
    }

    if (body.action === 'poll') {
      if (!validPostId(body.postId) || typeof body.optionId !== 'string') {
        return NextResponse.json({ error: 'A valid poll option is required.' }, { status: 400 });
      }
      const postRows = await sql`SELECT data FROM interstellers_posts WHERE id = ${body.postId}`;
      const poll = (postRows[0]?.data as Post | undefined)?.poll;
      if (!poll || !poll.options.some((option) => option.id === body.optionId)) {
        return NextResponse.json({ error: 'Poll option not found.' }, { status: 404 });
      }
      const votes = await sql`
        INSERT INTO interstellers_post_poll_votes (post_id, user_id, option_id)
        VALUES (${body.postId}, ${user.id}, ${body.optionId})
        ON CONFLICT (post_id, user_id) DO NOTHING
        RETURNING option_id
      `;
      if (!votes.length) return NextResponse.json({ error: 'You have already voted in this poll.' }, { status: 409 });
      const updated = await sql`
        UPDATE interstellers_posts
        SET data = jsonb_set(
          data,
          '{poll}',
          jsonb_set(
            jsonb_set(
              data->'poll',
              '{options}',
              (
                SELECT jsonb_agg(
                  CASE WHEN option.value->>'id' = ${body.optionId}
                    THEN jsonb_set(option.value, '{votes}', to_jsonb(COALESCE((option.value->>'votes')::int, 0) + 1), true)
                    ELSE option.value
                  END ORDER BY option.ordinality
                )
                FROM jsonb_array_elements(data->'poll'->'options') WITH ORDINALITY AS option(value, ordinality)
              ),
              true
            ),
            '{totalVotes}',
            to_jsonb(COALESCE((data->'poll'->>'totalVotes')::int, 0) + 1),
            true
          ),
          true
        )
        WHERE id = ${body.postId}
        RETURNING data
      `;
      if (!updated.length) return NextResponse.json({ error: 'Poll not found.' }, { status: 404 });
      return NextResponse.json({
        success: true,
        post: {
          ...(updated[0].data as Post),
          poll: { ...(updated[0].data as Post).poll!, userVotedOptionId: body.optionId },
        },
      });
    }

    return NextResponse.json({ error: 'Unsupported post action.' }, { status: 400 });
  } catch (error) {
    console.error('Post operation failed:', error);
    return NextResponse.json({ error: 'Post operation failed. Please try again.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = getCommunityUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const postId = new URL(request.url).searchParams.get('id');
    if (!validPostId(postId)) return NextResponse.json({ error: 'A valid post ID is required.' }, { status: 400 });
    const sql = getCommunitySql();
    await preparePosts(sql);
    const deleted = await sql`
      DELETE FROM interstellers_posts
      WHERE id = ${postId} AND created_by = ${user.id}
      RETURNING id
    `;
    if (!deleted.length) return NextResponse.json({ error: 'Post not found or not owned by you.' }, { status: 404 });
    await sql`
      INSERT INTO interstellers_deleted_posts (id)
      VALUES (${postId})
      ON CONFLICT (id) DO NOTHING
    `;
    return NextResponse.json({ success: true, deletedId: postId });
  } catch (error) {
    console.error('Post deletion failed:', error);
    return NextResponse.json({ error: 'Post could not be deleted. Please try again.' }, { status: 500 });
  }
}
