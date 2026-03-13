'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePlayerStore } from '@/store/usePlayerStore';
import { api, normalizeSong } from '@/lib/api';

const BASE_URL = 'https://jio-saavn-api-delta-steel.vercel.app/api';

export function useDefaultQueue() {
  const { currentSong, userQueue, setDefaultQueue, defaultQueue } = usePlayerStore();

  // Fetch artist songs when current song changes
  const { data: artistSongsData } = useQuery({
    queryKey: ['artistSongs', currentSong?.artists?.primary?.[0]?.id, currentSong?.id],
    queryFn: async () => {
      const artistId = currentSong?.artists?.primary?.[0]?.id;
      if (!artistId) return null;
      
      const res = await fetch(`${BASE_URL}${api.artistSongs(artistId, 0, 'popularity', 'desc')}`);
      return res.json();
    },
    enabled: !!currentSong?.artists?.primary?.[0]?.id && userQueue.length === 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch album songs when current song changes
  const { data: albumSongsData } = useQuery({
    queryKey: ['albumSongs', currentSong?.album?.id, currentSong?.id],
    queryFn: async () => {
      const albumId = currentSong?.album?.id;
      if (!albumId) return null;
      
      const res = await fetch(`${BASE_URL}${api.albumDetails(albumId)}`);
      return res.json();
    },
    enabled: !!currentSong?.album?.id && userQueue.length === 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    // Only set default queue if user hasn't added any songs
    if (userQueue.length > 0) {
      // Clear default queue if user has added their own songs
      if (defaultQueue.length > 0) {
        setDefaultQueue([]);
      }
      return;
    }

    if (!currentSong) {
      setDefaultQueue([]);
      return;
    }

    // Collect songs from artist and album, excluding current song and already played
    const defaultSongs: ReturnType<typeof normalizeSong>[] = [];
    const currentSongId = currentSong.id;
    const addedIds = new Set<string>([currentSongId]);

    // Add album songs first (more relevant)
    if (albumSongsData?.data?.songs) {
      albumSongsData.data.songs.forEach((song: any) => {
        if (!addedIds.has(song.id)) {
          defaultSongs.push(normalizeSong(song));
          addedIds.add(song.id);
        }
      });
    }

    // Add artist songs
    if (artistSongsData?.data?.songs) {
      artistSongsData.data.songs.forEach((song: any) => {
        if (!addedIds.has(song.id)) {
          defaultSongs.push(normalizeSong(song));
          addedIds.add(song.id);
        }
      });
    }

    // Limit to 50 songs
    setDefaultQueue(defaultSongs.slice(0, 50));
  }, [currentSong, albumSongsData, artistSongsData, userQueue.length, setDefaultQueue, defaultQueue.length]);
}
