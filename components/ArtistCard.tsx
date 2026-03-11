'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getHighQualityImage } from '@/lib/api';
import { motion } from 'motion/react';
import { Music } from 'lucide-react';

interface ArtistCardProps {
  artist: any;
}

export default function ArtistCard({ artist }: ArtistCardProps) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = getHighQualityImage(artist.image);
  const hasValidImage = imageUrl && !imageUrl.startsWith('data:') && !imgError;

  return (
    <Link href={`/artist/${artist.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="glass-card rounded-2xl overflow-hidden cursor-pointer group p-4 flex flex-col items-center text-center"
      >
        <div className="relative w-full aspect-square mb-4 rounded-full overflow-hidden transition-shadow duration-500" style={{ boxShadow: '0 8px 24px var(--shadow-color)' }}>
          {hasValidImage ? (
            <Image
              src={imageUrl}
              alt={artist.name || artist.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full aurora-bg flex items-center justify-center">
              <Music size={40} className="text-white/70" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
        </div>
        <h3 className="font-bold text-sm truncate w-full mb-0.5 transition-colors" style={{ color: 'var(--text-primary)' }}>
          {artist.name || artist.title}
        </h3>
        <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Artist</p>
      </motion.div>
    </Link>
  );
}
