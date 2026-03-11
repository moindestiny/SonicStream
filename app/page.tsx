'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, normalizeSong, getHighQualityImage } from '@/lib/api';
import SongCard from '@/components/SongCard';
import ArtistCard from '@/components/ArtistCard';
import PlaylistCard from '@/components/PlaylistCard';
import SkeletonLoader from '@/components/SkeletonLoader';
import { motion } from 'motion/react';
import { Search, Play, TrendingUp, Music, Headphones, Radio, User } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlayerStore';

const BASE_URL = 'https://jio-saavn-api-delta-steel.vercel.app/api';
const fetcher = async (url: string) => { const res = await fetch(`${BASE_URL}${url}`); return res.json(); };

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Good Night';
}

const moodChips = [
  { label: 'Bollywood', icon: Music, query: 'Bollywood Hits' },
  { label: 'Pop', icon: Headphones, query: 'Pop Hits' },
  { label: 'Chill', icon: Radio, query: 'Chill Vibes' },
  { label: 'Workout', icon: TrendingUp, query: 'Workout Music' },
];

export default function HomePage() {
  const router = useRouter();
  const { setCurrentSong, setQueue, recentlyPlayed, user } = usePlayerStore();

  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending-songs'],
    queryFn: () => fetcher(api.searchSongs('Trending Bollywood Songs', 0, 13)),
  });

  const { data: artistsData, isLoading: artistsLoading } = useQuery({
    queryKey: ['popular-artists'],
    queryFn: () => fetcher(api.searchArtists('Popular Artists', 0, 8)),
  });

  const { data: playlistsData, isLoading: playlistsLoading } = useQuery({
    queryKey: ['top-playlists'],
    queryFn: () => fetcher(api.searchPlaylists('Top', 0, 12)),
  });

  const trendingCards = trendingData?.data?.results?.slice(0, 13) || [];
  const heroItem = trendingCards[0] ? normalizeSong(trendingCards[0]) : null;
  const remainingTrending = trendingCards.slice(1);

  return (
    <div className="px-4 md:px-8 pb-32">
      {/* Greeting + Search */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pt-14 md:pt-4">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="min-w-0 shrink-0 pr-4">
            <p className="text-xs md:text-sm font-semibold mb-0.5 md:mb-1 truncate" style={{ color: 'var(--text-muted)' }}>{getGreeting()}, {user?.name?.split(' ')[0] || 'User'}</p>
            <h1 className="text-xl md:text-3xl font-extrabold tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>Discover Music</h1>
          </div>
          <button onClick={() => router.push('/profile')} className="md:hidden p-2 rounded-full glass-card shrink-0 hover:scale-105 transition-transform" style={{ color: 'var(--text-primary)' }} title="Profile">
            <User size={18} />
          </button>
        </div>
        
        <div className="flex items-center gap-2 glass-card rounded-full px-4 py-2.5 md:py-3 w-full md:max-w-md cursor-pointer min-w-0 shadow-sm" onClick={() => router.push('/search')}>
          <Search size={18} className="shrink-0" style={{ color: 'var(--text-muted)' }} />
          <span className="text-xs md:text-sm truncate" style={{ color: 'var(--text-muted)' }}>Search songs, artists, albums...</span>
        </div>
      </header>

      {/* Quick Play — Recently Played */}
      {recentlyPlayed.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {recentlyPlayed.slice(0, 8).map((song) => (
              <button
                key={song.id}
                onClick={() => { setCurrentSong(song); setQueue(recentlyPlayed); }}
                className="flex items-center gap-3 rounded-xl overflow-hidden group transition-all glass-card"
              >
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image src={getHighQualityImage(song.image)} alt={song.name} fill className="object-cover" referrerPolicy="no-referrer" />
                </div>
                <span className="text-sm font-semibold truncate pr-3" style={{ color: 'var(--text-primary)' }}>{song.name}</span>
              </button>
            ))}
          </div>
        </motion.section>
      )}

      {/* Hero */}
      {trendingLoading ? (
        <SkeletonLoader className="h-[35vh] min-h-[280px] mb-10 rounded-2xl" />
      ) : heroItem && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative h-[30vh] md:h-[38vh] min-h-[240px] rounded-2xl md:rounded-3xl overflow-hidden mb-10"
          style={{ boxShadow: '0 20px 40px var(--shadow-color)', border: '1px solid var(--border)' }}
        >
          <Image src={getHighQualityImage(heroItem.image)} alt={heroItem.name} fill className="object-cover object-center opacity-50 blur-[1px] scale-105" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 p-4 md:p-10 flex flex-col justify-end">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-2 mb-2 md:mb-3">
                <span className="aurora-bg px-2.5 py-0.5 md:px-3 md:py-1 text-white text-[10px] font-bold tracking-widest uppercase rounded-full">
                  Trending #1
                </span>
              </div>
              <h2 className="text-2xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-1 md:mb-2 text-white line-clamp-2" dangerouslySetInnerHTML={{ __html: heroItem.name }} />
              <p className="text-xs md:text-base font-medium text-gray-300 mb-3 md:mb-5 line-clamp-1">
                {heroItem.artists?.primary?.map((a: any) => a.name).join(', ') || 'Unknown Artist'}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setCurrentSong(heroItem); if (trendingCards.length) setQueue(trendingCards.map(normalizeSong)); }}
                  className="aurora-bg px-6 py-3 text-white font-bold text-sm rounded-full hover:scale-105 transition-transform flex items-center gap-2"
                >
                  <Play size={18} fill="currentColor" /> Play Now
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Mood Chips */}
      <section className="mb-10">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {moodChips.map((mood) => (
            <button
              key={mood.label}
              onClick={() => router.push(`/search?q=${encodeURIComponent(mood.query)}`)}
              className="glass-card flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap transition-all hover:scale-105"
              style={{ color: 'var(--text-primary)' }}
            >
              <mood.icon size={16} style={{ color: 'var(--accent)' }} />
              <span className="text-sm font-semibold">{mood.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Content Sections */}
      <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="space-y-12">
        {/* Curated */}
        <motion.section variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Curated For You</h2>
          </div>
          {trendingLoading ? (
            <SkeletonLoader count={5} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {remainingTrending.map((song: any) => (
                <SongCard key={`trending-${song.id}`} song={normalizeSong(song)} queue={trendingCards.map(normalizeSong)} />
              ))}
            </div>
          )}
        </motion.section>

        {/* Artists */}
        <motion.section variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Popular Artists</h2>
          </div>
          {artistsLoading ? (
            <SkeletonLoader count={6} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {artistsData?.data?.results?.slice(0, 6).map((artist: any) => (
                <ArtistCard key={`artist-${artist.id}`} artist={artist} />
              ))}
            </div>
          )}
        </motion.section>

        {/* Playlists */}
        <motion.section variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Featured Playlists</h2>
          </div>
          {playlistsLoading ? (
            <SkeletonLoader count={5} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {playlistsData?.data?.results?.slice(0, 12).map((playlist: any) => (
                <PlaylistCard key={`playlist-${playlist.id}`} playlist={playlist} />
              ))}
            </div>
          )}
        </motion.section>
      </motion.div>
    </div>
  );
}
