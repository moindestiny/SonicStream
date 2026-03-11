'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play, Plus, Download, Heart, ListPlus } from 'lucide-react';
import { getHighQualityImage, Song } from '@/lib/api';
import { usePlayerStore } from '@/store/usePlayerStore';
import { motion } from 'motion/react';
import { downloadSong } from '@/lib/downloadSong';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import AuthModal from '@/components/AuthModal';
import AddToPlaylistModal from '@/components/AddToPlaylistModal';
import toast from 'react-hot-toast';

interface SongCardProps {
  song: Song;
  queue?: Song[];
}

export default function SongCard({ song, queue }: SongCardProps) {
  const { setCurrentSong, setQueue, currentSong, isPlaying, addToQueue, favorites, toggleFavorite } = usePlayerStore();
  const { requireAuth, showAuthModal, setShowAuthModal } = useAuthGuard();
  const [showAddPlaylist, setShowAddPlaylist] = React.useState(false);
  const router = useRouter();
  const isCurrent = currentSong?.id === song.id;
  const isFav = favorites.includes(song.id);

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSong(song);
    if (queue) setQueue(queue);
  };

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToQueue(song);
    toast.success(`Added "${song.name}" to queue`);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    downloadSong(song);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(() => {
      toggleFavorite(song.id);
      toast.success(isFav ? 'Removed from liked songs' : 'Added to liked songs');
    });
  };

  const handleAddPlaylist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(() => setShowAddPlaylist(true));
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onClick={() => router.push(`/song/${song.id}`)}
        className="glass-card rounded-2xl overflow-hidden cursor-pointer group relative"
      >
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={getHighQualityImage(song.image)}
            alt={song.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
            <button onClick={handlePlay} className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 shadow-xl" style={{ background: 'var(--accent)' }}>
              <Play size={22} fill="currentColor" className="ml-0.5" />
            </button>
          </div>

          <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <button onClick={handleLike} className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all" style={{ background: 'rgba(0,0,0,0.5)', color: isFav ? 'var(--accent)' : '#fff' }}>
              <Heart size={14} fill={isFav ? 'currentColor' : 'none'} />
            </button>
            <button onClick={handleAddToQueue} className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md text-white transition-all hover:bg-white/20" style={{ background: 'rgba(0,0,0,0.5)' }} title="Add to Queue">
              <Plus size={14} />
            </button>
            <button onClick={handleAddPlaylist} className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md text-white transition-all hover:bg-white/20" style={{ background: 'rgba(0,0,0,0.5)' }} title="Add to Playlist">
              <ListPlus size={14} />
            </button>
            <button onClick={handleDownload} className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md text-white transition-all" style={{ background: 'rgba(0,0,0,0.5)' }}>
              <Download size={14} />
            </button>
          </div>

          {isCurrent && isPlaying && (
            <div className="absolute bottom-2 left-2 flex items-end gap-0.5 h-4 px-2 py-1 rounded-md backdrop-blur-md" style={{ background: 'rgba(0,0,0,0.6)' }}>
              <div className="w-1 bg-white eq-bar rounded-t-sm" style={{ animationDelay: '0s' }} />
              <div className="w-1 bg-white eq-bar rounded-t-sm" style={{ animationDelay: '0.2s' }} />
              <div className="w-1 bg-white eq-bar rounded-t-sm" style={{ animationDelay: '0.4s' }} />
            </div>
          )}
        </div>

        <div className="p-3.5">
          <h3 className="font-bold text-sm truncate mb-1" style={{ color: isCurrent ? 'var(--accent)' : 'var(--text-primary)' }}>
            {song.name}
          </h3>
          <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }} onClick={(e) => e.stopPropagation()}>
            {song.artists?.primary?.length > 0
              ? song.artists.primary.map((a, idx) => (
                <React.Fragment key={a.id || idx}>
                  <Link
                    href={a.id ? `/artist/${a.id}` : '#'}
                    onClick={(e) => !a.id && e.preventDefault()}
                    className="hover:underline transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {a.name}
                  </Link>
                  {idx < song.artists.primary.length - 1 && ', '}
                </React.Fragment>
              ))
              : 'Unknown Artist'}
          </div>
        </div>
      </motion.div>

      <AddToPlaylistModal isOpen={showAddPlaylist} onClose={() => setShowAddPlaylist(false)} songId={song.id} />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
