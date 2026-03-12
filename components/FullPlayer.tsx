'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown, Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Repeat, Shuffle, Heart, Download, MoreHorizontal, ListPlus
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Song, getHighQualityImage, getHighQualityDownloadUrl, formatDuration, api, normalizeSong } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { usePlayerStore } from '@/store/usePlayerStore';
import { downloadSong } from '@/lib/downloadSong';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import AuthModal from '@/components/AuthModal';
import AddToPlaylistModal from '@/components/AddToPlaylistModal';
import toast from 'react-hot-toast';

const BASE_URL = 'https://jio-saavn-api-delta-steel.vercel.app/api';

interface FullPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export default function FullPlayer({
  isOpen, onClose, currentTime, duration, onSeek,
  volume, onVolumeChange, isMuted, onToggleMute
}: FullPlayerProps) {
  const {
    currentSong, isPlaying, togglePlay, playNext, playPrevious,
    repeatMode, setRepeatMode, isShuffle, toggleShuffle,
    favorites, toggleFavorite, setCurrentSong, setQueue
  } = usePlayerStore();

  // Touch handling for swipe down to close (only when at top of scroll)
  const touchStartY = React.useRef(0);
  const touchEndY = React.useRef(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const minSwipeDistance = 80;

  // Touch handling for album cover swipe (left/right to change song)
  const coverTouchStartX = React.useRef(0);
  const coverTouchCurrentX = React.useRef(0);
  const [coverOffset, setCoverOffset] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const minCoverSwipeDistance = 50;

  const onCoverTouchStart = (e: React.TouchEvent) => {
    coverTouchStartX.current = e.targetTouches[0].clientX;
    coverTouchCurrentX.current = e.targetTouches[0].clientX;
    setIsDragging(true);
  };

  const onCoverTouchMove = (e: React.TouchEvent) => {
    const currentX = e.targetTouches[0].clientX;
    coverTouchCurrentX.current = currentX;
    const diff = currentX - coverTouchStartX.current;
    // Limit the drag distance for visual feedback
    setCoverOffset(Math.max(-100, Math.min(100, diff * 0.5)));
  };

  const onCoverTouchEnd = () => {
    const distance = coverTouchCurrentX.current - coverTouchStartX.current;
    setIsDragging(false);
    setCoverOffset(0);
    
    // Swipe left (next song)
    if (distance < -minCoverSwipeDistance) {
      playNext();
    }
    // Swipe right (previous song)
    else if (distance > minCoverSwipeDistance) {
      playPrevious();
    }
    
    // Reset values
    coverTouchStartX.current = 0;
    coverTouchCurrentX.current = 0;
  };

  // Reset scroll position when FullPlayer opens
  React.useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [isOpen, currentSong?.id]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndY.current = e.targetTouches[0].clientY;
    
    // Prevent pull-to-refresh when at top of scroll and swiping down
    const container = scrollContainerRef.current;
    const isAtTop = !container || container.scrollTop <= 5; // Small buffer for floating point
    const isSwipingDown = e.targetTouches[0].clientY > touchStartY.current;
    
    if (isAtTop && isSwipingDown) {
      e.preventDefault();
    }
  };

  const onTouchEnd = () => {
    const container = scrollContainerRef.current;
    const isAtTop = !container || container.scrollTop <= 5;
    const distance = touchEndY.current - touchStartY.current;
    
    // Only close if at top of scroll and swiped down enough
    if (isAtTop && distance > minSwipeDistance) {
      onClose();
    }
    // Reset touch values
    touchStartY.current = 0;
    touchEndY.current = 0;
  };

  const { data: suggestionsData } = useQuery({
    queryKey: ['suggestions', currentSong?.id],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}${api.songSuggestions(currentSong!.id)}`);
      return res.json();
    },
    enabled: !!currentSong,
  });

  if (!currentSong) return null;

  const isFavorite = favorites.includes(currentSong.id);
  const suggestions = (suggestionsData?.data || []).map(normalizeSong);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handlePlaySuggestion = (song: Song) => {
    setCurrentSong(song);
    if (suggestions.length > 0) setQueue(suggestions);
  };

  const { requireAuth, showAuthModal, setShowAuthModal } = useAuthGuard();
  const [showAddPlaylist, setShowAddPlaylist] = React.useState(false);

  const handleDownload = () => downloadSong(currentSong);
  const handleLike = () => requireAuth(() => { toggleFavorite(currentSong.id); toast.success(isFavorite ? 'Removed from liked songs' : 'Added to liked songs'); });
  const handleAddPlaylist = () => requireAuth(() => setShowAddPlaylist(true));

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="full-player"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] flex flex-col overflow-hidden"
            style={{ background: 'var(--bg-primary)', touchAction: 'pan-x pan-y' }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Blurred background art */}
            <div className="absolute inset-0 z-0 opacity-30 blur-3xl scale-125 pointer-events-none saturate-150">
              <Image src={getHighQualityImage(currentSong.image)} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: 'linear-gradient(to top, var(--bg-primary), transparent 40%)' }} />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between p-4 md:p-6">
              <button onClick={onClose} className="p-2.5 rounded-xl transition-all hover:scale-105 glass-card" style={{ color: 'var(--text-primary)' }}>
                <ChevronDown size={22} />
              </button>
              <div className="text-center">
                <p className="text-[9px] uppercase tracking-[0.2em] font-bold mb-0.5" style={{ color: 'var(--accent)' }}>Playing from</p>
                <p className="text-xs font-semibold truncate max-w-[180px]" style={{ color: 'var(--text-secondary)' }}>{currentSong.album?.name || 'Now Playing'}</p>
              </div>
              <button onClick={handleDownload} className="p-2.5 rounded-xl transition-all hover:scale-105 glass-card" style={{ color: 'var(--text-primary)' }}>
                <Download size={20} />
              </button>
            </div>

            <div ref={scrollContainerRef} className="relative z-10 flex-1 overflow-y-auto px-4 md:px-8 pb-20">
              <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-full py-4 md:py-8">
                {/* Album Art with vinyl effect */}
                <div className="flex flex-col items-center justify-center">
                  <motion.div
                    layoutId="player-album-art"
                    className="relative w-full max-w-[420px] aspect-square rounded-3xl overflow-hidden group"
                    style={{ 
                      boxShadow: '0 24px 48px var(--shadow-color)', 
                      border: '1px solid var(--border)',
                      x: coverOffset
                    }}
                    animate={{ x: coverOffset }}
                    transition={{ type: 'tween', ease: 'easeOut', duration: 0.1 }}
                    onTouchStart={onCoverTouchStart}
                    onTouchMove={onCoverTouchMove}
                    onTouchEnd={onCoverTouchEnd}
                  >
                    <Image src={getHighQualityImage(currentSong.image)} alt={currentSong.name} fill className="object-cover" referrerPolicy="no-referrer" />
                  </motion.div>
                </div>

                {/* Info & Controls */}
                <div className="flex flex-col gap-8">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0 overflow-hidden mask-edges relative">
                      {/* For Marquee we render the content duplicated inside an inline-flex that translates to -50% to create a seamless infinite loop */}
                      <div className="animate-marquee pause-marquee flex gap-12 lg:gap-24">
                        <div className="flex flex-col items-start gap-0.5">
                          <h1 className="text-xl md:text-3xl lg:text-5xl font-bold md:font-extrabold tracking-tight leading-tight whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{currentSong.name}</h1>
                          <div className="text-xs md:text-sm lg:text-lg font-semibold text-left whitespace-nowrap">
                            {currentSong.artists?.primary?.map((artist, idx) => (
                              <span key={artist.id || idx}>
                                <Link 
                                  href={artist.id ? `/artist/${artist.id}` : '#'} 
                                  onClick={(e) => { 
                                    if (!artist.id) {
                                      e.preventDefault(); 
                                    } else {
                                      onClose();
                                    }
                                  }} 
                                  className="transition-colors hover:underline cursor-pointer pointer-events-auto" 
                                  style={{ color: 'var(--text-secondary)' }}
                                >
                                  {artist.name}
                                </Link>
                                {idx < currentSong.artists.primary.length - 1 && <span className="mx-1" style={{ color: 'var(--text-muted)' }}>,</span>}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Duplicated for seamless mobile scroll visually, hidden on desktop */}
                        <div className="flex flex-col items-start gap-0.5" aria-hidden="true">
                          <h1 className="text-xl md:text-3xl lg:text-5xl font-bold md:font-extrabold tracking-tight leading-tight whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{currentSong.name}</h1>
                          <div className="text-xs md:text-sm lg:text-lg font-semibold text-left whitespace-nowrap">
                            {currentSong.artists?.primary?.map((artist, idx) => (
                              <span key={artist.id || idx}>
                                <Link 
                                  href={artist.id ? `/artist/${artist.id}` : '#'} 
                                  onClick={(e) => { 
                                    if (!artist.id) {
                                      e.preventDefault(); 
                                    } else {
                                      onClose();
                                    }
                                  }} 
                                  className="transition-colors hover:underline cursor-pointer pointer-events-auto" 
                                  style={{ color: 'var(--text-secondary)' }}
                                >
                                  {artist.name}
                                </Link>
                                {idx < currentSong.artists.primary.length - 1 && <span className="mx-1" style={{ color: 'var(--text-muted)' }}>,</span>}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0 self-start">
                      <button onClick={handleAddPlaylist} className="p-2.5 rounded-xl transition-all glass-card hover:bg-white/10" style={{ color: 'var(--text-muted)' }} title="Add to Playlist">
                        <ListPlus size={22} />
                      </button>
                      <button onClick={handleLike} className="p-2.5 rounded-xl transition-all glass-card hover:bg-white/10" style={{ color: isFavorite ? 'var(--accent)' : 'var(--text-muted)' }} title="Like Song">
                        <Heart size={22} fill={isFavorite ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>

                  {/* Seekbar */}
                  <div className="space-y-3">
                    <div className="relative h-2 w-full rounded-full overflow-hidden cursor-pointer" style={{ background: 'var(--border)' }}>
                      <input type="range" min={0} max={duration || 0} step={0.1} value={currentTime} onChange={(e) => onSeek(parseFloat(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" />
                      <div className="absolute top-0 left-0 h-full rounded-full transition-all duration-150" style={{ width: `${progress}%`, background: 'var(--accent)' }} />
                    </div>
                    <div className="flex justify-between text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                      <span>{formatDuration(Math.floor(currentTime))}</span>
                      <span>{formatDuration(Math.floor(duration))}</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <button onClick={toggleShuffle} className="p-3 rounded-xl transition-all" style={{ color: isShuffle ? 'var(--accent)' : 'var(--text-muted)' }}>
                      <Shuffle size={20} />
                    </button>
                    <div className="flex items-center gap-6 md:gap-8">
                      <button onClick={playPrevious} className="hover:scale-110 transition-transform" style={{ color: 'var(--text-primary)' }}>
                        <SkipBack size={28} fill="currentColor" />
                      </button>
                      <button onClick={togglePlay} className="w-16 h-16 md:w-18 md:h-18 rounded-full flex items-center justify-center text-white hover:scale-105 transition-all" style={{ background: 'var(--accent)', boxShadow: `0 8px 24px var(--accent-glow)` }}>
                        {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                      </button>
                      <button onClick={playNext} className="hover:scale-110 transition-transform" style={{ color: 'var(--text-primary)' }}>
                        <SkipForward size={28} fill="currentColor" />
                      </button>
                    </div>
                    <button onClick={() => { const modes: ('none' | 'one' | 'all')[] = ['none', 'all', 'one']; setRepeatMode(modes[(modes.indexOf(repeatMode) + 1) % modes.length]); }} className="relative p-3 rounded-xl transition-all" style={{ color: repeatMode !== 'none' ? 'var(--accent)' : 'var(--text-muted)' }}>
                      <Repeat size={20} />
                      {repeatMode === 'one' && <span className="absolute top-1 right-1 text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center text-white" style={{ background: 'var(--accent)' }}>1</span>}
                    </button>
                  </div>

                  {/* Volume */}
                  <div className="flex items-center gap-4">
                    <button onClick={onToggleMute} className="transition-colors" style={{ color: 'var(--text-muted)' }}>
                      {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <div className="relative h-1.5 flex-1 rounded-full overflow-hidden cursor-pointer" style={{ background: 'var(--border)' }}>
                      <input type="range" min={0} max={1} step={0.01} value={isMuted ? 0 : volume} onChange={(e) => onVolumeChange(parseFloat(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" />
                      <div className="absolute top-0 left-0 h-full rounded-full transition-all" style={{ width: `${(isMuted ? 0 : volume) * 100}%`, background: 'var(--accent)' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Songs */}
              {suggestions.length > 0 && (
                <div className="max-w-5xl mx-auto mt-12 mb-8">
                  <h2 className="text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Up Next</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {suggestions.slice(0, 10).map((song: Song) => (
                      <div key={song.id} onClick={() => handlePlaySuggestion(song)} className="glass-card rounded-xl overflow-hidden cursor-pointer group">
                        <div className="relative aspect-square overflow-hidden">
                          <Image src={getHighQualityImage(song.image)} alt={song.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Play size={24} fill="currentColor" className="text-white" />
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold truncate text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>{song.name}</h3>
                          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{song.artists?.primary?.map(a => a.name).join(', ')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AddToPlaylistModal isOpen={showAddPlaylist} onClose={() => setShowAddPlaylist(false)} songId={currentSong.id} />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
