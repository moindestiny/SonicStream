'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signin', email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      if (data.user.role !== 'ADMIN') {
        setError('Access denied. Admin privileges required.');
        return;
      }
      localStorage.setItem('admin-session', JSON.stringify(data.user));
      toast.success('Welcome, Admin!');
      router.push('/admin');
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 aurora-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Admin Console</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Sign in with your admin credentials</p>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-4">
          <input type="email" placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl px-4 py-3.5 outline-none text-sm font-medium" style={{ color: 'var(--text-primary)', background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl px-4 py-3.5 outline-none text-sm font-medium" style={{ color: 'var(--text-primary)', background: 'var(--bg-card)', border: '1px solid var(--border)' }} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
          {error && <p className="text-xs font-semibold" style={{ color: '#e74c3c' }}>{error}</p>}
          <button onClick={handleLogin} disabled={loading} className="w-full aurora-bg px-6 py-3.5 text-white rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
            <LogIn size={18} /> {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
          Default: admin@sonicstream.com / admin123
        </p>
      </div>
    </div>
  );
}
