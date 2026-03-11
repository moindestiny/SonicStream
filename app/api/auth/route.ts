import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { uploadImage } from '@/lib/cloudinary';

// Simple password hashing (for demo; consider bcrypt in production)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'sonicstream-salt-2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// POST /api/auth — { action: 'signup' | 'signin', email, password, name?, avatar? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, password, name, avatar } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (action === 'signup') {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }

      let avatarUrl: string | null = null;
      if (avatar) {
        avatarUrl = await uploadImage(avatar);
      }

      const passwordHash = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name: name || email.split('@')[0],
          avatarUrl,
        },
      });

      return NextResponse.json({
        user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl, role: user.role },
      });
    }

    if (action === 'signin') {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      const passwordHash = await hashPassword(password);
      if (user.passwordHash !== passwordHash) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      return NextResponse.json({
        user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl, role: user.role },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
