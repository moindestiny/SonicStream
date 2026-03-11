import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/follows?userId=xxx
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const follows = await prisma.followedArtist.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ follows });
}

// POST /api/follows — { userId, artistId, artistName, artistImage }
export async function POST(req: NextRequest) {
  try {
    const { userId, artistId, artistName, artistImage } = await req.json();
    if (!userId || !artistId) {
      return NextResponse.json({ error: 'userId and artistId required' }, { status: 400 });
    }

    const follow = await prisma.followedArtist.create({
      data: { userId, artistId, artistName: artistName || '', artistImage },
    });

    return NextResponse.json({ follow });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ success: true, message: 'Already following' });
    }
    return NextResponse.json({ error: 'Failed to follow' }, { status: 500 });
  }
}

// DELETE /api/follows — { userId, artistId }
export async function DELETE(req: NextRequest) {
  try {
    const { userId, artistId } = await req.json();
    if (!userId || !artistId) {
      return NextResponse.json({ error: 'userId and artistId required' }, { status: 400 });
    }

    await prisma.followedArtist.deleteMany({
      where: { userId, artistId },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to unfollow' }, { status: 500 });
  }
}
