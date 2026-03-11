import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

// POST /api/auth/forgot — { email }
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if email exists
      return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    // Clean old tokens
    await prisma.passwordReset.deleteMany({ where: { userId: user.id } });

    // Create new reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordReset.create({
      data: { userId: user.id, token, expiresAt },
    });

    // Send email
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;

      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@sonicstream.app',
        to: email,
        subject: 'SonicStream — Reset Your Password',
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:30px 20px;">
            <h2 style="color:#ff6b6b;">SonicStream</h2>
            <p>Hi ${user.name},</p>
            <p>You requested to reset your password. Click below to set a new one:</p>
            <a href="${resetUrl}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#ff6b6b,#ffb347);color:white;text-decoration:none;border-radius:12px;font-weight:bold;margin:20px 0;">Reset Password</a>
            <p style="color:#999;font-size:12px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('Email send failed:', emailErr);
      // Still return success — token is stored, user can use direct URL
    }

    return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
