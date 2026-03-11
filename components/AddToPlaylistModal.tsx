'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Library, Check, X, PlusCircle } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePlayerStore } from '@/store/usePlayerStore';
import toast from 'react-hot-toast';
import Image from 'next/image';
import CreatePlaylistModal from './CreatePlaylistModal';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  songId: string;
}

export default function AddToPlaylistModal({ isOpen, onClose, songId }: AddToPlaylistModalProps) {
  const { user } = usePlayerStore();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = React.useState<string | null>(null); // Track which playlist is currently adding
  const [addedPlaylists, setAddedPlaylists] = React.useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['custom-playlists', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/playlists?userId=${user!.id}`);
      return res.json();
    },
    enabled: !!user?.id && isOpen,
  });

  // Reset added state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setAddedPlaylists(new Set());
    }
  }, [isOpen]);

  const playlists = data?.playlists || [];

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!user) return;
    setIsAdding(playlistId);

    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addSong',
          playlistId,
          songId,
        }),
      });

      const resData = await res.json();

      if (!res.ok) throw new Error(resData.error || 'Failed to add song');

      // The API returns success: true, message: 'Song already in playlist' if P2002 duplicate
      if (resData.message === 'Song already in playlist') {
        toast('Already in playlist', { icon: 'ℹ️' });
      } else {
        toast.success('Added to playlist');
        setAddedPlaylists(prev => new Set(prev).add(playlistId));
        // Invalidate key so other parts of the app (like Library) see the new song count
        queryClient.invalidateQueries({ queryKey: ['custom-playlists', user.id] });
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setIsAdding(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="add-playlist-modal" className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full sm:max-w-md h-[70vh] sm:h-[60vh] max-h-[500px] flex flex-col glass-card sm:rounded-2xl rounded-t-3xl overflow-hidden"
            style={{ background: 'var(--bg-card)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Add to Playlist</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 transition-colors" style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-2">
              {isLoading ? (
                <div className="p-4 space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 h-16 w-full animate-pulse rounded-xl bg-white/5" />
                  ))}
                </div>
              ) : playlists.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 pb-12">
                  <Library size={48} className="mb-4 opacity-30" style={{ color: 'var(--text-muted)' }} />
                  <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>No Playlists Found</p>
                  <p className="text-xs max-w-[200px] mb-6" style={{ color: 'var(--text-muted)' }}>You haven't created any playlists to add this song to yet.</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="aurora-bg px-6 py-2.5 rounded-full font-bold text-sm text-white flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-black/20"
                  >
                    <PlusCircle size={18} />
                    Create Playlist
                  </button>
                </div>
              ) : (
                <div className="flex flex-col">
                  {playlists.map((playlist: any) => {
                    const isAdded = addedPlaylists.has(playlist.id);
                    const adding = isAdding === playlist.id;

                    return (
                      <button
                        key={playlist.id}
                        onClick={() => handleAddToPlaylist(playlist.id)}
                        disabled={isAdded || adding}
                        className={`flex items-center gap-4 p-3 rounded-xl transition-all ${isAdded ? 'opacity-50 cursor-default' : 'hover:bg-white/5 disabled:opacity-50'}`}
                      >
                        <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-800 shadow-md">
                          {playlist.coverUrl ? (
                            <Image src={playlist.coverUrl} alt={playlist.name} fill className="object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center aurora-bg opacity-80">
                              <Library size={20} className="text-white drop-shadow-md" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{playlist.name}</p>
                          <p className="text-xs truncate opacity-70" style={{ color: 'var(--text-muted)' }}>
                            {playlist.songs?.length || 0} tracks
                          </p>
                        </div>
                        <div className="pr-2">
                          {isAdded ? (
                            <Check size={20} className="text-green-500" />
                          ) : (
                            <Plus size={20} style={{ color: 'var(--text-muted)' }} className="opacity-50 group-hover:opacity-100" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Create Playlist Modal placed outside the motion.div to ensure z-index stacking works easily */}
      <CreatePlaylistModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
    </AnimatePresence>
  );
}
