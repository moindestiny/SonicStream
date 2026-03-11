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
  queue: Song[];
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
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentSong: null,
      queue: [],
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
      setQueue: (songs) => set({ queue: songs }),
      addToQueue: (song) => set((state) => {
        if (state.queue.find(s => s.id === song.id)) return state;
        return { queue: [...state.queue, song] };
      }),
      removeFromQueue: (songId) => set((state) => ({
        queue: state.queue.filter(s => s.id !== songId),
      })),
      clearQueue: () => set({ queue: [] }),
      playNext: () => {
        const { currentSong, queue, repeatMode, isShuffle } = get();
        if (!currentSong || queue.length === 0) return;

        const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
        let nextIndex = currentIndex + 1;

        if (isShuffle) {
          nextIndex = Math.floor(Math.random() * queue.length);
        } else if (nextIndex >= queue.length) {
          if (repeatMode === 'all') {
            nextIndex = 0;
          } else {
            set({ isPlaying: false });
            return;
          }
        }

        set({ currentSong: queue[nextIndex], isPlaying: true });
      },
      playPrevious: () => {
        const { currentSong, queue } = get();
        if (!currentSong || queue.length === 0) return;

        const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) prevIndex = queue.length - 1;

        set({ currentSong: queue[prevIndex], isPlaying: true });
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
