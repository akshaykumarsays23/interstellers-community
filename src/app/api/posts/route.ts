import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const deletedSet = new Set(db.deletedPostIds || []);
    const validPosts = (db.posts || []).filter((p: any) => p && !deletedSet.has(p.id));

    return NextResponse.json({
      posts: validPosts,
      deletedPostIds: db.deletedPostIds || [],
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = getDb();
    const deletedSet = new Set(db.deletedPostIds || []);

    if (body.posts && Array.isArray(body.posts)) {
      // Filter out any post that was deleted
      db.posts = body.posts.filter((p: any) => p && !deletedSet.has(p.id));
    } else if (body.post && body.post.id) {
      if (!deletedSet.has(body.post.id)) {
        if (!db.posts) db.posts = [];
        const index = db.posts.findIndex((p: any) => p.id === body.post.id);
        if (index >= 0) {
          db.posts[index] = body.post;
        } else {
          db.posts.unshift(body.post);
        }
      }
    }

    saveDb(db);
    return NextResponse.json({ success: true, posts: db.posts || [] });
  } catch (error) {
    console.error('Error saving posts:', error);
    return NextResponse.json({ error: 'Failed to save posts' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    let targetId = url.searchParams.get('id');

    if (!targetId) {
      try {
        const body = await request.json();
        targetId = body.postId || body.id;
      } catch (_) {}
    }

    if (!targetId) {
      return NextResponse.json({ error: 'Post ID is required for deletion' }, { status: 400 });
    }

    const db = getDb();
    if (!Array.isArray(db.deletedPostIds)) {
      db.deletedPostIds = [];
    }

    // Add to tombstone list if not already present
    if (!db.deletedPostIds.includes(targetId)) {
      db.deletedPostIds.push(targetId);
    }

    // Purge from db.posts
    if (Array.isArray(db.posts)) {
      db.posts = db.posts.filter((p: any) => p && p.id !== targetId);
    }

    saveDb(db);

    return NextResponse.json({
      success: true,
      deletedId: targetId,
      deletedPostIds: db.deletedPostIds,
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
