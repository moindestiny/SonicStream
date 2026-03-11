'use client';

import React, { useState } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { User, Mail, LogOut, Heart, Clock, Music, LogIn } from 'lucide-react';
import Image from 'next/image';
import AuthModal from '@/components/AuthModal';

export default function ProfilePage() {
  const { user, setUser, favorites, recentlyPlayed } = usePlayerStore();
  const [showAuth, setShowAuth] = useState(false);

  const handleSignOut = () => {
    setUser(null);
  };

  if (!user) {
    return (
      <div className="px-4 md:px-8 pb-10 pt-14 md:pt-10">
        <div className="max-w-md mx-auto text-center py-20">
          <div className="w-24 h-24 rounded-full aurora-bg mx-auto mb-6 flex items-center justify-center">
            <User size={48} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold mb-3" style={{ color: 'var(--text-primary)' }}>Welcome to SonicStream</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Sign in to save your liked songs, playlists, and queue across devices.</p>
          <button onClick={() => setShowAuth(true)} className="aurora-bg px-8 py-3.5 text-white rounded-full font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
            <LogIn size={18} /> Sign In / Sign Up
          </button>
        </div>
        
        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      </div>
    );
  }

  // Signed in profile
  return (
    <div className="px-4 md:px-8 pb-10 pt-14 md:pt-10">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-10 p-6 glass-card rounded-2xl">
          <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0" style={{ background: 'var(--bg-card)' }}>
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt={user.name} width={96} height={96} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full aurora-bg flex items-center justify-center">
                <User size={40} className="text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>{user.name}</h1>
            <p className="text-sm flex items-center justify-center md:justify-start gap-1.5" style={{ color: 'var(--text-muted)' }}>
              <Mail size={14} /> {user.email}
            </p>
          </div>
          <button onClick={handleSignOut} className="glass-card px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all" style={{ color: 'var(--accent)' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          <div className="glass-card p-5 rounded-2xl text-center">
            <Heart size={24} className="mx-auto mb-2" style={{ color: 'var(--accent)' }} />
            <p className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{favorites.length}</p>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Liked Songs</p>
          </div>
          <div className="glass-card p-5 rounded-2xl text-center">
            <Clock size={24} className="mx-auto mb-2" style={{ color: 'var(--accent-secondary)' }} />
            <p className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{recentlyPlayed.length}</p>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Recently Played</p>
          </div>
          <div className="glass-card p-5 rounded-2xl text-center">
            <Music size={24} className="mx-auto mb-2" style={{ color: 'var(--accent-tertiary)' }} />
            <p className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>0</p>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Playlists</p>
          </div>
        </div>
      </div>
    </div>
  );
}
