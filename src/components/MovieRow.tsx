'use client';

import React, { useRef } from 'react';
import { MediaItem } from '@/lib/tmdb';
import MovieCard from './MovieCard';

interface MovieRowProps {
  title: string;
  items: MediaItem[];
}

export default function MovieRow({ title, items }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-2 py-2 relative hover:z-40">
      <h2 className="px-8 sm:px-12 text-lg sm:text-xl font-bold text-white tracking-wide transition-colors hover:text-netflix-red cursor-pointer">
        {title}
      </h2>

      <div className="relative md:-ml-2">
        {/* Horizontal Scroll Track */}
        <div
          ref={rowRef}
          className="flex items-center space-x-3 sm:space-x-4 overflow-x-scroll no-scrollbar pt-20 pb-28 px-8 sm:px-12 -mt-16 -mb-24 scroll-smooth"
        >
          {items.map((item, idx) => (
            <MovieCard
              key={item.id}
              media={item}
              isFirst={idx === 0}
              isLast={idx === items.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
