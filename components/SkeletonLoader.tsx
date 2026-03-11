'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  count?: number;
  className?: string;
}

export default function SkeletonLoader({ count = 1, className }: SkeletonLoaderProps) {
  if (count > 1) {
    return (
      <div className={className}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden">
            <div className="aspect-square skeleton-loading rounded-2xl" />
            <div className="p-3.5 space-y-2">
              <div className="h-4 skeleton-loading rounded-lg w-3/4" />
              <div className="h-3 skeleton-loading rounded-lg w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <div className={cn("skeleton-loading rounded-2xl", className)} />;
}
