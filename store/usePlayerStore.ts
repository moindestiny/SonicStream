import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Song } from '@/lib/api';

interface UserData {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

interface PlayerState {
  currentSong: Song | null;
  userQueue: Song[]; // Songs added by user (priority)
  defaultQueue: Song[]; // Auto-generated queue from same artist/album
  isPlaying: boolean;
  volume: number;
  repeatMode: 'none' | 'one' | 'all';
  isShuffle: boolean;
  recentlyPlayed: Song[];
  favorites: string[];
  user: UserData | null;
  isQueueOpen: boolean;

  // Actions
  setCurrentSong: (song: Song | null) => void;
  setQueue: (songs: Song[]) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  clearQueue: () => void;
  clearUserQueue: () => void;
  setDefaultQueue: (songs: Song[]) => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  setRepeatMode: (mode: 'none' | 'one' | 'all') => void;
  toggleShuffle: () => void;
  toggleFavorite: (songId: string) => void;
  setFavorites: (ids: string[]) => void;
  addToRecentlyPlayed: (song: Song) => void;
  setUser: (user: UserData | null) => void;
  setQueueOpen: (open: boolean) => void;
  getFullQueue: () => Song[];
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentSong: null,
      userQueue: [],
      defaultQueue: [],
      isPlaying: false,
      volume: 0.7,
      repeatMode: 'none',
      isShuffle: false,
      recentlyPlayed: [],
      favorites: [],
      user: null,
      isQueueOpen: false,

      setCurrentSong: (song) => {
        set({ currentSong: song, isPlaying: !!song });
        if (song) get().addToRecentlyPlayed(song);
      },
      // Legacy setQueue - now sets userQueue for backward compatibility
      setQueue: (songs) => set({ userQueue: songs }),
      // Add to user queue (priority queue) - insert at beginning for immediate play after current
      addToQueue: (song) => set((state) => {
        const fullQueue = [...state.userQueue, ...state.defaultQueue];
        if (fullQueue.find(s => s.id === song.id)) return state;
        // Insert at the beginning so it plays next (after current song)
        return { userQueue: [song, ...state.userQueue] };
      }),
      removeFromQueue: (songId) => set((state) => ({
        userQueue: state.userQueue.filter(s => s.id !== songId),
        defaultQueue: state.defaultQueue.filter(s => s.id !== songId),
      })),
      clearQueue: () => set({ userQueue: [], defaultQueue: [] }),
      clearUserQueue: () => set({ userQueue: [] }),
      setDefaultQueue: (songs) => set({ defaultQueue: songs }),
      getFullQueue: () => {
        const state = get();
        return [...state.userQueue, ...state.defaultQueue];
      },
      playNext: () => {
        const { currentSong, userQueue, defaultQueue, repeatMode, isShuffle } = get();
        const fullQueue = [...userQueue, ...defaultQueue];
        
        if (!currentSong || fullQueue.length === 0) return;

        const currentIndex = fullQueue.findIndex((s) => s.id === currentSong.id);
        let nextIndex = currentIndex + 1;

        if (isShuffle) {
          nextIndex = Math.floor(Math.random() * fullQueue.length);
        } else if (nextIndex >= fullQueue.length) {
          if (repeatMode === 'all') {
            nextIndex = 0;
          } else {
            set({ isPlaying: false });
            return;
          }
        }

        // Remove from userQueue if we're moving past it
        const nextSong = fullQueue[nextIndex];
        set((state) => {
          const newUserQueue = state.userQueue.filter(s => s.id !== currentSong.id);
          return { 
            currentSong: nextSong, 
            isPlaying: true,
            userQueue: newUserQueue
          };
        });
      },
      playPrevious: () => {
        const { currentSong, userQueue, defaultQueue } = get();
        const fullQueue = [...userQueue, ...defaultQueue];
        
        if (!currentSong || fullQueue.length === 0) return;

        const currentIndex = fullQueue.findIndex((s) => s.id === currentSong.id);
        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) prevIndex = fullQueue.length - 1;

        set({ currentSong: fullQueue[prevIndex], isPlaying: true });
      },
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      setVolume: (volume) => set({ volume }),
      setRepeatMode: (repeatMode) => set({ repeatMode }),
      toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
      toggleFavorite: (songId) => set((state) => ({
        favorites: state.favorites.includes(songId)
          ? state.favorites.filter(id => id !== songId)
          : [...state.favorites, songId],
      })),
      setFavorites: (ids) => set({ favorites: ids }),
      addToRecentlyPlayed: (song) => set((state) => {
        const filtered = state.recentlyPlayed.filter(s => s.id !== song.id);
        return { recentlyPlayed: [song, ...filtered].slice(0, 30) };
      }),
      setUser: (user) => set({ user }),
      setQueueOpen: (isQueueOpen) => set({ isQueueOpen }),
    }),
    {
      name: 'sonic-stream-storage',
      partialize: (state) => ({
        volume: state.volume,
        favorites: state.favorites,
        recentlyPlayed: state.recentlyPlayed,
        user: state.user,
      }),
    }
  )
);
