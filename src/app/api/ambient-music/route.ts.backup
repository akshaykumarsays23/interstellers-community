import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const AUDIO_EXTS = new Set(['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.webm', '.opus']);

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const musicDir = path.join(publicDir, 'music');

    const candidateFiles: { filePath: string; url: string; filename: string; mtime: number }[] = [];

    // 1. Check public/music
    if (fs.existsSync(musicDir)) {
      try {
        const musicFiles = fs.readdirSync(musicDir);
        for (const file of musicFiles) {
          const ext = path.extname(file).toLowerCase();
          if (AUDIO_EXTS.has(ext)) {
            const stat = fs.statSync(path.join(musicDir, file));
            if (stat.isFile() && stat.size > 0) {
              candidateFiles.push({
                filePath: path.join(musicDir, file),
                url: `/music/${encodeURIComponent(file)}`,
                filename: file,
                mtime: stat.mtimeMs,
              });
            }
          }
        }
      } catch (err) {
        console.error('Error reading public/music:', err);
      }
    }

    // 2. Check public root
    if (fs.existsSync(publicDir)) {
      try {
        const rootFiles = fs.readdirSync(publicDir);
        for (const file of rootFiles) {
          const ext = path.extname(file).toLowerCase();
          if (AUDIO_EXTS.has(ext)) {
            const stat = fs.statSync(path.join(publicDir, file));
            if (stat.isFile() && stat.size > 0) {
              candidateFiles.push({
                filePath: path.join(publicDir, file),
                url: `/${encodeURIComponent(file)}`,
                filename: file,
                mtime: stat.mtimeMs,
              });
            }
          }
        }
      } catch (err) {
        console.error('Error reading public:', err);
      }
    }

    // Sort by newest modified time
    candidateFiles.sort((a, b) => b.mtime - a.mtime);

    if (candidateFiles.length > 0) {
      const topSong = candidateFiles[0];
      return NextResponse.json({
        available: true,
        url: topSong.url,
        filename: topSong.filename,
        title: topSong.filename.replace(/\.[^/.]+$/, ''),
        allCount: candidateFiles.length,
      });
    }

    return NextResponse.json({
      available: false,
      url: null,
      filename: null,
      message: 'No song file found in public/ or public/music/',
    });
  } catch (error) {
    return NextResponse.json(
      { available: false, url: null, error: String(error) },
      { status: 500 }
    );
  }
}
