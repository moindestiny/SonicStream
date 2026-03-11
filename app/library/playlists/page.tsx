'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Library, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import SkeletonLoader from '@/components/SkeletonLoader';
import { useRouter } from 'next/navigation';
import CreatePlaylistModal from '@/components/CreatePlaylistModal';
import toast from 'react-hot-toast';

export default function CustomPlaylistsPage() {
  const { user } = usePlayerStore();
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['custom-playlists', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/playlists?userId=${user!.id}`);
      return res.json();
    },
    enabled: !!user?.id,
  });

  if (!user) {
    if (typeof window !== 'undefined') router.push('/library');
    return null;
  }

  const playlists = data?.playlists || [];

  const handleDelete = async (playlistId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this playlist?')) return;

    try {
      const res = await fetch('/api/playlists', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId }),
      });
      if (!res.ok) throw new Error('Failed to delete playlist');
      toast.success('Playlist deleted');
      refetch();
    } catch {
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="px-4 md:px-8 pb-10 pt-14 md:pt-10 min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Your Playlists</h1>
        <button onClick={() => setIsCreateModalOpen(true)} className="glass-card px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95" style={{ color: 'var(--accent)' }}>
          <Plus size={18} /> New Playlist
        </button>
      </div>

      {isLoading ? (
        <SkeletonLoader count={1} className="h-64 rounded-2xl" />
      ) : playlists.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-2xl">
          <Library size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No playlists yet</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Create your first custom playlist to start saving your favorite tracks.</p>
          <button onClick={() => setIsCreateModalOpen(true)} className="aurora-bg px-6 py-3 text-white rounded-full font-bold text-sm transition-transform hover:scale-105">
            Create Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {playlists.map((playlist: any) => (
            <Link key={playlist.id} href={`/library/playlists/${playlist.id}`} className="group relative block">
              <div className="glass-card p-4 rounded-2xl transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:bg-white/5 dark:hover:bg-white/10 border border-transparent hover:border-white/10 h-full flex flex-col">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-gray-800 to-gray-900 shadow-md">
                  {playlist.coverUrl ? (
                    <Image src={playlist.coverUrl} alt={playlist.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center aurora-bg opacity-80 transition-opacity group-hover:opacity-100">
                      <Library size={40} className="text-white drop-shadow-md" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-base truncate mb-1 transition-colors" style={{ color: 'var(--text-primary)' }}>{playlist.name}</h3>
                  <p className="text-xs font-medium truncate opacity-80" style={{ color: 'var(--text-secondary)' }}>
                    {playlist.songs?.length || 0} track{playlist.songs?.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <button onClick={(e) => handleDelete(playlist.id, e)} className="absolute top-6 right-6 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all bg-black/50 text-white hover:bg-red-500" title="Delete Playlist">
                  <Trash2 size={16} />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}

      <CreatePlaylistModal isOpen={isCreateModalOpen} onClose={() => { setIsCreateModalOpen(false); refetch(); }} />
    </div>
  );
}
