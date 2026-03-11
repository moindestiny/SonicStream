'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { KeyRound, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSuccess(true);
      toast.success('Password reset successfully!');
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-extrabold mb-3" style={{ color: 'var(--text-primary)' }}>Invalid Reset Link</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>This password reset link is invalid or has expired.</p>
          <button onClick={() => router.push('/')} className="aurora-bg px-6 py-3 text-white rounded-full font-bold text-sm mt-6 hover:scale-105 transition-transform">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 aurora-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
            {success ? <CheckCircle size={32} className="text-white" /> : <KeyRound size={32} className="text-white" />}
          </div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{success ? 'Password Reset!' : 'New Password'}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{success ? 'You can now sign in with your new password' : 'Enter your new password below'}</p>
        </div>

        {success ? (
          <button onClick={() => router.push('/profile')} className="w-full aurora-bg px-6 py-3.5 text-white rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform">Sign In</button>
        ) : (
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl px-4 py-3.5 outline-none text-sm font-medium" style={{ color: 'var(--text-primary)', background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
            <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-xl px-4 py-3.5 outline-none text-sm font-medium" style={{ color: 'var(--text-primary)', background: 'var(--bg-card)', border: '1px solid var(--border)' }} onKeyDown={(e) => e.key === 'Enter' && handleReset()} />
            {error && <p className="text-xs font-semibold" style={{ color: '#e74c3c' }}>{error}</p>}
            <button onClick={handleReset} disabled={loading} className="w-full aurora-bg px-6 py-3.5 text-white rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform disabled:opacity-50">{loading ? 'Resetting...' : 'Reset Password'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}><p style={{ color: 'var(--text-muted)' }}>Loading...</p></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
