'use client';

import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { normalizeSong } from '@/lib/api';
import SongCard from '@/components/SongCard';
import AlbumCard from '@/components/AlbumCard';
import SkeletonLoader from '@/components/SkeletonLoader';
import { ChevronDown } from 'lucide-react';

const BASE_URL = 'https://jio-saavn-api-delta-steel.vercel.app/api';

interface InfiniteArtistSectionProps {
  type: 'songs' | 'albums';
  artistId: string;
  title: string;
  apiEndpoint: (id: string, page?: number, sortBy?: string, sortOrder?: string) => string;
  initialData?: any[];
}

export default function InfiniteArtistSection({ type, artistId, title, apiEndpoint, initialData = [] }: InfiniteArtistSectionProps) {
  const extractResults = React.useCallback((page: any): any[] => {
    if (!page) return [];
    if (Array.isArray(page)) return page;
    const pageData = page.data || page;
    if (!pageData) return [];
    if (Array.isArray(pageData)) return pageData;

    const commonKeys = [type, 'results', 'list', 'items', 'topSongs', 'topAlbums', 'songs', 'albums'];
    for (const key of commonKeys) {
      if (pageData[key]) {
        if (Array.isArray(pageData[key])) return pageData[key];
        if (pageData[key].data && Array.isArray(pageData[key].data)) return pageData[key].data;
      }
    }

    const findFirstArray = (obj: any): any[] | null => {
      if (!obj || typeof obj !== 'object') return null;
      if (Array.isArray(obj)) return obj;
      for (const key in obj) {
        const res = findFirstArray(obj[key]);
        if (res) return res;
      }
      return null;
    };

    return findFirstArray(pageData) || [];
  }, [type]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['artist', type, artistId],
    queryFn: async ({ pageParam = 1 }) => {
      const url = apiEndpoint(artistId, pageParam);
      const res = await fetch(`${BASE_URL}${url}`);
      return res.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      const results = extractResults(lastPage);
      if (results.length === 0) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
    enabled: !!artistId,
  });

  const results = React.useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(extractResults);
  }, [data, extractResults]);

  const uniqueResults = React.useMemo(() => {
    return results.filter((item, index, self) =>
      item && item.id && index === self.findIndex((t) => t.id === item.id)
    );
  }, [results]);

  const displayResults = uniqueResults.length > 0 ? uniqueResults : initialData;
  const hasData = displayResults.length > 0;

  if (!hasData && !isLoading) return null;

  return (
    <section className="space-y-5">
      <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {displayResults.map((item: any) => {
          if (type === 'songs') {
            const normalized = normalizeSong(item);
            return <SongCard key={item.id} song={normalized} queue={displayResults.map(normalizeSong)} />;
          }
          if (type === 'albums') return <AlbumCard key={item.id} album={item} />;
          return null;
        })}

        {isLoading && Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-square skeleton-loading rounded-2xl" />
        ))}
      </div>

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
