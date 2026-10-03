import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    return NextResponse.json({ posts: db.posts || [] });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = getDb();

    if (body.posts && Array.isArray(body.posts)) {
      db.posts = body.posts;
    } else if (body.post) {
      if (!db.posts) db.posts = [];
      const index = db.posts.findIndex((p: any) => p.id === body.post.id);
      if (index >= 0) {
        db.posts[index] = body.post;
      } else {
        db.posts.unshift(body.post);
      }
    }

    saveDb(db);
    return NextResponse.json({ success: true, posts: db.posts });
  } catch (error) {
    console.error('Error saving posts:', error);
    return NextResponse.json({ error: 'Failed to save posts' }, { status: 500 });
  }
}
