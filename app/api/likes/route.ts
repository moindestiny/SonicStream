import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/likes?userId=xxx
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const likes = await prisma.likedSong.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ likes: likes.map(l => l.songId) });
}

// POST /api/likes — { userId, songId }
export async function POST(req: NextRequest) {
  try {
    const { userId, songId } = await req.json();
    if (!userId || !songId) {
      return NextResponse.json({ error: 'userId and songId required' }, { status: 400 });
    }

    await prisma.likedSong.create({
      data: { userId, songId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ success: true, message: 'Already liked' });
    }
    return NextResponse.json({ error: 'Failed to like' }, { status: 500 });
  }
}

// DELETE /api/likes — { userId, songId }
export async function DELETE(req: NextRequest) {
  try {
    const { userId, songId } = await req.json();
    if (!userId || !songId) {
      return NextResponse.json({ error: 'userId and songId required' }, { status: 400 });
    }

    await prisma.likedSong.deleteMany({
      where: { userId, songId },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to unlike' }, { status: 500 });
  }
}
