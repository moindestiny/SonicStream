'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api, getHighQualityImage, formatDuration, normalizeSong } from '@/lib/api';
import { Play, CheckCircle2, Music, UserPlus, UserCheck, TrendingUp, Plus } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import Image from 'next/image';
import AlbumCard from '@/components/AlbumCard';
import SongCard from '@/components/SongCard';
import ArtistCard from '@/components/ArtistCard';
import SkeletonLoader from '@/components/SkeletonLoader';
import InfiniteArtistSection from '@/components/InfiniteArtistSection';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import AuthModal from '@/components/AuthModal';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

const BASE_URL = 'https://jio-saavn-api-delta-steel.vercel.app/api';

export default function ArtistPage() {
  const { id } = useParams();
  const { requireAuth, showAuthModal, setShowAuthModal } = useAuthGuard();
  const { user } = usePlayerStore();
  const [imgError, setImgError] = useState(false);

  const { data: artistData, isLoading } = useQuery({
    queryKey: ['artist', id],
    queryFn: async () => { const res = await fetch(`${BASE_URL}${api.artistDetails(id as string)}`); return res.json(); },
    enabled: !!id,
  });

  // Follow state
  const { data: followData, refetch: refetchFollow } = useQuery({
    queryKey: ['follow-status', user?.id, id],
    queryFn: async () => {
      const res = await fetch(`/api/follows?userId=${user!.id}`);
      const data = await res.json();
      return data.follows?.some((f: any) => f.artistId === id) || false;
    },
    enabled: !!user?.id && !!id,
  });

  const isFollowing = followData === true;

  const handleFollow = () => {
    requireAuth(async () => {
      try {
        if (isFollowing) {
          await fetch('/api/follows', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user!.id, artistId: id }),
          });
          toast.success('Unfollowed artist');
        } else {
          const artistName = artist?.name || '';
          const artistImage = getHighQualityImage(artist?.image);
          await fetch('/api/follows', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user!.id, artistId: id, artistName, artistImage }),
          });
          toast.success(`Following ${artistName}!`);
        }
        refetchFollow();
      } catch {
        toast.error('Something went wrong');
      }
    });
  };

  const { setCurrentSong, setQueue, currentSong, isPlaying, addToQueue } = usePlayerStore();

  const rawArtist = artistData?.data || artistData;
  const artist = Array.isArray(rawArtist) ? rawArtist[0] : rawArtist;
  const isArtistNotFound = !isLoading && (!artist || (!artist.id && !artist.name));

  // Suggested content for not-found fallback
  const { data: suggestedSongs } = useQuery({
    queryKey: ['suggested-songs-fallback'],
    queryFn: async () => { const res = await fetch(`${BASE_URL}${api.searchSongs('Trending Bollywood Songs', 0, 10)}`); return res.json(); },
    enabled: isArtistNotFound,
  });
  const { data: suggestedArtists } = useQuery({
    queryKey: ['suggested-artists-fallback'],
    queryFn: async () => { const res = await fetch(`${BASE_URL}${api.searchArtists('Popular Artists', 0, 8)}`); return res.json(); },
    enabled: isArtistNotFound,
  });

  if (isLoading) return <div className="p-8"><SkeletonLoader className="h-80 rounded-2xl" /></div>;

  // Beautiful not-found fallback with suggestions
  if (isArtistNotFound) {
    const fallbackSongs = suggestedSongs?.data?.results?.slice(0, 10) || [];
    const fallbackArtists = suggestedArtists?.data?.results?.slice(0, 6) || [];

    return (
      <div className="px-4 md:px-8 pb-10">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden p-8 md:p-14 text-center mb-12 mt-4"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-tertiary), var(--accent-ocean))' }}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)' }}>
              <Music size={36} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">Artist Not Found</h1>
            <p className="text-base md:text-lg text-white/70 max-w-md mx-auto">
              We couldn&apos;t find the artist you&apos;re looking for. But here are some gems you might love!
            </p>
          </div>
        </motion.div>

        {/* Suggested Songs */}
        {fallbackSongs.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={20} style={{ color: 'var(--accent)' }} />
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Trending Songs</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {fallbackSongs.map((s: any) => (
                <SongCard key={s.id} song={normalizeSong(s)} queue={fallbackSongs.map(normalizeSong)} />
              ))}
            </div>
          </section>
        )}

        {/* Suggested Artists */}
        {fallbackArtists.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Popular Artists</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {fallbackArtists.map((a: any) => (
                <ArtistCard key={a.id} artist={a} />
              ))}
            </div>
          </section>
        )}

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  const topSongs = (artist.topSongs?.data || artist.topSongs || artist.songs?.data || artist.songs || []).map(normalizeSong);
  const topAlbums = artist.topAlbums?.data || artist.topAlbums || artist.albums?.data || artist.albums || [];

  const artistImageUrl = getHighQualityImage(artist.image);
  const hasValidImage = artistImageUrl && !artistImageUrl.startsWith('data:') && !imgError;

  const handlePlayTopSongs = () => { if (topSongs.length > 0) { setCurrentSong(topSongs[0]); setQueue(topSongs); } };
  const handlePlaySong = (song: any) => { setCurrentSong(song); setQueue(topSongs); };

  return (
    <div className="relative min-h-screen pb-10">
      <div className="absolute top-8 left-6 z-20">
        <button onClick={() => window.history.back()} className="p-2.5 rounded-full glass-card transition-all hover:scale-105" style={{ color: 'var(--text-primary)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>
      </div>
      {/* Hero */}
      <div className="relative h-[45vh] md:h-[55vh] min-h-[350px] flex items-end p-5 md:p-8 pt-20 md:pt-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {hasValidImage ? (
            <Image src={artistImageUrl} alt={artist.name} fill className="object-cover object-center opacity-40 scale-105" referrerPolicy="no-referrer" onError={() => setImgError(true)} />
          ) : (
            <div className="w-full h-full aurora-bg opacity-50" />
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--bg-primary), transparent 60%)' }} />
        </div>
        <div className="relative z-10 w-full">
          <div className="flex items-center gap-2 mb-3 glass-card w-fit px-3 py-1.5 rounded-full">
            <CheckCircle2 size={16} style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>Verified Artist</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>{artist.name}</h1>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
            {parseInt(artist.fanCount || '0').toLocaleString()} monthly listeners
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="px-5 md:px-8 py-5 flex items-center gap-4 relative z-10">
        <button onClick={handlePlayTopSongs} className="w-14 h-14 aurora-bg rounded-full flex items-center justify-center text-white hover:scale-105 transition-all">
          <Play size={26} fill="currentColor" className="ml-0.5" />
        </button>
        <button onClick={handleFollow} className="px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 glass-card" style={{ color: isFollowing ? 'var(--accent)' : 'var(--text-primary)' }}>
          {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>

      {/* Popular Songs + About */}
      <div className="px-4 md:px-8 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8 mb-12 relative z-10">
        <div>
          <h2 className="text-xl font-bold mb-5" style={{ color: 'var(--text-primary)' }}>Popular</h2>
          <div className="flex flex-col gap-0.5">
            {topSongs.slice(0, 5).map((song: any, index: number) => {
              const isCurrent = currentSong?.id === song.id;
              return (
                <div key={song.id} onClick={() => handlePlaySong(song)}
                  className="flex items-center gap-3 md:gap-4 px-3 md:px-4 py-2.5 md:py-3 rounded-xl cursor-pointer group transition-all"
                  style={{ background: isCurrent ? 'var(--bg-card-hover)' : 'transparent' }}
                >
                  <div className="w-5 md:w-8 flex flex-shrink-0 justify-center items-center">
                    <span className="text-xs md:text-sm font-medium" style={{ color: isCurrent ? 'var(--accent)' : 'var(--text-muted)' }}>
                      {isCurrent && isPlaying ? (
                        <div className="flex items-end gap-0.5 h-3">
                          <div className="w-0.5 eq-bar rounded-t-sm" style={{ background: 'var(--accent)' }} />
                          <div className="w-0.5 eq-bar rounded-t-sm" style={{ background: 'var(--accent)', animationDelay: '0.2s' }} />
                        </div>
                      ) : index + 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative w-10 h-10 md:w-11 md:h-11 flex-shrink-0 rounded-lg overflow-hidden">
                      <Image src={getHighQualityImage(song.image)} alt={song.name} fill className="object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate mb-0.5" style={{ color: isCurrent ? 'var(--accent)' : 'var(--text-primary)' }}>{song.name}</p>
                      <p className="text-xs truncate opacity-80" style={{ color: 'var(--text-muted)' }}>{song.artists?.primary?.map((a: any) => a.name).join(', ')}</p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                    <button 
                      onClick={(e) => { e.stopPropagation(); addToQueue(song); toast.success(`Added to queue`); }}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      style={{ color: 'var(--text-muted)' }}
                      title="Add to queue"
                    >
                      <Plus size={14} />
                    </button>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: 'var(--text-muted)', background: 'var(--bg-card)' }}>
                      {parseInt(song.playCount || '0').toLocaleString()} plays
                    </span>
                  </div>
                  <span className="text-xs md:text-sm flex-shrink-0 text-right w-10 md:w-12 block" style={{ color: 'var(--text-muted)' }}>{formatDuration(song.duration)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* About */}
        <div>
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>About</h2>
          <div className="glass-card p-5 rounded-2xl">
            {hasValidImage && (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4">
                <Image src={artistImageUrl} alt={artist.name} fill className="object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
            <p className="text-sm leading-relaxed line-clamp-6" style={{ color: 'var(--text-secondary)' }}>
              {artist.bio?.[0]?.text || artist.bio?.text || `${artist.name} is a talented artist with ${parseInt(artist.fanCount || '0').toLocaleString()} followers on SonicStream.`}
            </p>
          </div>
        </div>
      </div>

      {/* Albums & Songs Sections */}
      <div className="px-4 md:px-8 space-y-10">
        <InfiniteArtistSection key={`albums-${id}`} type="albums" artistId={id as string} title="Albums" apiEndpoint={api.artistAlbums} initialData={topAlbums} />
        <InfiniteArtistSection key={`songs-${id}`} type="songs" artistId={id as string} title="All Songs" apiEndpoint={api.artistSongs} />
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
