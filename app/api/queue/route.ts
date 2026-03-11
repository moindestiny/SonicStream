import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/queue?userId=xxx
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const items = await prisma.queueItem.findMany({
    where: { userId },
    orderBy: { position: 'asc' },
  });

  return NextResponse.json({
    queue: items.map(item => ({
      id: item.id,
      songId: item.songId,
      songData: item.songData,
      position: item.position,
    })),
  });
}

// POST /api/queue — { action: 'add' | 'clear', userId, songId?, songData?, position? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    if (action === 'add') {
      const { songId, songData } = body;
      if (!songId) {
        return NextResponse.json({ error: 'songId required' }, { status: 400 });
      }

      const maxPos = await prisma.queueItem.findFirst({
        where: { userId },
        orderBy: { position: 'desc' },
      });

      const item = await prisma.queueItem.create({
        data: {
          userId,
          songId,
          songData: songData || {},
          position: (maxPos?.position ?? -1) + 1,
        },
      });

      return NextResponse.json({ item });
    }

    if (action === 'clear') {
      await prisma.queueItem.deleteMany({ where: { userId } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// DELETE /api/queue — { id } (remove single item after it's been processed/played)
export async function DELETE(req: NextRequest) {
  try {
    const { id, userId, songId } = await req.json();

    if (id) {
      await prisma.queueItem.delete({ where: { id } });
    } else if (userId && songId) {
      await prisma.queueItem.deleteMany({ where: { userId, songId } });
    } else {
      return NextResponse.json({ error: 'id or userId+songId required' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to remove from queue' }, { status: 500 });
  }
}
