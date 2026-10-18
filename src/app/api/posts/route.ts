 import { NextResponse } from 'next/server';
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getSql(): NeonQueryFunction<false, false> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not configured');
  }
  return neon(url);
}

interface Post {
  id: string;
  createdAt?: string;
  [key: string]: any;
}

async function readPosts(sql: NeonQueryFunction<false, false>) {
  const rows = await sql`
    SELECT data
    FROM interstellers_posts
    ORDER BY created_at DESC
  `;

  const deletedRows = await sql`
    SELECT id
    FROM interstellers_deleted_posts
  `;

  return {
    posts: rows.map((row) => row.data),
    deletedPostIds: deletedRows.map((row) => row.id),
  };
}

// GET: Retrieve posts and deleted-post IDs from Neon.
export async function GET() {
  try {
    const sql = getSql();
    const result = await readPosts(sql);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching posts from Neon:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST: Create or update posts in Neon.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sql = getSql();

    let incomingPosts: Post[] = [];

    if (Array.isArray(body.posts)) {
      incomingPosts = body.posts;
    } else if (body.post && typeof body.post.id === 'string') {
      incomingPosts = [body.post];
    } else {
      return NextResponse.json(
        { error: 'A post or posts array is required' },
        { status: 400 }
      );
    }

    for (const post of incomingPosts) {
      if (typeof post?.id !== 'string' || !post.id.trim()) {
        continue;
      }

      const createdAt =
        typeof post.createdAt === 'string' && !isNaN(Date.parse(post.createdAt))
          ? new Date(post.createdAt).toISOString()
          : new Date().toISOString();

      await sql`
        INSERT INTO interstellers_posts (id, data, created_at)
        VALUES (${post.id}, ${JSON.stringify(post)}::jsonb, ${createdAt}::timestamptz)
        ON CONFLICT (id) DO UPDATE
        SET data = EXCLUDED.data,
            created_at = EXCLUDED.created_at
        WHERE interstellers_posts.id NOT IN (
          SELECT id FROM interstellers_deleted_posts
        )
      `;
    }

    const result = await readPosts(sql);

    return NextResponse.json({
      success: true,
      posts: result.posts,
      deletedPostIds: result.deletedPostIds,
    });
  } catch (error) {
    console.error('Error saving posts to Neon:', error);
    return NextResponse.json({ error: 'Failed to save posts' }, { status: 500 });
  }
}

// DELETE: Record the deletion and remove the post from Neon.
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    let targetId = url.searchParams.get('id');

    if (!targetId) {
      if (request.headers.get('content-type')?.includes('application/json')) {
        try {
          const body = await request.json();
          targetId = body.postId || body.id;
        } catch {
          // Ignore if body is missing or invalid
        }
      }
    }

    if (typeof targetId !== 'string' || !targetId.trim()) {
      return NextResponse.json(
        { error: 'Post ID is required for deletion' },
        { status: 400 }
      );
    }

    const sql = getSql();

    await sql`
      INSERT INTO interstellers_deleted_posts (id)
      VALUES (${targetId})
      ON CONFLICT (id) DO NOTHING
    `;

    await sql`
      DELETE FROM interstellers_posts
      WHERE id = ${targetId}
    `;

    const deletedRows = await sql`
      SELECT id
      FROM interstellers_deleted_posts
    `;

    return NextResponse.json({
      success: true,
      deletedId: targetId,
      deletedPostIds: deletedRows.map((row) => row.id),
    });
  } catch (error) {
    console.error('Error deleting post from Neon:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}

