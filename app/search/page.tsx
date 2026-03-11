'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { api } from '@/lib/api';
import InfiniteSearchSection from '@/components/InfiniteSearchSection';
import SkeletonLoader from '@/components/SkeletonLoader';
import { Search as SearchIcon, X, Music, Headphones, Radio, Mic2, Disc3, Guitar } from 'lucide-react';
import { motion } from 'motion/react';
import { useSearchParams, useRouter } from 'next/navigation';

const categories = [
  { label: 'Bollywood', icon: Music, query: 'Bollywood' },
  { label: 'Pop Hits', icon: Headphones, query: 'Pop Hits' },
  { label: 'Indie', icon: Guitar, query: 'Indie Music' },
  { label: 'Hip Hop', icon: Mic2, query: 'Hip Hop' },
  { label: 'Lofi', icon: Radio, query: 'Lofi' },
  { label: 'Classical', icon: Disc3, query: 'Classical' },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'songs' | 'artists' | 'albums' | 'playlists'>('songs');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  const activeQuery = debouncedQuery.trim() || '';
  const showBrowse = !activeQuery;

  const tabs = [
    { key: 'songs' as const, label: 'Songs' },
    { key: 'artists' as const, label: 'Artists' },
    { key: 'albums' as const, label: 'Albums' },
    { key: 'playlists' as const, label: 'Playlists' },
  ];

  return (
    <div className="px-4 md:px-8 pb-10 pt-14 md:pt-10">
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8 mt-4 relative z-10">
        <div className="relative group">
          <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 transition-colors" size={20} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to listen to?"
            className="w-full glass-card rounded-2xl py-4 pl-14 pr-12 outline-none text-base font-medium transition-all"
            style={{ color: 'var(--text-primary)', background: 'var(--bg-card)' }}
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all" style={{ background: 'var(--bg-card-hover)', color: 'var(--text-muted)' }}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Browse Categories (when no query) */}
      {showBrowse ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Browse</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat, idx) => (
              <motion.button
                key={cat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setQuery(cat.query)}
                className="aurora-bg rounded-2xl p-6 text-left group overflow-hidden relative"
              >
                <cat.icon size={32} className="text-white/80 mb-3" />
                <span className="text-lg font-bold text-white">{cat.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="px-5 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap"
                style={activeTab === tab.key ? { background: 'var(--accent)', color: '#fff' } : { background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active Tab Content */}
          {activeTab === 'songs' && (
            <InfiniteSearchSection type="songs" query={activeQuery} title="Songs" apiEndpoint={api.searchSongs} />
          )}
          {activeTab === 'artists' && (
            <InfiniteSearchSection type="artists" query={activeQuery} title="Artists" apiEndpoint={api.searchArtists} />
          )}
          {activeTab === 'albums' && (
            <InfiniteSearchSection type="albums" query={activeQuery} title="Albums" apiEndpoint={api.searchAlbums} />
          )}
          {activeTab === 'playlists' && (
            <InfiniteSearchSection type="playlists" query={activeQuery} title="Playlists" apiEndpoint={api.searchPlaylists} />
          )}
        </motion.div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8"><SkeletonLoader className="h-16 rounded-2xl" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
