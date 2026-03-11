'use client';

import React from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import SongCard from '@/components/SongCard';
import { Heart, Music } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api, normalizeSong } from '@/lib/api';

const BASE_URL = 'https://jio-saavn-api-delta-steel.vercel.app/api';

export default function FavoritesPage() {
  const { favorites } = usePlayerStore();

  const { data: songsData, isLoading } = useQuery({
    queryKey: ['favorites', favorites.join(',')],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}${api.songDetails(favorites.join(','))}`);
      return res.json();
    },
    enabled: favorites.length > 0,
  });

  return (
    <div className="px-4 md:px-8 pb-32">
      {/* Hero */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 mb-10 p-6 md:p-8 rounded-2xl mt-4" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-tertiary))' }}>
        <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)' }}>
          <Heart size={80} className="text-white" fill="currentColor" />
        </div>
        <div className="text-center md:text-left">
          <p className="text-xs font-bold uppercase tracking-widest mb-2 text-white/70">Playlist</p>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-3">Liked Songs</h1>
          <p className="font-semibold text-white/80">{favorites.length} songs</p>
        </div>
      </div>

      {/* Songs */}
      {favorites.length === 0 ? (
        <div className="text-center py-20">
          <Music size={48} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-muted)' }}>Your liked songs will appear here</h2>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Tap the heart icon on any song to save it.</p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="aspect-square skeleton-loading rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {songsData?.data?.map((song: any) => (
            <SongCard key={song.id} song={normalizeSong(song)} queue={(songsData.data || []).map(normalizeSong)} />
          ))}
        </div>
      )}
    </div>
  );
}
