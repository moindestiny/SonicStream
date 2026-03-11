import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'sonicstream-salt-2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// POST /api/auth/reset — { token, password }
export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const reset = await prisma.passwordReset.findUnique({ where: { token } });
    if (!reset) {
      return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 });
    }
    if (new Date() > reset.expiresAt) {
      await prisma.passwordReset.delete({ where: { id: reset.id } });
      return NextResponse.json({ error: 'Reset link has expired' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    await prisma.user.update({
      where: { id: reset.userId },
      data: { passwordHash },
    });

    // Clean up all tokens for this user
    await prisma.passwordReset.deleteMany({ where: { userId: reset.userId } });

    return NextResponse.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
