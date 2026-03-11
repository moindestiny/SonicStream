'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { getHighQualityImage } from '@/lib/api';
import { motion } from 'motion/react';

interface AlbumCardProps {
  album: any;
}

export default function AlbumCard({ album }: AlbumCardProps) {
  return (
    <Link href={`/album/${album.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="glass-card rounded-2xl overflow-hidden cursor-pointer group"
      >
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={getHighQualityImage(album.image)}
            alt={album.name || album.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-xl transition-transform hover:scale-110" style={{ background: 'var(--accent-secondary)' }}>
              <Play size={22} fill="currentColor" className="ml-0.5" />
            </div>
          </div>
        </div>
        <div className="p-3.5">
          <h3 className="font-bold text-sm truncate mb-1" style={{ color: 'var(--text-primary)' }}>
            {album.name || album.title}
          </h3>
          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
            {album.year || album.language} • Album
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
