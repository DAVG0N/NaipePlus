'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Play, Info, Plus, Check } from 'lucide-react';
import { MediaItem } from '@/lib/tmdb';
import { useAppStore } from '@/lib/store';

interface BillboardProps {
  media: MediaItem;
}

export default function Billboard({ media }: BillboardProps) {
  const router = useRouter();
  const { openPreview, addToMyList, removeFromMyList, isInMyList } = useAppStore();
  const inList = isInMyList(media.id);

  const handlePlay = () => {
    router.push(`/watch/${media.media_type}/${media.id}`);
  };

  return (
    <div className="relative h-[80vh] min-h-[550px] w-full select-none overflow-hidden">
      {/* Backdrop Image */}
      <div className="absolute inset-0">
        <Image
          src={media.backdrop_path}
          alt={media.title}
          fill
          priority
          className="object-cover object-center brightness-[0.75]"
        />
        {/* Dark Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t-dark" />
      </div>

      {/* Content Info Container */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-4">
          {/* Top Tagline Badges */}
          <div className="flex items-center space-x-3 text-xs font-semibold">
            <span className="rounded bg-netflix-red px-2 py-0.5 text-white uppercase font-bold tracking-wider">
              Nº 1 EM TENDÊNCIAS NO NAIPE+
            </span>
            <span className="text-green-400 font-bold">{media.matchPercentage}% de Coincidência</span>
            <span className="border border-gray-500 rounded px-1.5 py-0.2 text-gray-300">{media.ageRating}</span>
            <span className="border border-gray-500 rounded px-1.5 py-0.2 text-gray-300">{media.resolution}</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight drop-shadow-md">
            {media.title}
          </h1>

          {/* Overview */}
          <p className="line-clamp-3 text-sm sm:text-base text-gray-200 drop-shadow-sm font-normal max-w-xl">
            {media.overview}
          </p>

          {/* CTA Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Play Button */}
            <button
              onClick={handlePlay}
              className="flex items-center gap-2 rounded bg-white px-6 py-2.5 text-sm font-bold text-black transition-all hover:bg-white/80 active:scale-95 shadow-lg"
            >
              <Play className="h-5 w-5 fill-black" />
              Assistir
            </button>

            {/* More Info Button */}
            <button
              onClick={() => openPreview(media)}
              className="flex items-center gap-2 rounded bg-gray-600/70 px-6 py-2.5 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-gray-600/90 active:scale-95 shadow-lg"
            >
              <Info className="h-5 w-5" />
              Mais Informações
            </button>

            {/* Add to My List Toggle */}
            <button
              onClick={() => (inList ? removeFromMyList(media.id) : addToMyList(media))}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-400 bg-black/40 text-white transition-all hover:border-white hover:bg-black/70 active:scale-90"
              title={inList ? 'Remover da minha lista' : 'Adicionar à minha lista'}
            >
              {inList ? <Check className="h-5 w-5 text-green-400" /> : <Plus className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
