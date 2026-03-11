'use client';

import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { normalizeSong } from '@/lib/api';
import SongCard from '@/components/SongCard';
import AlbumCard from '@/components/AlbumCard';
import ArtistCard from '@/components/ArtistCard';
import PlaylistCard from '@/components/PlaylistCard';
import SkeletonLoader from '@/components/SkeletonLoader';
import { ChevronDown } from 'lucide-react';

const BASE_URL = 'https://jio-saavn-api-delta-steel.vercel.app/api';
const PAGE_SIZE = 10;

interface InfiniteSearchSectionProps {
  type: 'songs' | 'albums' | 'artists' | 'playlists';
  query: string;
  title: string;
  apiEndpoint: (query: string, page: number, limit: number) => string;
}

export default function InfiniteSearchSection({ type, query, title, apiEndpoint }: InfiniteSearchSectionProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['search', type, query],
    queryFn: async ({ pageParam = 1 }) => {
      const url = apiEndpoint(query, pageParam, PAGE_SIZE);
      const res = await fetch(`${BASE_URL}${url}`);
      return res.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage?.data?.results?.length || lastPage.data.results.length < PAGE_SIZE) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
    enabled: !!query,
  });

  const results = data?.pages?.flatMap((page) => page.data?.results || []) || [];
  if (results.length === 0 && !isLoading) return null;

  return (
    <section className="space-y-5">
      <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>

      {isLoading ? (
        <SkeletonLoader count={5} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {results.map((item: any) => {
            if (type === 'songs') {
              const normalized = normalizeSong(item);
              return <SongCard key={item.id} song={normalized} queue={results.map(normalizeSong)} />;
            }
            if (type === 'albums') return <AlbumCard key={item.id} album={item} />;
            if (type === 'artists') return <ArtistCard key={item.id} artist={item} />;
            if (type === 'playlists') return <PlaylistCard key={item.id} playlist={item} />;
            return null;
          })}
        </div>
      )}

      {isFetchingNextPage && (
        <SkeletonLoader count={5} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4" />
      )}

      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 disabled:opacity-50 glass-card"
            style={{ color: 'var(--text-primary)' }}
          >
            {isFetchingNextPage ? 'Loading...' : 'Load More'}
            {!isFetchingNextPage && <ChevronDown size={18} />}
          </button>
        </div>
      )}
    </section>
  );
}
