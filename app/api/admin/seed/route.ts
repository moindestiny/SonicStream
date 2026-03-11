import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'sonicstream-salt-2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// POST /api/admin/seed — creates default admin user
export async function POST() {
  try {
    const email = 'admin@sonicstream.com';
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Update role to ADMIN if not already
      await prisma.user.update({ where: { email }, data: { role: 'ADMIN' } });
      return NextResponse.json({ message: 'Admin user already exists, role updated' });
    }

    const passwordHash = await hashPassword('admin123');
    const admin = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: 'Admin',
        role: 'ADMIN',
      },
    });

    return NextResponse.json({ message: 'Admin created', userId: admin.id });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed admin' }, { status: 500 });
  }
}
