'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Music } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreatePlaylistModal({ isOpen, onClose, onSuccess }: CreatePlaylistModalProps) {
  const { user } = usePlayerStore();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Playlist name is required');
      return;
    }
    if (!user) {
      toast.error('You must be signed in to create a playlist');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          userId: user.id,
          name: name.trim(),
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create playlist');

      toast.success('Playlist created successfully!');
      
      // Invalidate the query to ensure the list is updated immediately
      queryClient.invalidateQueries({ queryKey: ['custom-playlists', user.id] });
      
      setName('');
      setDescription('');
      onClose();
      if (onSuccess) onSuccess();
      // Optionally redirect to the new playlist
      // router.push(`/library/playlists/${data.playlist.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md glass-card rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg-card)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Music size={20} style={{ color: 'var(--accent)' }} /> Create Playlist
            </h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 transition-colors" style={{ color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Playlist Name</label>
              <input
                type="text"
                placeholder="My Awesome Mix"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl px-4 py-3 outline-none text-sm font-medium transition-colors focus:ring-2"
                style={{ color: 'var(--text-primary)', background: 'var(--bg-primary)', border: '1px solid var(--border)', '--tw-ring-color': 'var(--accent)' } as any}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Description <span className="text-xs font-normal opacity-70">(optional)</span></label>
              <textarea
                placeholder="A collection of my favorite tracks..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl px-4 py-3 outline-none text-sm font-medium transition-colors focus:ring-2 resize-none h-24"
                style={{ color: 'var(--text-primary)', background: 'var(--bg-primary)', border: '1px solid var(--border)', '--tw-ring-color': 'var(--accent)' } as any}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t flex items-center justify-end gap-3" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-bold transition-colors hover:bg-black/5"
              style={{ color: 'var(--text-muted)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={loading || !name.trim()}
              className="aurora-bg px-6 py-2.5 text-white rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? 'Creating...' : <><Plus size={18} /> Create</>}
            </button>
          </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
