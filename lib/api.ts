export interface Song {
  id: string;
  name: string;
  type: string;
  year: string | null;
  releaseDate: string | null;
  duration: number | null;
  label: string | null;
  explicitContent: boolean;
  playCount: number | null;
  language: string;
  hasLyrics: boolean;
  lyricsId: string | null;
  url: string;
  copyright: string | null;
  album: {
    id: string | null;
    name: string | null;
    url: string | null;
  };
  artists: {
    primary: Array<{
      id: string;
      name: string;
      role: string;
      type: string;
      image: Array<{ quality: string; url: string }>;
      url: string;
    }>;
    featured: any[];
    all: any[];
  };
  image: Array<{ quality: string; url: string }>;
  downloadUrl: Array<{ quality: string; url: string }>;
}

const BASE_URL = 'https://jio-saavn-api-delta-steel.vercel.app/api';

export async function fetcher(url: string) {
  const res = await fetch(`${BASE_URL}${url}`);
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
}

export const api = {
  // Search Routes
  search: (query: string) => `/search?query=${encodeURIComponent(query)}`,
  searchSongs: (query: string, page = 0, limit = 10) => `/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
  searchAlbums: (query: string, page = 0, limit = 10) => `/search/albums?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
  searchArtists: (query: string, page = 0, limit = 10) => `/search/artists?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
  searchPlaylists: (query: string, page = 0, limit = 10) => `/search/playlists?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,

  // Song Routes
  songs: (ids: string) => `/songs?ids=${ids}`,
  songDetails: (id: string) => `/songs/${id}`,
  songSuggestions: (id: string, limit = 10) => `/songs/${id}/suggestions?limit=${limit}`,

  // Album Routes
  albumDetails: (id: string) => `/albums?id=${id}`,

  // Artist Routes
  artists: (ids: string) => `/artists?ids=${ids}`, // Added based on typical plural path
  artistDetails: (id: string) => `/artists/${id}`, // FIXED from /artists?id={id}
  artistSongs: (id: string, page = 0, sortBy = 'popularity', sortOrder = 'desc') => `/artists/${id}/songs?page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}`, // FIXED from /artists/songs?id={id}
  artistAlbums: (id: string, page = 0, sortBy = 'popularity', sortOrder = 'desc') => `/artists/${id}/albums?page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}`, // FIXED from /artists/albums?id={id}

  // Playlist Routes
  playlistDetails: (id: string, page = 0, limit = 10) => `/playlists?id=${id}&page=${page}&limit=${limit}`,
};

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%231a1a25'/%3E%3Ccircle cx='200' cy='170' r='60' fill='none' stroke='%23555' stroke-width='3'/%3E%3Cpath d='M180 170v-30l40 15-40 15z' fill='%23555'/%3E%3Ctext x='200' y='270' text-anchor='middle' fill='%23555' font-size='14' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";

export function getHighQualityImage(images: Array<{ quality: string; url: string }>) {
  if (!images || images.length === 0) return FALLBACK_IMAGE;
  const url = images[images.length - 1]?.url;
  return url || FALLBACK_IMAGE;
}

export function getHighQualityDownloadUrl(urls: Array<{ quality: string; url: string }>) {
  if (!urls || urls.length === 0) return '';
  // Usually the last one is 320kbps
  return urls[urls.length - 1].url;
}

export function formatDuration(seconds: number | null) {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function normalizeSong(song: any): Song {
  if (!song) return {} as Song;
  
  // Handle inconsistent naming (name vs title)
  const name = song.name || song.title || '';
  
  // Handle inconsistent artist structure
  let artists = song.artists;
  if (!artists && song.primaryArtists) {
    artists = {
      primary: song.primaryArtists.split(',').map((name: string, index: number) => ({
        id: '', // ID might not be available in global search
        name: name.trim(),
        role: 'primary',
        type: 'artist',
        image: [],
        url: ''
      })),
      featured: [],
      all: []
    };
  }

  return {
    ...song,
    name,
    artists: artists || { primary: [], featured: [], all: [] },
    album: song.album || { id: null, name: null, url: null },
    image: song.image || [],
    downloadUrl: song.downloadUrl || []
  };
}
