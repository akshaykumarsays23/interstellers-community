import fs from 'node:fs';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing.');
}

const sql = neon(process.env.DATABASE_URL);
const dbPath = path.join(process.cwd(), 'data', 'db.json');

if (!fs.existsSync(dbPath)) {
  throw new Error('data/db.json was not found. Migration cancelled.');
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const posts = Array.isArray(db.posts) ? db.posts : [];
const deletedIds = Array.isArray(db.deletedPostIds)
  ? db.deletedPostIds
  : [];

await sql`
  CREATE TABLE IF NOT EXISTS interstellers_posts (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS interstellers_deleted_posts (
    id TEXT PRIMARY KEY,
    deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

for (const id of deletedIds) {
  if (typeof id !== 'string' || !id) continue;

  await sql`
    INSERT INTO interstellers_deleted_posts (id)
    VALUES (${id})
    ON CONFLICT (id) DO NOTHING
  `;

  await sql`
    DELETE FROM interstellers_posts
    WHERE id = ${id}
  `;
}

let imported = 0;
let skipped = 0;

for (const post of posts) {
  if (!post || typeof post.id !== 'string' || !post.id) {
    skipped++;
    continue;
  }

  if (deletedIds.includes(post.id)) {
    skipped++;
    continue;
  }

  const createdAt = post.createdAt &&
    !Number.isNaN(Date.parse(post.createdAt))
    ? new Date(post.createdAt).toISOString()
    : new Date().toISOString();

  const result = await sql`
    INSERT INTO interstellers_posts (id, data, created_at)
    SELECT ${post.id}, ${JSON.stringify(post)}::jsonb, ${createdAt}::timestamptz
    WHERE NOT EXISTS (
      SELECT 1
      FROM interstellers_deleted_posts
      WHERE id = ${post.id}
    )
    ON CONFLICT (id) DO NOTHING
    RETURNING id
  `;

  if (result.length > 0) {
    imported++;
  } else {
    skipped++;
  }
}

const counts = await sql`
  SELECT
    (SELECT COUNT(*)::int FROM interstellers_posts) AS posts,
    (SELECT COUNT(*)::int FROM interstellers_deleted_posts) AS deleted_posts
`;

console.log('Migration completed.');
console.log('New posts imported:', imported);
console.log('Existing or skipped posts:', skipped);
console.log('Total posts in Neon:', counts[0].posts);
console.log('Deleted-post records in Neon:', counts[0].deleted_posts);
