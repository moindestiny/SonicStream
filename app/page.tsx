'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, normalizeSong, getHighQualityImage, BASE_URL, DEFAULT_STALE_TIME } from '@/lib/api';
import SongCard from '@/components/SongCard';
import ArtistCard from '@/components/ArtistCard';
import PlaylistCard from '@/components/PlaylistCard';
import AlbumCard from '@/components/AlbumCard';
import SkeletonLoader from '@/components/SkeletonLoader';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Play, TrendingUp, Music, Headphones, Radio, User,
  ChevronLeft, ChevronRight, Disc, Star, Sparkles
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlayerStore';

const fetcher = async (url: string) => {
  const res = await fetch(`${BASE_URL}${url}`);
  return res.json();
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning 🌅';
  if (hour < 17) return 'Good Afternoon ☀️';
  if (hour < 21) return 'Good Evening 🌇';
  return 'Good Night 🌙';
}

const moodChips = [
  { label: 'Bollywood Hits 🎵', icon: Music, query: 'Bollywood Hits' },
  { label: 'Pop Hits 🎧', icon: Headphones, query: 'Pop Hits' },
  { label: 'Chill Vibes 🍃', icon: Radio, query: 'Chill Vibes' },
  { label: 'Workout Energy ⚡', icon: TrendingUp, query: 'Workout Energy' },
];

export default function HomePage() {
  const router = useRouter();
  const { setCurrentSong, setQueue, recentlyPlayed, user } = usePlayerStore();
  const [activeSlide, setActiveSlide] = useState(0);

  // Queries
  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending-songs'],
    queryFn: () => fetcher(api.searchSongs('Trending Bollywood Songs', 0, 15)),
    staleTime: DEFAULT_STALE_TIME,
  });

  const { data: artistsData, isLoading: artistsLoading } = useQuery({
    queryKey: ['popular-artists'],
    queryFn: () => fetcher(api.searchArtists('Popular Artists', 0, 8)),
    staleTime: DEFAULT_STALE_TIME,
  });

  const { data: playlistsData, isLoading: playlistsLoading } = useQuery({
    queryKey: ['top-playlists'],
    queryFn: () => fetcher(api.searchPlaylists('Top', 0, 12)),
    staleTime: DEFAULT_STALE_TIME,
  });

  const { data: albumsData, isLoading: albumsLoading } = useQuery({
    queryKey: ['trending-albums'],
    queryFn: () => fetcher(api.searchAlbums('New', 0, 12)),
    staleTime: DEFAULT_STALE_TIME,
  });

  const trendingSongs = (trendingData?.data?.results || []).map(normalizeSong);
  const carouselItems = trendingSongs.slice(0, 4); // Top 4 songs for the carousel
  const remainingTrending = trendingSongs.slice(4);
  const popularArtists = artistsData?.data?.results?.slice(0, 6) || [];
  const featuredPlaylists = playlistsData?.data?.results?.slice(0, 6) || [];
  const trendingAlbums = albumsData?.data?.results?.slice(0, 6) || [];

  // Automatic carousel rotation
  useEffect(() => {
    if (carouselItems.length === 0) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % carouselItems.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [carouselItems.length]);

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev + 1) % carouselItems.length);
  };

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  return (
    <div className="px-4 md:px-8 pb-10">
      {/* Greeting + Search */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pt-14 md:pt-4">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="min-w-0 shrink-0 pr-4">
            <p className="text-xs md:text-sm font-semibold mb-0.5 md:mb-1 truncate" style={{ color: 'var(--text-muted)' }}>
              {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}
            </p>
            <h1 className="text-xl md:text-3xl font-extrabold tracking-tight truncate flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              Discover Music <Sparkles size={20} className="text-yellow-400 animate-pulse" />
            </h1>
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

      {/* Quick Play — Recently Played Grid (Spotify Style Dashboard) */}
      {recentlyPlayed.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-4" style={{ color: 'var(--text-muted)' }}>
            Jump Back In
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentlyPlayed.slice(0, 8).map((song) => (
              <button
                key={song.id}
                onClick={() => { setCurrentSong(song); setQueue(recentlyPlayed); }}
                className="flex items-center gap-3 rounded-2xl overflow-hidden group transition-all duration-300 hover:scale-[1.02] text-left relative glass-card p-2"
                style={{ background: 'var(--bg-card)' }}
              >
                <div className="relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden shadow-md">
                  <Image src={getHighQualityImage(song.image)} alt={song.name} fill className="object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <Play size={16} fill="white" className="text-white scale-90 group-hover:scale-100 transition-all" />
                  </div>
                </div>
                <div className="min-w-0 flex-1 pr-4">
                  <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{song.name}</p>
                  <p className="text-xs truncate opacity-70" style={{ color: 'var(--text-muted)' }}>
                    {song.artists?.primary?.map((a) => a.name).join(', ') || 'Unknown Artist'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </motion.section>
      )}

      {/* Premium Hero Carousel */}
      {trendingLoading ? (
        <SkeletonLoader className="h-[30vh] md:h-[45vh] min-h-[250px] mb-10 rounded-3xl" />
      ) : carouselItems.length > 0 && (
        <div className="relative h-[32vh] md:h-[45vh] min-h-[270px] rounded-3xl overflow-hidden mb-10 group" style={{ border: '1px solid var(--border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)', background: '#0f0f16' }}>
          <AnimatePresence mode="wait">
            {carouselItems.map((item: any, idx: number) => idx === activeSlide && (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 cursor-pointer"
                onClick={() => { setCurrentSong(item); setQueue(carouselItems); }}
              >
                {/* Left Side Background: Blurred Album Art */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <Image
                    src={getHighQualityImage(item.image)}
                    alt=""
                    fill
                    className="object-cover opacity-35 blur-2xl scale-110 saturate-150"
                    referrerPolicy="no-referrer"
                  />
                  {/* Black layer on top of blurred background */}
                  <div className="absolute inset-0 bg-black/50" />
                </div>

                {/* Right Side: Sharp Album Art with Alpha Mask Mix Effect */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                  <Image
                    src={getHighQualityImage(item.image)}
                    alt={item.name}
                    fill
                    className="object-cover object-right"
                    referrerPolicy="no-referrer"
                    style={{
                      maskImage: 'linear-gradient(to right, transparent 30%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0.9) 75%, black 100%)',
                      WebkitMaskImage: 'linear-gradient(to right, transparent 30%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0.9) 75%, black 100%)',
                    }}
                  />
                </div>

                {/* Left: Song Details in Foreground */}
                <div className="absolute inset-0 p-6 md:p-12 flex flex-col justify-center max-w-full md:max-w-[55%] z-20 text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase text-white bg-purple-500/80 shadow-lg backdrop-blur-md">
                      <Star size={10} fill="currentColor" /> Trending #{idx + 1}
                    </span>
                  </div>

                  <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2 line-clamp-2 leading-tight drop-shadow-md">
                    {item.name}
                  </h2>

                  <p className="text-xs md:text-lg font-semibold text-gray-300 mb-5 md:mb-7 line-clamp-1 opacity-80">
                    {item.artists?.primary?.map((a: any) => a.name).join(', ') || 'Unknown Artist'}
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSong(item);
                      setQueue(carouselItems);
                    }}
                    className="aurora-bg px-8 py-3.5 text-white font-bold text-sm rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-2 w-fit"
                  >
                    <Play size={18} fill="currentColor" /> Play Now
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Carousel Navigation Buttons */}
          <button
            onClick={handlePrevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 active:scale-95 transition-all opacity-0 group-hover:opacity-100 z-20"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 active:scale-95 transition-all opacity-0 group-hover:opacity-100 z-20"
          >
            <ChevronRight size={20} />
          </button>

          {/* Centered Dots Indicator */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {carouselItems.map((_: any, idx: number) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setActiveSlide(idx); }}
                className={`h-2 rounded-full transition-all duration-300 ${idx === activeSlide ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
              />
            ))}
          </div>
        </div>
      )}


      {/* Mood/Genre Pill Buttons */}
      <section className="mb-10">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {moodChips.map((mood) => (
            <button
              key={mood.label}
              onClick={() => router.push(`/search?q=${encodeURIComponent(mood.query)}`)}
              className="glass-card flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap transition-all hover:scale-105 hover:bg-white/10"
              style={{ color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            >
              <mood.icon size={16} style={{ color: 'var(--accent)' }} />
              <span className="text-sm font-bold">{mood.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Home Content Sections */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        className="space-y-14"
      >
        {/* Curated Hot Songs */}
        <motion.section variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Hot & Trending</h2>
              <p className="text-xs opacity-60 mt-0.5" style={{ color: 'var(--text-muted)' }}>Top trending songs on rotation</p>
            </div>
          </div>
          {trendingLoading ? (
            <SkeletonLoader count={6} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {remainingTrending.slice(0, 12).map((song: any) => (
                <SongCard key={`trending-${song.id}`} song={normalizeSong(song)} queue={trendingSongs} />
              ))}
            </div>
          )}
        </motion.section>

        {/* Popular Artists */}
        <motion.section variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Popular Artists</h2>
              <p className="text-xs opacity-60 mt-0.5" style={{ color: 'var(--text-muted)' }}>Explore songs from top artist voices</p>
            </div>
          </div>
          {artistsLoading ? (
            <SkeletonLoader count={6} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {popularArtists.map((artist: any) => (
                <ArtistCard key={`artist-${artist.id}`} artist={artist} />
              ))}
            </div>
          )}
        </motion.section>

        {/* Trending New Albums Section (NEW!) */}
        <motion.section variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Hot New Albums</h2>
              <p className="text-xs opacity-60 mt-0.5" style={{ color: 'var(--text-muted)' }}>Latest album launches and records</p>
            </div>
          </div>
          {albumsLoading ? (
            <SkeletonLoader count={6} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {trendingAlbums.map((album: any) => (
                <AlbumCard key={`album-${album.id}`} album={album} />
              ))}
            </div>
          )}
        </motion.section>

        {/* Featured Playlists */}
        <motion.section variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Featured Playlists</h2>
              <p className="text-xs opacity-60 mt-0.5" style={{ color: 'var(--text-muted)' }}>Perfect collections curated for any mood</p>
            </div>
          </div>
          {playlistsLoading ? (
            <SkeletonLoader count={6} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {featuredPlaylists.map((playlist: any) => (
                <PlaylistCard key={`playlist-${playlist.id}`} playlist={playlist} />
              ))}
            </div>
          )}
        </motion.section>
      </motion.div>
    </div>
  );
}
