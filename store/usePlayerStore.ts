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
  lastPlayedDefaultId: string | null;

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
  hydrateUserData: () => Promise<void>;
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
      lastPlayedDefaultId: null,

      setCurrentSong: (song) => {
        const state = get();
        const inDefault = !!(song && state.defaultQueue.some(s => s.id === song.id));
        set({ 
          currentSong: song, 
          isPlaying: !!song,
          ...(inDefault && song ? { lastPlayedDefaultId: song.id } : {})
        });
        if (song) get().addToRecentlyPlayed(song);
      },
      // Legacy setQueue - now sets userQueue for backward compatibility
      setQueue: (songs) => set({ userQueue: songs }),
      // Add to user queue (priority queue) - insert at the end of priority list
      addToQueue: (song) => {
        const state = get();
        if (state.userQueue.find(s => s.id === song.id)) return;
        
        // Append to the end of the user queue so songs added later play later in priority order
        set({ userQueue: [...state.userQueue, song] });
        
        if (state.user) {
           fetch('/api/queue', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ action: 'add', userId: state.user.id, songId: song.id, songData: song }),
           }).catch(console.error);
        }
      },
      removeFromQueue: (songId) => {
        const state = get();
        set({
          userQueue: state.userQueue.filter(s => s.id !== songId),
          defaultQueue: state.defaultQueue.filter(s => s.id !== songId),
        });
        if (state.user) {
          fetch('/api/queue', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: state.user.id, songId }),
          }).catch(console.error);
        }
      },
      clearQueue: () => {
        set({ userQueue: [], defaultQueue: [] });
        const state = get();
        if (state.user) {
          fetch('/api/queue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'clear', userId: state.user.id }),
          }).catch(console.error);
        }
      },
      clearUserQueue: () => {
        set({ userQueue: [] });
        const state = get();
        if (state.user) {
          fetch('/api/queue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'clear', userId: state.user.id }),
          }).catch(console.error);
        }
      },
      setDefaultQueue: (songs) => set({ defaultQueue: songs }),
      getFullQueue: () => {
        const state = get();
        return [...state.userQueue, ...state.defaultQueue];
      },
      playNext: () => {
        const { currentSong, userQueue, defaultQueue, repeatMode, isShuffle } = get();
        
        // 1. Play priority manual queue songs first
        if (userQueue.length > 0) {
          const nextSong = userQueue[0];
          const newUserQueue = userQueue.slice(1);
          set({ currentSong: nextSong, isPlaying: true, userQueue: newUserQueue });
          
          const state = get();
          if (state.user) {
            fetch('/api/queue', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: state.user.id, songId: nextSong.id }),
            }).catch(console.error);
          }
          return;
        }

        // 2. Play default auto-generated queue (albums, artists)
        if (defaultQueue.length === 0) return;

        const state = get();
        let targetId = currentSong?.id || state.lastPlayedDefaultId;
        let currentIndex = defaultQueue.findIndex((s) => s.id === targetId);
        
        if (currentIndex === -1 && state.lastPlayedDefaultId) {
           currentIndex = defaultQueue.findIndex((s) => s.id === state.lastPlayedDefaultId);
        }

        let nextIndex = currentIndex === -1 ? 0 : currentIndex + 1;

        if (isShuffle) {
          nextIndex = Math.floor(Math.random() * defaultQueue.length);
        } else if (nextIndex >= defaultQueue.length) {
          if (repeatMode === 'all') {
            nextIndex = 0;
          } else {
            set({ isPlaying: false });
            return;
          }
        }

        const nextDefaultSong = defaultQueue[nextIndex];
        set({ 
           currentSong: nextDefaultSong, 
           isPlaying: true, 
           lastPlayedDefaultId: nextDefaultSong.id 
        });
      },
      playPrevious: () => {
        const { currentSong, defaultQueue } = get();
        
        if (!currentSong || defaultQueue.length === 0) return;

        let currentIndex = defaultQueue.findIndex((s) => s.id === currentSong.id);
        let prevIndex = currentIndex === -1 ? defaultQueue.length - 1 : currentIndex - 1;
        if (prevIndex < 0) prevIndex = defaultQueue.length - 1;

        set({ currentSong: defaultQueue[prevIndex], isPlaying: true });
      },
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      setVolume: (volume) => set({ volume }),
      setRepeatMode: (repeatMode) => set({ repeatMode }),
      toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
      toggleFavorite: (songId) => {
        const state = get();
        const isFavorite = state.favorites.includes(songId);
        
        // Optimistic update
        set({
          favorites: isFavorite
            ? state.favorites.filter(id => id !== songId)
            : [...state.favorites, songId],
        });

        // Backend sync
        if (state.user) {
          fetch('/api/likes', {
            method: isFavorite ? 'DELETE' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: state.user.id, songId }),
          }).catch(console.error);
        }
      },
      setFavorites: (ids) => set({ favorites: ids }),
      addToRecentlyPlayed: (song) => set((state) => {
        const filtered = state.recentlyPlayed.filter(s => s.id !== song.id);
        return { recentlyPlayed: [song, ...filtered].slice(0, 30) };
      }),
      setUser: (user) => set({ user }),
      setQueueOpen: (isQueueOpen) => set({ isQueueOpen }),
      hydrateUserData: async () => {
        const state = get();
        if (!state.user) return;
        try {
          const [likesRes, queueRes] = await Promise.all([
            fetch(`/api/likes?userId=${state.user.id}`),
            fetch(`/api/queue?userId=${state.user.id}`)
          ]);
          
          let { favorites, userQueue } = state;

          if (likesRes.ok) {
            const data = await likesRes.json();
            if (data.likes) favorites = data.likes;
          }
          if (queueRes.ok) {
            const data = await queueRes.json();
            if (data.queue) {
              userQueue = data.queue.map((q: any) => q.songData);
            }
          }
          set({ favorites, userQueue });
        } catch (error) {
          console.error('Failed to hydrate user data', error);
        }
      },
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
