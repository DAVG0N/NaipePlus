'use client';

import React from 'react';
import { MediaItem } from '@/lib/tmdb';
import MovieCard from './MovieCard';

interface MovieGridProps {
  items: MediaItem[];
  cardsPerRow?: number;
}

export default function MovieGrid({ items, cardsPerRow = 4 }: MovieGridProps) {
  if (!items || items.length === 0) return null;

  // Chunk items into rows of `cardsPerRow`
  const rows: MediaItem[][] = [];
  for (let i = 0; i < items.length; i += cardsPerRow) {
    rows.push(items.slice(i, i + cardsPerRow));
  }

  return (
    <div className="space-y-4 py-2">
      {rows.map((rowItems, rowIndex) => (
        <div key={rowIndex} className="relative hover:z-40">
          <div className="flex items-center space-x-3 sm:space-x-4 pt-16 pb-20 -mt-12 -mb-16">
            {rowItems.map((item, idx) => (
              <MovieCard
                key={item.id}
                media={item}
                isFirst={idx === 0}
                isLast={idx === 3 || (rowItems.length < 4 && idx === rowItems.length - 1)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
