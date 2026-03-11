'use client';

import React, { useState } from 'react';
import { X, LogIn } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { setUser } = usePlayerStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isSignUp ? 'signup' : 'signin',
          email, password,
          name: isSignUp ? name : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setUser(data.user);
      toast.success(`Welcome${isSignUp ? '' : ' back'}, ${data.user.name}!`);
      onClose();
      setEmail(''); setPassword(''); setName('');
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) { setError('Enter your email'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setForgotSent(true);
      toast.success('Reset link sent to your email!');
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative w-full max-w-sm rounded-3xl p-7 z-10"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-xl transition-all" style={{ color: 'var(--text-muted)' }}>
              <X size={18} />
            </button>

            {showForgot ? (
              /* Forgot Password */
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <div className="w-14 h-14 aurora-bg rounded-2xl flex items-center justify-center mx-auto mb-4"><LogIn size={24} className="text-white" /></div>
                  <h2 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Reset Password</h2>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>We&apos;ll send a reset link to your email</p>
                </div>
                {forgotSent ? (
                  <div className="text-center py-4">
                    <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>✓ Check your email for the reset link</p>
                    <button onClick={() => { setShowForgot(false); setForgotSent(false); }} className="text-sm font-bold mt-4 underline" style={{ color: 'var(--text-secondary)' }}>Back to Sign In</button>
                  </div>
                ) : (
                  <>
                    <input type="email" placeholder="Email address" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="w-full rounded-xl px-4 py-3.5 outline-none text-sm font-medium" style={{ color: 'var(--text-primary)', background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
                    {error && <p className="text-xs font-medium" style={{ color: 'var(--accent)' }}>{error}</p>}
                    <button onClick={handleForgotPassword} disabled={loading} className="w-full aurora-bg px-6 py-3.5 text-white rounded-xl font-bold text-sm disabled:opacity-50">{loading ? 'Sending...' : 'Send Reset Link'}</button>
                    <button onClick={() => { setShowForgot(false); setError(''); }} className="w-full text-center text-sm font-medium py-1" style={{ color: 'var(--text-muted)' }}>Back to Sign In</button>
                  </>
                )}
              </div>
            ) : (
              /* Sign In / Sign Up */
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <div className="w-14 h-14 aurora-bg rounded-2xl flex items-center justify-center mx-auto mb-4"><LogIn size={24} className="text-white" /></div>
                  <h2 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Sign in to save your music</p>
                </div>
                {isSignUp && (
                  <input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl px-4 py-3.5 outline-none text-sm font-medium" style={{ color: 'var(--text-primary)', background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
                )}
                <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl px-4 py-3.5 outline-none text-sm font-medium" style={{ color: 'var(--text-primary)', background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl px-4 py-3.5 outline-none text-sm font-medium" style={{ color: 'var(--text-primary)', background: 'var(--bg-card)', border: '1px solid var(--border)' }} onKeyDown={(e) => e.key === 'Enter' && handleAuth()} />
                {error && <p className="text-xs font-medium" style={{ color: 'var(--accent)' }}>{error}</p>}
                <button onClick={handleAuth} disabled={loading} className="w-full aurora-bg px-6 py-3.5 text-white rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform disabled:opacity-50">{loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}</button>
                {!isSignUp && (
                  <button onClick={() => { setShowForgot(true); setError(''); }} className="w-full text-center text-xs font-medium" style={{ color: 'var(--accent)' }}>Forgot Password?</button>
                )}
                <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                  {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                  <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="font-bold underline" style={{ color: 'var(--accent)' }}>{isSignUp ? 'Sign In' : 'Sign Up'}</button>
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
