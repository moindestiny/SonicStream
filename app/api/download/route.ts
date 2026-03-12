import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

// Force this route to be server-side only
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

interface DownloadRequest {
  audioUrl: string;
  imageUrl?: string;
  title: string;
  artist: string;
  album: string;
  year?: string;
}

export async function POST(req: NextRequest) {
  let tempAudioPath: string | null = null;
  let tempImagePath: string | null = null;
  let tempOutputPath: string | null = null;

  try {
    const body: DownloadRequest = await req.json();
    const { audioUrl, imageUrl, title, artist, album, year } = body;

    if (!audioUrl || !title || !artist) {
      return NextResponse.json(
        { error: 'Missing required fields: audioUrl, title, artist' },
        { status: 400 }
      );
    }

    // Create temp file paths
    const tempDir = tmpdir();
    const id = randomUUID();
    tempAudioPath = join(tempDir, `${id}_input.m4a`);
    tempImagePath = imageUrl ? join(tempDir, `${id}_cover.jpg`) : null;
    tempOutputPath = join(tempDir, `${id}_output.mp3`);

    // 1. Download audio file
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error(`Failed to download audio: ${audioResponse.status}`);
    }
    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
    await fs.writeFile(tempAudioPath, audioBuffer);

    // 2. Download cover image if provided
    let hasImage = false;
    if (imageUrl && !imageUrl.startsWith('data:')) {
      try {
        const imageResponse = await fetch(imageUrl);
        if (imageResponse.ok) {
          const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
          if (tempImagePath) {
            await fs.writeFile(tempImagePath, imageBuffer);
            hasImage = true;
          }
        }
      } catch (e) {
        console.warn('Failed to download cover image:', e);
      }
    }

    // 3. Convert to MP3 with metadata using FFmpeg
    await new Promise<void>((resolve, reject) => {
      const command = ffmpeg(tempAudioPath!)
        .toFormat('mp3')
        .audioBitrate(320)
        .audioChannels(2)
        .audioFrequency(44100)
        .outputOptions([
          '-id3v2_version', '3',
          '-metadata', `title=${title}`,
          '-metadata', `artist=${artist}`,
          '-metadata', `album=${album || 'Unknown Album'}`,
          ...(year ? ['-metadata', `date=${year}`] : []),
          '-metadata', `genre=${'Pop'}`,
        ]);

      // Add album art if available
      if (hasImage && tempImagePath) {
        command.input(tempImagePath);
        command.outputOptions([
          '-map', '0:a:0',  // Audio from first input
          '-map', '1:v:0',  // Image from second input
          '-c:v', 'copy',   // Copy image as-is
          '-id3v2_version', '3',
        ]);
      }

      command
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(err))
        .save(tempOutputPath!);
    });

    // 4. Read the output file
    const outputBuffer = await fs.readFile(tempOutputPath);

    // 5. Clean up temp files
    await Promise.all([
      fs.unlink(tempAudioPath).catch(() => {}),
      tempImagePath ? fs.unlink(tempImagePath).catch(() => {}) : Promise.resolve(),
      fs.unlink(tempOutputPath).catch(() => {}),
    ]);

    // 6. Return the MP3 file
    return new NextResponse(outputBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(title)} - ${encodeURIComponent(artist)}.mp3"`,
        'Content-Length': outputBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Download/Conversion error:', error);
    
    // Clean up on error
    await Promise.all([
      tempAudioPath ? fs.unlink(tempAudioPath).catch(() => {}) : Promise.resolve(),
      tempImagePath ? fs.unlink(tempImagePath).catch(() => {}) : Promise.resolve(),
      tempOutputPath ? fs.unlink(tempOutputPath).catch(() => {}) : Promise.resolve(),
    ]);

    return NextResponse.json(
      { error: 'Failed to process audio file', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Increase body size limit for the API route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};
