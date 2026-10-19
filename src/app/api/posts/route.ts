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
const POST_BASE_POINTS = {
  text: 100,
  image: 200,
  theory: 300,
  singing: 500,
  dancing: 500,
} as const;
const POST_CATEGORIES = Object.keys(POST_BASE_POINTS) as (keyof typeof POST_BASE_POINTS)[];

async function preparePosts(sql: ReturnType<typeof getCommunitySql>) {
  await ensureCommunitySchema(sql);
  await sql`
    UPDATE interstellers_posts
    SET created_by = COALESCE(created_by, data->'author'->>'id'),
        house = CASE
          WHEN data->'author'->>'house' IN ('marvel', 'dc', 'pokemon', 'power_rangers')
          THEN data->'author'->>'house'
          ELSE house
        END
    WHERE created_by IS NULL
      OR (
        house IS NULL
        AND data->'author'->>'house' IN ('marvel', 'dc', 'pokemon', 'power_rangers')
      )
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
    const url = new URL(request.url);
    const house = url.searchParams.get('house');
    const category = url.searchParams.get('category');
    if (house && !isHouseId(house)) {
      return NextResponse.json({ error: 'Invalid House filter.' }, { status: 400 });
    }
    if (category && !POST_CATEGORIES.includes(category as keyof typeof POST_BASE_POINTS)) {
      return NextResponse.json({ error: 'Invalid post category filter.' }, { status: 400 });
    }
    if (house) {
      const assignment = await ensureHouseAssignment(sql, user);
      if (assignment.house !== house) {
        return NextResponse.json({ error: 'You can only access your assigned House feed.' }, { status: 403 });
      }
    }
    const rows = await sql`
      SELECT p.data, EXISTS (
        SELECT 1 FROM interstellers_post_likes l
        WHERE l.post_id = p.id AND l.user_id = ${user.id}
      ) AS is_liked, (
        SELECT option_id FROM interstellers_post_poll_votes v
        WHERE v.post_id = p.id AND v.user_id = ${user.id}
      ) AS poll_vote
      FROM interstellers_posts p
      WHERE (${house}::text IS NULL OR p.house = ${house})
        AND (${category}::text IS NULL OR p.data->>'category' = ${category})
        AND NOT EXISTS (SELECT 1 FROM interstellers_deleted_posts d WHERE d.id = p.id)
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
      if (typeof body.requestId !== 'string' || !/^[a-zA-Z0-9_-]{8,100}$/.test(body.requestId)) {
        return NextResponse.json({ error: 'A valid post request ID is required.' }, { status: 400 });
      }
      const content = typeof body.content === 'string' ? body.content.trim() : '';
      if (!content || content.length > MAX_CONTENT_LENGTH) {
        return NextResponse.json({ error: 'Post text must contain 1–5000 characters.' }, { status: 400 });
      }
      if (body.mediaUrl !== undefined && body.mediaUrl !== null &&
        (typeof body.mediaUrl !== 'string' || body.mediaUrl.length > MAX_MEDIA_LENGTH)) {
        return NextResponse.json({ error: 'Post media exceeds the 2 MB limit.' }, { status: 413 });
      }
      const category = body.category === undefined
        ? body.mediaType === 'image' ? 'image' : 'text'
        : body.category;
      if (typeof category !== 'string' || !POST_CATEGORIES.includes(category as keyof typeof POST_BASE_POINTS)) {
        return NextResponse.json({ error: 'Choose a valid post category.' }, { status: 400 });
      }
      const title = typeof body.title === 'string' ? body.title.trim() : '';
      if (title.length > 120) {
        return NextResponse.json({ error: 'Post titles may contain up to 120 characters.' }, { status: 400 });
      }
      const mediaUrl = typeof body.mediaUrl === 'string' ? body.mediaUrl : '';
      const mediaType = body.mediaType === 'video' ? 'video' : body.mediaType === 'image' ? 'image' : undefined;
      if (category === 'image' && (!mediaUrl || mediaType !== 'image')) {
        return NextResponse.json({ error: 'Image posts require image media.' }, { status: 400 });
      }
      if (category === 'theory' && content.length < 280) {
        return NextResponse.json({ error: 'Theory and discussion posts must contain at least 280 characters.' }, { status: 400 });
      }
      if (category === 'singing' || category === 'dancing') {
        const isVideoMedia = mediaType === 'video' &&
          (/^data:video\//i.test(mediaUrl) || /\.(mp4|webm|ogg|mov)(?:$|[?#])/i.test(mediaUrl));
        if (title.length < 3 || content.length < 20 || !isVideoMedia) {
          return NextResponse.json({
            error: 'Performances need a title, a description of at least 20 characters, and supported video media.',
          }, { status: 400 });
        }
      }
      const assignment = await ensureHouseAssignment(sql, user);
      const post: Post = {
        id: `post_${body.requestId}`,
        author: { ...makePostAuthor(user), house: assignment.house ?? undefined },
        content,
        category: category as Post['category'],
        ...(title ? { title } : {}),
        createdAt: new Date().toISOString(),
        timestamp: formatTime(),
        likes: 0,
        commentsCount: 0,
        sharesCount: 0,
        isLiked: false,
        isBookmarked: false,
        mediaUrl: mediaUrl || undefined,
        mediaType,
        tags: Array.isArray(body.tags)
          ? body.tags.filter((tag: unknown): tag is string => typeof tag === 'string').slice(0, 10)
          : [],
        comments: [],
      };
      const created = await sql`
        WITH inserted AS (
          INSERT INTO interstellers_posts (id, data, created_by, house, created_at)
          VALUES (${post.id}, ${JSON.stringify(post)}::jsonb, ${user.id}, ${assignment.house}, ${post.createdAt}::timestamptz)
          ON CONFLICT (id) DO NOTHING
          RETURNING id
        ),
        reward AS (
          INSERT INTO interstellers_point_transactions (
            idempotency_key, user_id, user_data, house, activity_type, related_id, points
          )
          SELECT
            ${`post_base:${post.id}`},
            ${user.id},
            ${JSON.stringify({ name: user.name, handle: user.handle, avatar: user.avatar })}::jsonb,
            ${assignment.house},
            ${`post_base_${category}`},
            inserted.id,
            ${POST_BASE_POINTS[category as keyof typeof POST_BASE_POINTS]}
          FROM inserted
          ON CONFLICT (idempotency_key) DO NOTHING
          RETURNING idempotency_key
        )
        SELECT id FROM inserted
      `;
      if (!created.length) {
        const existing = await sql`
          SELECT data FROM interstellers_posts
          WHERE id = ${post.id} AND created_by = ${user.id}
        `;
        if (!existing.length) {
          return NextResponse.json({ error: 'This post request ID is already in use.' }, { status: 409 });
        }
        return NextResponse.json({ success: true, duplicate: true, post: existing[0].data });
      }
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
      if (typeof body.liked !== 'boolean') {
        return NextResponse.json({ error: 'A target like state is required.' }, { status: 400 });
      }
      const rows = await sql`
        WITH removed AS (
          DELETE FROM interstellers_post_likes
          WHERE post_id = ${body.postId} AND user_id = ${user.id}
            AND ${body.liked === false}
          RETURNING post_id
        ),
        added AS (
          INSERT INTO interstellers_post_likes (post_id, user_id)
          SELECT ${body.postId}, ${user.id}
          WHERE ${body.liked === true}
            AND EXISTS (SELECT 1 FROM interstellers_posts WHERE id = ${body.postId})
          ON CONFLICT (post_id, user_id) DO NOTHING
          RETURNING post_id
        ),
        reward AS (
          INSERT INTO interstellers_point_transactions (
            idempotency_key, user_id, user_data, house, activity_type, related_id, points
          )
          SELECT
            ${`post_like:${body.postId}:${user.id}`},
            p.created_by,
            jsonb_build_object(
              'name', p.data->'author'->>'name',
              'handle', p.data->'author'->>'handle',
              'avatar', p.data->'author'->>'avatar'
            ),
            p.house,
            'post_like',
            p.id,
            100
          FROM added
          JOIN interstellers_posts p ON p.id = added.post_id
          WHERE p.created_by IS NOT NULL AND p.created_by <> ${user.id}
          ON CONFLICT (idempotency_key) DO NOTHING
          RETURNING idempotency_key
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
        SELECT COALESCE((SELECT data FROM changed), p.data) AS data,
          EXISTS (
            SELECT 1 FROM interstellers_post_likes l
            WHERE l.post_id = p.id AND l.user_id = ${user.id}
          ) AS is_liked
        FROM interstellers_posts p
        WHERE p.id = ${body.postId}
      `;
      if (!rows.length) return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
      return NextResponse.json({ success: true, post: { ...(rows[0].data as Post), isLiked: body.liked } });
    }

    if (body.action === 'comment') {
      if (!validPostId(body.postId)) return NextResponse.json({ error: 'A valid post ID is required.' }, { status: 400 });
      if (typeof body.requestId !== 'string' || !/^[a-zA-Z0-9_-]{8,100}$/.test(body.requestId)) {
        return NextResponse.json({ error: 'A valid comment request ID is required.' }, { status: 400 });
      }
      const content = typeof body.content === 'string' ? body.content.trim() : '';
      if (!content || content.length > 1000) {
        return NextResponse.json({ error: 'Comments must contain 1–1000 characters.' }, { status: 400 });
      }
      const meaningful = content.replace(/\s/g, '').length >= 20 && content.split(/\s+/).length >= 4;
      const comment = {
        id: `comment_${randomUUID()}`,
        author: makePostAuthor(user),
        content,
        timestamp: formatTime(),
        likes: 0,
        requestId: body.requestId,
      };
      const rows = await sql`
        WITH updated AS (
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
            AND NOT EXISTS (
              SELECT 1
              FROM jsonb_array_elements(COALESCE(data->'comments', '[]'::jsonb)) AS existing(value)
              WHERE existing.value->>'requestId' = ${body.requestId}
                AND existing.value->'author'->>'id' = ${user.id}
            )
          RETURNING data, id, created_by, house
        ),
        reward AS (
          INSERT INTO interstellers_point_transactions (
            idempotency_key, user_id, user_data, house, activity_type, related_id, points
          )
          SELECT
            ${`post_comment:${body.postId}:${user.id}`},
            updated.created_by,
            jsonb_build_object(
              'name', updated.data->'author'->>'name',
              'handle', updated.data->'author'->>'handle',
              'avatar', updated.data->'author'->>'avatar'
            ),
            updated.house,
            'post_comment',
            updated.id,
            200
          FROM updated
          WHERE ${meaningful} AND updated.created_by IS NOT NULL AND updated.created_by <> ${user.id}
          ON CONFLICT (idempotency_key) DO NOTHING
          RETURNING idempotency_key
        )
        SELECT COALESCE((SELECT data FROM updated), p.data) AS data
        FROM interstellers_posts p
        WHERE p.id = ${body.postId}
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
