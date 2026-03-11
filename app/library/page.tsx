'use client';

import React from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import SongCard from '@/components/SongCard';
import { Library, History, Heart, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import CreatePlaylistModal from '@/components/CreatePlaylistModal';
import AuthModal from '@/components/AuthModal';
import { useState } from 'react';

export default function LibraryPage() {
  const { recentlyPlayed, favorites } = usePlayerStore();
  const router = useRouter();
  const { requireAuth, showAuthModal, setShowAuthModal } = useAuthGuard();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handlePlaylistsClick = () => {
    requireAuth(() => {
      router.push('/library/playlists');
    });
  };

  const handleCreateClick = () => {
    requireAuth(() => {
      setIsCreateModalOpen(true);
    });
  };

  return (
    <div className="px-4 md:px-8 pb-32 pt-4">
      <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-8" style={{ color: 'var(--text-primary)' }}>Your Library</h1>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        <Link href="/favorites" className="group">
          <div className="aurora-bg p-6 rounded-2xl h-48 flex flex-col justify-end transition-transform group-hover:scale-[1.02]">
            <Heart size={36} className="text-white mb-3" fill="currentColor" />
            <h2 className="text-2xl font-extrabold text-white">Liked Songs</h2>
            <p className="text-white/70 font-medium text-sm">{favorites.length} songs</p>
          </div>
        </Link>
        <div onClick={handlePlaylistsClick} className="glass-card p-6 rounded-2xl h-48 flex flex-col justify-end cursor-pointer transition-transform hover:scale-[1.02]">
          <div className="flex items-center gap-2 mb-3">
            <Library size={36} style={{ color: 'var(--accent)' }} />
          </div>
          <h2 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Playlists</h2>
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Your custom playlists</p>
        </div>
        <div onClick={handleCreateClick} className="glass-card p-6 rounded-2xl h-48 flex flex-col justify-end cursor-pointer transition-transform hover:scale-[1.02]">
          <div className="flex items-center gap-2 mb-3">
            <Plus size={36} style={{ color: 'var(--accent-secondary)' }} />
          </div>
          <h2 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Create Playlist</h2>
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Start a new collection</p>
        </div>
      </div>

      {/* Recently Played */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <History size={20} style={{ color: 'var(--accent)' }} />
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Recently Played</h2>
        </div>
        {recentlyPlayed.length === 0 ? (
          <p className="text-sm font-medium py-8 text-center" style={{ color: 'var(--text-muted)' }}>Songs you listen to will show up here.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {recentlyPlayed.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        )}
      </section>

      <CreatePlaylistModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={() => router.push('/library/playlists')} />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
