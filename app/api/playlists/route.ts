import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/playlists?userId=xxx
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const playlists = await prisma.playlist.findMany({
    where: { userId },
    include: { songs: { orderBy: { position: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ playlists });
}

// POST /api/playlists — { action: 'create' | 'addSong' | 'removeSong', ... }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'create') {
      const { userId, name, description, coverUrl } = body;
      if (!userId || !name) {
        return NextResponse.json({ error: 'userId and name required' }, { status: 400 });
      }

      const playlist = await prisma.playlist.create({
        data: { userId, name, description, coverUrl },
      });

      return NextResponse.json({ playlist });
    }

    if (action === 'addSong') {
      const { playlistId, songId } = body;
      if (!playlistId || !songId) {
        return NextResponse.json({ error: 'playlistId and songId required' }, { status: 400 });
      }

      const maxPos = await prisma.playlistSong.findFirst({
        where: { playlistId },
        orderBy: { position: 'desc' },
      });

      await prisma.playlistSong.create({
        data: {
          playlistId,
          songId,
          position: (maxPos?.position ?? -1) + 1,
        },
      });

      // Update coverUrl if the playlist doesn't have one yet
      const playlist = await prisma.playlist.findUnique({
        where: { id: playlistId },
        select: { coverUrl: true },
      });

      if (!playlist?.coverUrl) {
        try {
          const songRes = await fetch(`https://jio-saavn-api-delta-steel.vercel.app/api/songs/${songId}`);
          if (songRes.ok) {
            const songData = await songRes.json();
            const song = songData?.data?.[0];
            if (song && song.image && song.image.length > 0) {
              const highQualityCover = song.image[song.image.length - 1]?.url || song.image[0]?.url;
              if (highQualityCover) {
                await prisma.playlist.update({
                  where: { id: playlistId },
                  data: { coverUrl: highQualityCover },
                });
              }
            }
          }
        } catch (err) {
          console.error('Failed to update playlist cover:', err);
        }
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'removeSong') {
      const { playlistId, songId } = body;
      if (!playlistId || !songId) {
        return NextResponse.json({ error: 'playlistId and songId required' }, { status: 400 });
      }

      await prisma.playlistSong.deleteMany({
        where: { playlistId, songId },
      });

      // Fetch the new first song to make it the cover photo
      const firstSong = await prisma.playlistSong.findFirst({
        where: { playlistId },
        orderBy: { position: 'asc' },
      });

      if (firstSong) {
        try {
          const songRes = await fetch(`https://jio-saavn-api-delta-steel.vercel.app/api/songs/${firstSong.songId}`);
          if (songRes.ok) {
            const songData = await songRes.json();
            const song = songData?.data?.[0];
            if (song && song.image && song.image.length > 0) {
              const highQualityCover = song.image[song.image.length - 1]?.url || song.image[0]?.url;
              if (highQualityCover) {
                await prisma.playlist.update({
                  where: { id: playlistId },
                  data: { coverUrl: highQualityCover },
                });
              }
            }
          }
        } catch (err) {
          console.error('Failed to update playlist cover after removal:', err);
        }
      } else {
        // No songs left, reset coverUrl to null
        await prisma.playlist.update({
          where: { id: playlistId },
          data: { coverUrl: null },
        });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ success: true, message: 'Song already in playlist' });
    }
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// DELETE /api/playlists — { playlistId }
export async function DELETE(req: NextRequest) {
  try {
    const { playlistId } = await req.json();
    if (!playlistId) {
      return NextResponse.json({ error: 'playlistId required' }, { status: 400 });
    }

    await prisma.playlist.delete({ where: { id: playlistId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete playlist' }, { status: 500 });
  }
}
