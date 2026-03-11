import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/admin/stats
export async function GET() {
  const [totalUsers, totalLikes, totalPlaylists, totalFollows, totalQueued, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.likedSong.count(),
    prisma.playlist.count(),
    prisma.followedArtist.count(),
    prisma.queueItem.count(),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, createdAt: true, role: true },
    }),
  ]);

  return NextResponse.json({
    totalUsers,
    totalLikes,
    totalPlaylists,
    totalFollows,
    totalQueued,
    recentUsers,
  });
}
