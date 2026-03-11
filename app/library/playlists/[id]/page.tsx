'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Play, Clock, Library, Trash2, ArrowLeft } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import Image from 'next/image';
import Link from 'next/link';
import SkeletonLoader from '@/components/SkeletonLoader';
import toast from 'react-hot-toast';
import { api, normalizeSong } from '@/lib/api';

const BASE_URL = 'https://jio-saavn-api-delta-steel.vercel.app/api';

export default function CustomPlaylistViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, setCurrentSong, setQueue, currentSong, isPlaying } = usePlayerStore();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['custom-playlist', id],
    queryFn: async () => {
      // The general /api/playlists fetches all. Let's just fetch all and filter client side for simplicity
      // In production, you'd add a GET /api/playlists/[id] route
      const res = await fetch(`/api/playlists?userId=${user!.id}`);
      const json = await res.json();
      return json.playlists?.find((p: any) => p.id === id);
    },
    enabled: !!user?.id && !!id,
  });

  const playlist = data;
  const songIds = playlist?.songs?.map((s: any) => s.songId) || [];

  const { data: songsData, isLoading: isSongsLoading } = useQuery({
    queryKey: ['playlist-songs', songIds.join(',')],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}${api.songDetails(songIds.join(','))}`);
      return res.json();
    },
    enabled: songIds.length > 0,
  });

  if (isLoading) return <div className="p-8"><SkeletonLoader className="h-80 rounded-2xl" /></div>;
  if (!data) return <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Playlist not found</div>;

  const songs = songsData?.data?.map(normalizeSong) || [];

  const handlePlayAll = () => { if (songs.length > 0) { setCurrentSong(songs[0]); setQueue(songs); } };
  const handlePlaySong = (song: any) => { setCurrentSong(song); setQueue(songs); };

  const handleRemoveSong = async (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'removeSong', playlistId: playlist.id, songId }),
      });
      if (!res.ok) throw new Error('Failed to remove song');
      toast.success('Song removed');
      refetch(); // Refetch playlist
    } catch {
      toast.error('Something went wrong');
    }
  };

  const formatDuration = (seconds?: number | string) => {
    if (!seconds) return '0:00';
    const num = typeof seconds === 'string' ? parseInt(seconds, 10) : seconds;
    const m = Math.floor(num / 60);
    const s = Math.floor(num % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative min-h-screen pb-32">
      <div className="absolute top-8 left-6 z-20">
        <button onClick={() => router.back()} className="p-2.5 rounded-full glass-card transition-all hover:scale-105" style={{ color: 'var(--text-primary)' }}>
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* Hero */}
      <div className="relative min-h-[350px] md:h-[40vh] flex items-end p-5 md:p-8 pt-20 md:pt-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
           <div className="absolute inset-0 aurora-bg opacity-30 saturate-150" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--bg-primary), transparent)' }} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 w-full">
          <div className="relative w-48 h-48 md:w-56 md:h-56 flex-shrink-0 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10">
            {playlist.coverUrl ? (
              <Image src={playlist.coverUrl} alt={playlist.name} fill className="object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center aurora-bg opacity-80">
                <Library size={64} className="text-white drop-shadow-md" />
              </div>
            )}
          </div>
          <div className="flex-1 w-full text-center md:text-left">
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--accent-secondary)' }}>Custom Playlist</p>
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tight mb-3 leading-tight" style={{ color: 'var(--text-primary)' }}>{playlist.name}</h1>
            {playlist.description && <p className="text-sm md:text-base font-medium opacity-70 mb-4 max-w-xl mx-auto md:mx-0" style={{ color: 'var(--text-secondary)' }}>{playlist.description}</p>}
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm font-bold" style={{ color: 'var(--text-muted)' }}>
              <span className="text-white">{user?.name}</span>
              <span className="w-1 h-1 rounded-full bg-current opacity-30" />
              <span>{songs.length} song{songs.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-5 md:px-8 py-5 flex items-center gap-4 sticky top-0 z-20 backdrop-blur-xl border-b border-transparent transition-colors" style={{ background: 'var(--bg-primary-transparent)' }}>
        <button onClick={handlePlayAll} disabled={songs.length === 0} className="w-14 h-14 aurora-bg rounded-full flex items-center justify-center text-white hover:scale-105 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:hover:scale-100">
          <Play size={24} fill="currentColor" className="ml-1" />
        </button>
      </div>

      {/* Tracklist */}
      <div className="px-4 md:px-8 mt-4">
        <div className="grid grid-cols-[32px_1fr_80px] md:grid-cols-[40px_1fr_auto] gap-4 px-4 py-2 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2 border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
          <div className="text-center">#</div>
          <div>Title</div>
          <div className="flex justify-end md:pr-4"><Clock size={16} /></div>
        </div>

        <div className="flex flex-col gap-1">
          {songIds.length === 0 ? (
            <div className="py-10 text-center text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              This playlist is empty. Find some music and add it!
            </div>
          ) : isSongsLoading ? (
            <div className="py-4 space-y-3">
              {[...Array(songIds.length)].map((_, i) => <SkeletonLoader key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : (
            songs.map((song: any, index: number) => {
              const isCurrent = currentSong?.id === song.id;
              return (
                <div key={`${song.id}-${index}`} onClick={() => handlePlaySong(song)}
                  className="grid grid-cols-[32px_1fr_auto] md:grid-cols-[40px_1fr_auto] gap-4 px-3 md:px-4 py-2.5 md:py-3 rounded-xl cursor-pointer group transition-all items-center hover:bg-white/5 active:bg-white/10"
                  style={{ background: isCurrent ? 'var(--bg-card-hover)' : 'transparent' }}
                >
                  <div className="flex justify-center items-center">
                    <span className="text-xs md:text-sm font-bold group-hover:hidden" style={{ color: isCurrent ? 'var(--accent)' : 'var(--text-muted)' }}>
                      {isCurrent && isPlaying ? (
                        <div className="flex items-end gap-0.5 h-3">
                          <div className="w-0.5 eq-bar rounded-t-sm" style={{ background: 'var(--accent)' }} />
                          <div className="w-0.5 eq-bar rounded-t-sm" style={{ background: 'var(--accent)', animationDelay: '0.2s' }} />
                        </div>
                      ) : index + 1}
                    </span>
                    <Play size={14} fill="currentColor" className="hidden group-hover:block" style={{ color: 'var(--text-primary)' }} />
                  </div>
                  <div className="flex items-center gap-3 min-w-0">
                    {song.image && (
                      <div className="relative w-10 h-10 md:w-11 md:h-11 flex-shrink-0 rounded-lg overflow-hidden bg-gray-800 shadow-sm">
                        <Image src={song.image[song.image.length - 1]?.url || song.image[0]?.url} alt={song.name} fill className="object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm md:text-base truncate mb-0.5" style={{ color: isCurrent ? 'var(--accent)' : 'var(--text-primary)' }}>{song.name}</p>
                      <p className="text-[11px] md:text-xs truncate opacity-70 font-medium" style={{ color: 'var(--text-muted)' }}>
                        {song.artists?.primary?.map((a: any) => a.name).join(', ') || 'Unknown Artist'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-4">
                    <button onClick={(e) => handleRemoveSong(song.id, e)} className="p-2 rounded-full md:opacity-0 group-hover:opacity-100 transition-all text-red-400/70 hover:text-red-400 hover:bg-black/20" title="Remove from playlist">
                      <Trash2 size={16} />
                    </button>
                    <span className="text-xs md:text-sm font-bold w-10 md:w-12 text-right opacity-60" style={{ color: 'var(--text-muted)' }}>
                      {formatDuration(song.duration)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
