'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api, getHighQualityImage, getHighQualityDownloadUrl, formatDuration, normalizeSong } from '@/lib/api';
import { Play, Pause, Heart, Download, Plus, Share2, ListPlus } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import Image from 'next/image';
import Link from 'next/link';
import SongCard from '@/components/SongCard';
import SkeletonLoader from '@/components/SkeletonLoader';
import { motion } from 'motion/react';
import { downloadSong } from '@/lib/downloadSong';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import AuthModal from '@/components/AuthModal';
import AddToPlaylistModal from '@/components/AddToPlaylistModal';
import toast from 'react-hot-toast';

const BASE_URL = 'https://jio-saavn-api-delta-steel.vercel.app/api';

export default function SongPage() {
  const { id } = useParams();

  const { data: songData, isLoading } = useQuery({
    queryKey: ['song', id],
    queryFn: async () => { const res = await fetch(`${BASE_URL}${api.songDetails(id as string)}`); return res.json(); },
    enabled: !!id,
  });

  const { data: suggestionsData } = useQuery({
    queryKey: ['song-suggestions', id],
    queryFn: async () => { const res = await fetch(`${BASE_URL}${api.songSuggestions(id as string)}`); return res.json(); },
    enabled: !!id,
  });

  const { setCurrentSong, setQueue, currentSong, isPlaying, togglePlay, favorites, toggleFavorite, addToQueue } = usePlayerStore();
  const { requireAuth, showAuthModal, setShowAuthModal } = useAuthGuard();
  const [showAddPlaylist, setShowAddPlaylist] = React.useState(false);

  if (isLoading) return <div className="p-8"><SkeletonLoader className="h-80 rounded-2xl" /></div>;
  if (!songData?.data?.[0]) return <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Song not found</div>;

  const song = songData.data[0];
  const isCurrent = currentSong?.id === song.id;
  const isFavorite = favorites.includes(song.id);

  const handlePlay = () => {
    if (isCurrent) { togglePlay(); } else {
      setCurrentSong(song);
      setQueue(suggestionsData?.data ? [song, ...suggestionsData.data] : [song]);
    }
  };

  const handleDownload = () => downloadSong(song);
  const handleLike = () => requireAuth(() => { toggleFavorite(song.id); toast.success(isFavorite ? 'Removed from liked songs' : 'Added to liked songs'); });
  const handleAddPlaylist = () => requireAuth(() => setShowAddPlaylist(true));
  const handleAddToQueue = () => { addToQueue(song); toast.success(`Added "${song.name}" to queue`); };

  return (
    <div className="relative px-4 md:px-8 pb-10 pt-10 md:pt-4">
      <div className="absolute top-8 left-6 z-20">
        <button onClick={() => window.history.back()} className="p-2.5 rounded-full glass-card transition-all hover:scale-105" style={{ color: 'var(--text-primary)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
      </div>
      
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-end mb-10 pt-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="relative w-64 h-64 md:w-72 md:h-72 rounded-2xl overflow-hidden flex-shrink-0"
          style={{ boxShadow: '0 16px 40px var(--shadow-color)', border: '1px solid var(--border)' }}
        >
          <Image src={getHighQualityImage(song.image)} alt={song.name} fill className="object-cover" referrerPolicy="no-referrer" />
        </motion.div>

        <div className="flex-1 w-full min-w-0 text-center md:text-left">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>Song</p>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 break-words" style={{ color: 'var(--text-primary)' }}>{song.name}</h1>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
            {song.artists?.primary?.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="relative w-7 h-7 rounded-full overflow-hidden">
                  <Image src={getHighQualityImage(song.artists.primary[0].image)} alt={song.artists.primary[0].name} fill className="object-cover" referrerPolicy="no-referrer" />
                </div>
                <Link href={`/artist/${song.artists.primary[0].id}`} className="font-semibold text-sm hover:underline" style={{ color: 'var(--text-primary)' }}>
                  {song.artists.primary[0].name}
                </Link>
              </div>
            )}
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{song.year}</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{formatDuration(song.duration)}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button onClick={handlePlay} className="aurora-bg px-7 py-3.5 text-white rounded-full font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2">
              {isCurrent && isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              {isCurrent && isPlaying ? 'Pause' : 'Play'}
            </button>
            <button onClick={handleLike} className="p-3 rounded-full transition-all glass-card" style={{ color: isFavorite ? 'var(--accent)' : 'var(--text-muted)' }}>
              <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button onClick={handleDownload} className="p-3 rounded-full transition-all glass-card hover:bg-white/10" style={{ color: 'var(--text-muted)' }} title="Download">
              <Download size={20} />
            </button>
            <button onClick={handleAddToQueue} className="p-3 rounded-full transition-all glass-card hover:bg-white/10" style={{ color: 'var(--text-muted)' }} title="Add to queue">
              <Plus size={20} />
            </button>
            <button onClick={handleAddPlaylist} className="p-3 rounded-full transition-all glass-card hover:bg-white/10" style={{ color: 'var(--text-muted)' }} title="Add to Playlist">
              <ListPlus size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Recommended Songs */}
      {suggestionsData?.data?.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Recommended</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {suggestionsData.data.map((s: any) => (
              <SongCard key={s.id} song={normalizeSong(s)} queue={suggestionsData.data.map(normalizeSong)} />
            ))}
          </div>
        </section>
      )}

      {/* Credits Section */}
      <section className="mt-12 p-6 glass-card rounded-2xl">
        <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--text-primary)' }}>Credits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs uppercase font-bold mb-3" style={{ color: 'var(--text-muted)' }}>Performed by</p>
            <div className="space-y-3">
              {song.artists?.primary?.map((artist: any) => (
                <Link key={artist.id} href={`/artist/${artist.id}`} className="flex items-center gap-3 group">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden">
                    <Image src={getHighQualityImage(artist.image)} alt={artist.name} fill className="object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <span className="font-medium text-sm group-hover:underline" style={{ color: 'var(--text-primary)' }}>{artist.name}</span>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase font-bold mb-3" style={{ color: 'var(--text-muted)' }}>Album</p>
            <Link href={`/album/${song.album?.id}`} className="font-medium text-sm hover:underline" style={{ color: 'var(--text-primary)' }}>
              {song.album?.name}
            </Link>
          </div>
        </div>
      </section>

      <AddToPlaylistModal isOpen={showAddPlaylist} onClose={() => setShowAddPlaylist(false)} songId={song.id} />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
