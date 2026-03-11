'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { getHighQualityDownloadUrl, getHighQualityImage, formatDuration, Song } from '@/lib/api';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Repeat, Shuffle, Heart, ListMusic, Maximize2, Download, X, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import FullPlayer from './FullPlayer';
import { downloadSong } from '@/lib/downloadSong';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import AuthModal from '@/components/AuthModal';
import toast from 'react-hot-toast';

export default function Player() {
  const {
    currentSong, isPlaying, togglePlay, playNext, playPrevious,
    volume, setVolume, repeatMode, setRepeatMode, isShuffle, toggleShuffle,
    favorites, toggleFavorite, queue, isQueueOpen, setQueueOpen, removeFromQueue,
    setCurrentSong, setQueue
  } = usePlayerStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);

  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.src = getHighQualityDownloadUrl(currentSong.downloadUrl);
      if (isPlaying) audioRef.current.play().catch(console.error);
    }
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.play().catch(console.error);
      else audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const onTimeUpdate = () => { if (audioRef.current) setCurrentTime(audioRef.current.currentTime); };
  const onLoadedMetadata = () => { if (audioRef.current) setDuration(audioRef.current.duration); };
  const onEnded = () => {
    if (repeatMode === 'one') {
      if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play(); }
    } else { playNext(); }
  };
  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (audioRef.current) audioRef.current.currentTime = time;
  };

  const { requireAuth, showAuthModal, setShowAuthModal } = useAuthGuard();

  const handleDownload = () => { if (currentSong) downloadSong(currentSong); };
  const handleLikeWithAuth = () => { if (!currentSong) return; requireAuth(() => { toggleFavorite(currentSong.id); toast.success(isFavorite ? 'Removed from liked' : 'Added to liked songs'); }); };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.code) {
        case 'Space': e.preventDefault(); togglePlay(); break;
        case 'ArrowRight': e.ctrlKey || e.metaKey ? playNext() : audioRef.current && (audioRef.current.currentTime += 5); break;
        case 'ArrowLeft': e.ctrlKey || e.metaKey ? playPrevious() : audioRef.current && (audioRef.current.currentTime -= 5); break;
        case 'ArrowUp': e.preventDefault(); setVolume(Math.min(1, volume + 0.1)); break;
        case 'ArrowDown': e.preventDefault(); setVolume(Math.max(0, volume - 0.1)); break;
        case 'KeyM': setIsMuted(!isMuted); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, playNext, playPrevious, volume, setVolume, isMuted]);

  if (!currentSong) return null;

  const isFavorite = favorites.includes(currentSong.id);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-17 md:bottom-0 left-0 right-0 z-50 px-2 md:px-4 pb-2 md:pb-2"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Progress bar at very top */}
        <div className="absolute top-0 left-0 right-0 h-1 z-20 cursor-pointer" style={{ background: 'var(--border)' }}>
          <div className="h-full transition-all duration-150" style={{ width: `${progress}%`, background: 'var(--accent)' }} />
          <input type="range" min={0} max={duration || 0} step={0.1} value={currentTime} onChange={(e) => handleSeek(parseFloat(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" />
        </div>

        <div className="rounded-2xl md:rounded-3xl overflow-hidden md:border md:border-[var(--border)]" style={{ background: 'var(--player-bg)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)' }}>
          <audio ref={audioRef} onTimeUpdate={onTimeUpdate} onLoadedMetadata={onLoadedMetadata} onEnded={onEnded} />

          <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3 md:gap-6 px-3 md:px-5 py-2.5 md:py-3 relative z-10">
            {/* Song Info */}
            <div className="flex items-center gap-3 w-full md:w-[30%] min-w-[140px]">
              <motion.div
                layoutId="player-album-art"
                onClick={() => setIsFullPlayerOpen(true)}
                className="relative w-11 h-11 md:w-12 md:h-12 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer group"
                style={{ boxShadow: '0 4px 12px var(--shadow-color)' }}
              >
                <Image src={getHighQualityImage(currentSong.image)} alt={currentSong.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 size={16} className="text-white" />
                </div>
              </motion.div>
              <div className="min-w-0 flex-1">
                <Link href={`/song/${currentSong.id}`} className="font-bold text-sm truncate block transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {currentSong.name}
                </Link>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  {currentSong.artists?.primary?.map(a => a.name).join(', ') || 'Unknown'}
                </p>
              </div>
              <button onClick={handleLikeWithAuth} className="p-1.5 rounded-full transition-all hidden sm:block" style={{ color: isFavorite ? 'var(--accent)' : 'var(--text-muted)' }}>
                <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Controls */}
            <div className="hidden md:flex flex-col items-center justify-center gap-1.5 w-[40%] max-w-[500px]">
              <div className="flex items-center gap-5">
                <button onClick={toggleShuffle} className="p-1 transition-all" style={{ color: isShuffle ? 'var(--accent)' : 'var(--text-muted)' }}>
                  <Shuffle size={16} />
                </button>
                <button onClick={playPrevious} className="transition-all hover:scale-110" style={{ color: 'var(--text-primary)' }}>
                  <SkipBack size={20} fill="currentColor" />
                </button>
                <button onClick={togglePlay} className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:scale-105 transition-all" style={{ background: 'var(--accent)' }}>
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                </button>
                <button onClick={playNext} className="transition-all hover:scale-110" style={{ color: 'var(--text-primary)' }}>
                  <SkipForward size={20} fill="currentColor" />
                </button>
                <button onClick={() => { const modes: ('none' | 'one' | 'all')[] = ['none', 'all', 'one']; setRepeatMode(modes[(modes.indexOf(repeatMode) + 1) % modes.length]); }} className="relative p-1 transition-all" style={{ color: repeatMode !== 'none' ? 'var(--accent)' : 'var(--text-muted)' }}>
                  <Repeat size={16} />
                  {repeatMode === 'one' && <span className="absolute -top-1 -right-1 text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center text-white" style={{ background: 'var(--accent)' }}>1</span>}
                </button>
              </div>
              <div className="flex items-center gap-2 w-full">
                <span className="text-[10px] font-semibold w-10 text-right" style={{ color: 'var(--text-muted)' }}>{formatDuration(Math.floor(currentTime))}</span>
                <div className="relative flex-1 h-1 rounded-full cursor-pointer overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className="absolute top-0 left-0 h-full transition-all duration-150 rounded-full" style={{ width: `${progress}%`, background: 'var(--accent)' }} />
                  <input type="range" min={0} max={duration || 0} step={0.1} value={currentTime} onChange={(e) => handleSeek(parseFloat(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" />
                </div>
                <span className="text-[10px] font-semibold w-10" style={{ color: 'var(--text-muted)' }}>{formatDuration(Math.floor(duration))}</span>
              </div>
            </div>

            {/* Right */}
            <div className="hidden md:flex items-center justify-end gap-3 w-[30%] min-w-[180px]">
              <button onClick={handleDownload} className="p-1.5 transition-all hover:scale-110" style={{ color: 'var(--text-muted)' }} title="Download">
                <Download size={17} />
              </button>
              <button onClick={() => setQueueOpen(!isQueueOpen)} className="p-1.5 transition-all hover:scale-110" style={{ color: isQueueOpen ? 'var(--accent)' : 'var(--text-muted)' }} title="Queue">
                <ListMusic size={17} />
              </button>
              <div className="flex items-center gap-2 w-28">
                <button onClick={() => setIsMuted(!isMuted)} className="transition-colors" style={{ color: 'var(--text-muted)' }}>
                  {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
                </button>
                <div className="relative flex-1 h-1 rounded-full cursor-pointer overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className="absolute top-0 left-0 h-full rounded-full transition-all" style={{ width: `${(isMuted ? 0 : volume) * 100}%`, background: 'var(--accent)' }} />
                  <input type="range" min={0} max={1} step={0.01} value={isMuted ? 0 : volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" />
                </div>
              </div>
            </div>

            {/* Mobile Controls */}
            <div className="flex md:hidden items-center gap-3">
              <button onClick={togglePlay} className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: 'var(--accent)' }}>
                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Queue Panel */}
      <AnimatePresence>
        {isQueueOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-80 z-[55] overflow-y-auto"
            style={{ background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border)' }}
          >
            <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Queue</h3>
              <button onClick={() => setQueueOpen(false)} className="p-1.5 rounded-xl transition-all" style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <div className="p-3">
              {queue.length === 0 ? (
                <p className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>Queue is empty</p>
              ) : (
                queue.map((song, idx) => (
                  <div key={`${song.id}-${idx}`} className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer group transition-all" style={{ background: currentSong?.id === song.id ? 'var(--bg-card-hover)' : 'transparent' }}
                    onClick={() => { setCurrentSong(song); setQueue(queue); }}
                  >
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={getHighQualityImage(song.image)} alt={song.name} fill className="object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate" style={{ color: currentSong?.id === song.id ? 'var(--accent)' : 'var(--text-primary)' }}>{song.name}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{song.artists?.primary?.map(a => a.name).join(', ')}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); removeFromQueue(song.id); }} className="p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all" style={{ color: 'var(--text-muted)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <FullPlayer
        isOpen={isFullPlayerOpen}
        onClose={() => setIsFullPlayerOpen(false)}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        volume={volume}
        onVolumeChange={setVolume}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
      />

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
