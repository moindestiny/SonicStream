import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/admin/users — list all users with stats
export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search') || '';

  const users = await prisma.user.findMany({
    where: search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    } : undefined,
    include: {
      _count: {
        select: {
          likedSongs: true,
          playlists: true,
          followedArtists: true,
          queueItems: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    users: users.map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      avatarUrl: u.avatarUrl,
      role: u.role,
      createdAt: u.createdAt,
      stats: u._count,
    })),
  });
}

// DELETE /api/admin/users — { userId }
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

// PATCH /api/admin/users — { userId, data: { role?, name? } }
export async function PATCH(req: NextRequest) {
  try {
    const { userId, data } = await req.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.role && { role: data.role }),
        ...(data.name && { name: data.name }),
      },
    });

    return NextResponse.json({
      user: { id: updated.id, email: updated.email, name: updated.name, role: updated.role },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
