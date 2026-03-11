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

      return NextResponse.json({ success: true });
    }

    if (action === 'removeSong') {
      const { playlistId, songId } = body;
      await prisma.playlistSong.deleteMany({
        where: { playlistId, songId },
      });
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
