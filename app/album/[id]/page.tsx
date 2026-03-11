'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api, getHighQualityImage, formatDuration, normalizeSong, getHighQualityDownloadUrl } from '@/lib/api';
import { Play, Pause, Heart, Clock, Download, Plus } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import Image from 'next/image';
import Link from 'next/link';
import SkeletonLoader from '@/components/SkeletonLoader';
import { downloadSong } from '@/lib/downloadSong';
import toast from 'react-hot-toast';

const BASE_URL = 'https://jio-saavn-api-delta-steel.vercel.app/api';

export default function AlbumPage() {
  const { id } = useParams();
  const { data: albumData, isLoading } = useQuery({
    queryKey: ['album', id],
    queryFn: async () => { const res = await fetch(`${BASE_URL}${api.albumDetails(id as string)}`); return res.json(); },
    enabled: !!id,
  });
  const { setCurrentSong, setQueue, currentSong, isPlaying, addToQueue } = usePlayerStore();

  if (isLoading) return <div className="p-8"><SkeletonLoader className="h-80 rounded-2xl" /></div>;
  if (!albumData?.data) return <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Album not found</div>;

  const album = albumData.data;
  const songs = (album.songs || []).map(normalizeSong);

  const handlePlayAll = () => { if (songs.length > 0) { setCurrentSong(songs[0]); setQueue(songs); } };
  const handlePlaySong = (song: any) => { setCurrentSong(song); setQueue(songs); };

  const handleDownloadSong = (song: any, e: React.MouseEvent) => {
    e.stopPropagation();
    downloadSong(song);
  };

  return (
    <div className="relative min-h-screen pb-10">
      <div className="absolute top-8 left-6 z-20">
        <button onClick={() => window.history.back()} className="p-2.5 rounded-full glass-card transition-all hover:scale-105" style={{ color: 'var(--text-primary)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
      </div>
      {/* Hero */}
      <div className="relative h-[45vh] md:h-[40vh] min-h-[350px] flex items-end p-5 md:p-8 pt-20 md:pt-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src={getHighQualityImage(album.image)} alt={album.name} fill className="object-cover opacity-30 blur-2xl scale-125 saturate-150" referrerPolicy="no-referrer" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--bg-primary), transparent)' }} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-end gap-6 md:gap-8 w-full">
          <div className="relative w-48 h-48 md:w-56 md:h-56 flex-shrink-0 rounded-2xl overflow-hidden" style={{ boxShadow: '0 16px 40px var(--shadow-color)', border: '1px solid var(--border)' }}>
            <Image src={getHighQualityImage(album.image)} alt={album.name} fill className="object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="flex-1 pb-1">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>Album</p>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>{album.name}</h1>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {album.artists?.primary?.length > 0 ? (
                <Link href={`/artist/${album.artists.primary[0].id}`} className="font-bold hover:underline" style={{ color: 'var(--text-primary)' }}>{album.artists.primary[0].name}</Link>
              ) : <span className="font-bold">Unknown Artist</span>}
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span>{album.year}</span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span>{album.songCount} songs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-5 md:px-8 py-5 flex items-center gap-4 relative z-10">
        <button onClick={handlePlayAll} className="w-14 h-14 aurora-bg rounded-full flex items-center justify-center text-white hover:scale-105 transition-all">
          <Play size={26} fill="currentColor" className="ml-0.5" />
        </button>
      </div>

      {/* Track List */}
      <div className="px-3 md:px-8 relative z-10">
        <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-2 text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
          <span className="w-8 text-center">#</span>
          <span>Title</span>
          <span></span>
          <span></span>
          <div className="flex justify-end w-16"><Clock size={14} /></div>
        </div>

        <div className="flex flex-col gap-0.5">
          {songs.map((song: any, index: number) => {
            const isCurrent = currentSong?.id === song.id;
            return (
              <div key={song.id} onClick={() => handlePlaySong(song)}
                className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-3 rounded-xl cursor-pointer group transition-all items-center"
                style={{ background: isCurrent ? 'var(--bg-card-hover)' : 'transparent' }}
              >
                <div className="w-8 flex justify-center items-center">
                  <span className={`text-sm font-medium ${isCurrent ? '' : 'group-hover:hidden'}`} style={{ color: isCurrent ? 'var(--accent)' : 'var(--text-muted)' }}>
                    {isCurrent && isPlaying ? (
                      <div className="flex items-end gap-0.5 h-3">
                        <div className="w-0.5 eq-bar rounded-t-sm" style={{ background: 'var(--accent)' }} />
                        <div className="w-0.5 eq-bar rounded-t-sm" style={{ background: 'var(--accent)', animationDelay: '0.2s' }} />
                      </div>
                    ) : index + 1}
                  </span>
                  <Play size={14} fill="currentColor" className="hidden group-hover:block" style={{ color: 'var(--text-primary)' }} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate mb-0.5" style={{ color: isCurrent ? 'var(--accent)' : 'var(--text-primary)' }}>{song.name}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                    {song.artists?.primary?.length > 0 ? song.artists.primary.map((a: any) => a.name).join(', ') : 'Unknown Artist'}
                  </p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); addToQueue(song); toast.success(`Added to queue`); }} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hidden md:block" style={{ color: 'var(--text-muted)' }} title="Add to queue">
                  <Plus size={14} />
                </button>
                <button onClick={(e) => handleDownloadSong(song, e)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hidden md:block" style={{ color: 'var(--text-muted)' }} title="Download">
                  <Download size={14} />
                </button>
                <div className="flex justify-end text-sm font-medium w-16" style={{ color: 'var(--text-muted)' }}>
                  {formatDuration(song.duration)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
