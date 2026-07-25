'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Check, ChevronDown, ThumbsUp, Volume2, VolumeX } from 'lucide-react';
import { MediaItem, getMediaTrailerKey } from '@/lib/tmdb';
import { useAppStore } from '@/lib/store';

interface MovieCardProps {
  media: MediaItem;
  isFirst?: boolean;
  isLast?: boolean;
}

export default function MovieCard({ media, isFirst = false, isLast = false }: MovieCardProps) {
  const router = useRouter();
  const { openPreview, openPlayer, addToMyList, removeFromMyList, isInMyList, toggleLike, isLiked, trailersEnabled, trailersMutedByDefault } = useAppStore();

  const [isHovered, setIsHovered] = useState(false);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(trailersMutedByDefault);

  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const trailerTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const inList = isInMyList(media.id);
  const liked = isLiked(media.id);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 400);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(false);
  };

  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  React.useEffect(() => {
    if (isHovered && trailersEnabled) {
      setIsMuted(trailersMutedByDefault);
      getMediaTrailerKey(media.tmdbId || media.id, media.media_type).then((key) => {
        setTrailerKey(key);
      });

      // 1000ms (1s) delay before video playback starts
      trailerTimerRef.current = setTimeout(() => {
        setIsPlayingTrailer(true);
      }, 1000);
    } else {
      if (trailerTimerRef.current) clearTimeout(trailerTimerRef.current);
      setIsPlayingTrailer(false);
    }

    return () => {
      if (trailerTimerRef.current) clearTimeout(trailerTimerRef.current);
    };
  }, [isHovered, trailersEnabled, media.id, media.tmdbId, media.media_type]);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    openPlayer(media);
  };

  const originX = isFirst ? 0 : isLast ? 1 : 0.5;
  const positionClass = isFirst
    ? 'left-0'
    : isLast
      ? 'right-0'
      : '-left-4 sm:-left-4';

  return (
    <div
      className={`relative h-28 w-48 sm:h-36 sm:w-64 flex-shrink-0 cursor-pointer select-none transition-all duration-200 ${isHovered ? 'z-50' : 'z-10'
        }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => openPreview(media)}
    >
      {/* Base Poster Card */}
      <div className="relative h-full w-full overflow-hidden rounded-md bg-netflix-card">
        <Image
          src={media.backdrop_path || media.poster_path}
          alt={media.title}
          fill
          sizes="(max-width: 640px) 192px, 256px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
        <div className="absolute bottom-2 left-2 right-2 truncate text-xs font-bold text-white drop-shadow-md">
          {media.title}
        </div>
      </div>

      {/* Expanded Hover Card Overlay */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 0 }}
            animate={{ opacity: 1, scale: 1.2, y: -40 }}
            exit={{ opacity: 0, scale: 0.9, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={`absolute top-0 ${positionClass} z-50 w-64 sm:w-72 overflow-hidden rounded-lg bg-netflix-dark shadow-2xl border border-gray-800`}
            style={{ originX, originY: 0.5 }}
          >
            {/* Hover Header Backdrop Image or YouTube Trailer */}
            <div className="relative h-36 w-full overflow-hidden bg-black flex items-center justify-center">
              {isPlayingTrailer && trailerKey ? (
                <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
                  <iframe
                    key={isMuted ? 'muted' : 'unmuted'}
                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&loop=1&playlist=${trailerKey}&playsinline=1`}
                    title={media.title}
                    className="w-[145%] h-[145%] max-w-none object-cover pointer-events-none border-none shadow-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              ) : (
                <Image
                  src={media.backdrop_path || media.poster_path}
                  alt={media.title}
                  fill
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-netflix-dark via-transparent to-transparent pointer-events-none" />

              {/* Mute/Unmute Toggle Button */}
              {isPlayingTrailer && trailerKey && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted((prev) => !prev);
                  }}
                  className="absolute top-2 right-2 z-50 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black hover:scale-105 border border-gray-700 backdrop-blur-sm"
                  title={isMuted ? 'Ativar som' : 'Desativar som'}
                >
                  {isMuted ? <VolumeX className="h-3.5 w-3.5 text-netflix-red" /> : <Volume2 className="h-3.5 w-3.5 text-white" />}
                </button>
              )}
            </div>

            {/* Hover Card Content */}
            <div className="p-3 space-y-2">
              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePlay}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition hover:bg-gray-200 active:scale-95"
                    title="Assistir"
                  >
                    <Play className="h-4 w-4 fill-black ml-0.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      inList ? removeFromMyList(media.id) : addToMyList(media);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-400 bg-black/50 text-white transition hover:border-white active:scale-95"
                    title={inList ? 'Remover da minha lista' : 'Adicionar à minha lista'}
                  >
                    {inList ? <Check className="h-4 w-4 text-green-400" /> : <Plus className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(media);
                    }}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border transition active:scale-95 ${liked
                      ? 'border-netflix-red bg-netflix-red/20 text-netflix-red'
                      : 'border-gray-400 bg-black/50 text-white hover:border-white'
                      }`}
                    title={liked ? 'Remover dos gostados' : 'Gostar'}
                  >
                    <ThumbsUp className={`h-3.5 w-3.5 ${liked ? 'fill-netflix-red text-netflix-red' : ''}`} />
                  </button>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openPreview(media);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-400 bg-black/50 text-white transition hover:border-white active:scale-95"
                  title="Mais Informações"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              {/* Title & Metadata Badges */}
              <h3 className="text-xs font-bold text-white truncate">{media.title}</h3>
              <div className="flex items-center space-x-2 text-[10px] font-semibold">
                <span className="text-green-400 font-bold">{media.matchPercentage}% relevante</span>
                <span className="border border-gray-600 rounded px-1 text-gray-300">{media.ageRating}</span>
                <span className="border border-gray-600 rounded px-1 text-gray-300">{media.resolution}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
