 import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const AUDIO_EXTS = new Set([
  '.mp3',
  '.wav',
  '.ogg',
  '.m4a',
  '.aac',
  '.flac',
  '.webm',
  '.opus',
]);

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const musicDir = path.join(publicDir, 'music');

    const songs: {
      url: string;
      filename: string;
      title: string;
    }[] = [];

    if (fs.existsSync(musicDir)) {
      const files = fs.readdirSync(musicDir);

      for (const file of files) {
        const filePath = path.join(musicDir, file);
        const ext = path.extname(file).toLowerCase();

        if (!AUDIO_EXTS.has(ext)) continue;

        const stat = fs.statSync(filePath);

        if (!stat.isFile() || stat.size === 0) continue;

        songs.push({
          url: `/music/${encodeURIComponent(file)}`,
          filename: file,
          title: file.replace(/\.[^/.]+$/, ''),
        });
      }
    }

    songs.sort((a, b) =>
      a.filename.localeCompare(b.filename, undefined, {
        sensitivity: 'base',
      }),
    );

    return NextResponse.json({
      available: songs.length > 0,
      songs,
      allCount: songs.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        available: false,
        songs: [],
        allCount: 0,
        error: String(error),
      },
      { status: 500 },
    );
  }
}
