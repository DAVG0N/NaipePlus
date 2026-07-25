'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Plus, Check, Server, Star, Film, Sparkles, ThumbsUp, Volume2, VolumeX } from 'lucide-react';
import { getMediaTrailerKey } from '@/lib/tmdb';
import { useAppStore } from '@/lib/store';
import { PROVIDERS } from '@/lib/providers';

function formatReleaseDate(dateStr?: string, isTV: boolean = false): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const year = date.getFullYear();
  const month = monthNames[date.getMonth()];
  const day = date.getDate();

  if (isTV) {
    return `${day} de ${month} de ${year}`;
  }
  return `${month} de ${year}`;
}

export default function PreviewModal() {
  const router = useRouter();
  const {
    isPreviewOpen,
    selectedMedia,
    closePreview,
    openPlayer,
    selectedProvider,
    setProvider,
    addToMyList,
    removeFromMyList,
    isInMyList,
    toggleLike,
    isLiked,
    trailersEnabled,
    trailersMutedByDefault,
  } = useAppStore();

  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(trailersMutedByDefault);

  useEffect(() => {
    if (selectedMedia && trailersEnabled) {
      setIsMuted(trailersMutedByDefault);
      getMediaTrailerKey(selectedMedia.tmdbId || selectedMedia.id, selectedMedia.media_type).then((key) => {
        setTrailerKey(key);
      });

      const timer = setTimeout(() => {
        setIsPlayingTrailer(true);
      }, 1000);

      return () => {
        clearTimeout(timer);
        setIsPlayingTrailer(false);
      };
    }
  }, [selectedMedia, trailersEnabled]);

  // Prevent background page scrolling while modal is open
  useEffect(() => {
    if (isPreviewOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isPreviewOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPreviewOpen) {
        closePreview();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewOpen, closePreview]);

  if (!isPreviewOpen || !selectedMedia) return null;

  const inList = isInMyList(selectedMedia.id);
  const isTV = selectedMedia.media_type === 'tv';
  const rawDate = isTV
    ? selectedMedia.first_air_date || selectedMedia.release_date
    : selectedMedia.release_date || selectedMedia.first_air_date;
  const formattedDate = formatReleaseDate(rawDate, isTV) || '2024';

  const handleStartWatch = () => {
    closePreview();
    if (selectedMedia.media_type === 'tv') {
      openPlayer(selectedMedia, selectedSeason, selectedEpisode);
    } else {
      openPlayer(selectedMedia);
    }
  };

  return (
    <AnimatePresence>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            closePreview();
          }
        }}
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 sm:p-6 backdrop-blur-sm overscroll-contain"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-4xl overflow-hidden rounded-xl bg-netflix-dark shadow-2xl border border-gray-800 my-8"
        >
          {/* Close Button */}
          <button
            onClick={closePreview}
            className="absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black hover:scale-105"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Modal Hero Backdrop */}
          <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-black flex items-center justify-center">
            {isPlayingTrailer && trailerKey ? (
              <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
                <iframe
                  key={isMuted ? 'muted' : 'unmuted'}
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&loop=1&playlist=${trailerKey}&playsinline=1`}
                  title={selectedMedia.title}
                  className="w-[145%] h-[145%] max-w-none object-cover pointer-events-none border-none shadow-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            ) : (
              <Image
                src={selectedMedia.backdrop_path || selectedMedia.poster_path}
                alt={selectedMedia.title}
                fill
                priority
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-netflix-dark via-netflix-dark/40 to-transparent pointer-events-none" />

            {/* Mute/Unmute Toggle Button */}
            {isPlayingTrailer && trailerKey && (
              <button
                onClick={() => setIsMuted((prev) => !prev)}
                className="absolute top-4 right-16 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black hover:scale-105 border border-gray-700 backdrop-blur-sm"
                title={isMuted ? 'Ativar som' : 'Desativar som'}
              >
                {isMuted ? <VolumeX className="h-5 w-5 text-netflix-red" /> : <Volume2 className="h-5 w-5 text-white" />}
              </button>
            )}

            {/* Hero Overlaid Info */}
            <div className="absolute bottom-6 left-6 right-6 space-y-4">
              <h2 className="text-3xl sm:text-5xl font-black text-white drop-shadow-md">
                {selectedMedia.title}
              </h2>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleStartWatch}
                  className="flex items-center gap-2 rounded bg-white px-6 py-2.5 text-sm font-bold text-black transition hover:bg-white/80 active:scale-95 shadow-md"
                >
                  <Play className="h-5 w-5 fill-black" />
                  Assistir Agora
                </button>

                <button
                  onClick={() => (inList ? removeFromMyList(selectedMedia.id) : addToMyList(selectedMedia))}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-400 bg-black/50 text-white transition hover:border-white active:scale-95"
                  title={inList ? 'Remover da minha lista' : 'Adicionar à minha lista'}
                >
                  {inList ? <Check className="h-5 w-5 text-green-400" /> : <Plus className="h-5 w-5" />}
                </button>

                <button
                  onClick={() => toggleLike(selectedMedia)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border transition active:scale-95 ${
                    isLiked(selectedMedia.id)
                      ? 'border-netflix-red bg-netflix-red/20 text-netflix-red'
                      : 'border-gray-400 bg-black/50 text-white hover:border-white'
                  }`}
                  title={isLiked(selectedMedia.id) ? 'Remover dos gostados' : 'Gostar'}
                >
                  <ThumbsUp className={`h-4 w-4 ${isLiked(selectedMedia.id) ? 'fill-netflix-red text-netflix-red' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Modal Detailed Body */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Grid Layout: Left Column Details / Right Column Cast & Server Select */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center space-x-3 text-sm font-semibold">
                  <span className="text-green-400 font-bold">{selectedMedia.matchPercentage}% relevante</span>
                  <span className="text-gray-300 font-medium">{formattedDate}</span>
                  <span className="border border-gray-600 rounded px-1.5 py-0.2 text-gray-300 text-xs">{selectedMedia.ageRating}</span>
                  <span className="border border-gray-600 rounded px-1.5 py-0.2 text-gray-300 text-xs">{selectedMedia.resolution}</span>
                  <div className="flex items-center text-yellow-400 text-xs">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 mr-1" />
                    {selectedMedia.vote_average}
                  </div>
                </div>

                <p className="text-sm text-gray-300 leading-relaxed">
                  {selectedMedia.overview}
                </p>

                {/* TV Episode Browser */}
                {selectedMedia.media_type === 'tv' && (
                  <div className="pt-4 space-y-3 border-t border-gray-800">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Film className="h-4 w-4 text-netflix-red" /> Episódios
                      </h3>
                      <select
                        value={selectedSeason}
                        onChange={(e) => setSelectedSeason(Number(e.target.value))}
                        className="bg-black/60 border border-gray-700 text-white text-xs rounded px-3 py-1.5 focus:outline-none focus:border-netflix-red"
                      >
                        {Array.from({ length: selectedMedia.number_of_seasons || 1 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            Temporada {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                      {Array.from({ length: selectedMedia.number_of_episodes || 10 }, (_, i) => {
                        const epNum = i + 1;
                        return (
                          <div
                            key={epNum}
                            onClick={() => {
                              setSelectedEpisode(epNum);
                              closePreview();
                              openPlayer(selectedMedia, selectedSeason, epNum);
                            }}
                            className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition border ${
                              selectedEpisode === epNum
                                ? 'bg-netflix-card border-netflix-red'
                                : 'bg-black/30 border-gray-800 hover:bg-gray-800'
                            }`}
                          >
                            <div className="flex-shrink-0 h-10 w-16 bg-gray-800 rounded relative flex items-center justify-center">
                              <Play className="h-4 w-4 text-white" />
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-bold text-white truncate">
                                Ep. {epNum} - Episódio {epNum}
                              </p>
                              <p className="text-[10px] text-gray-400">45m</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Info & Provider Switcher */}
              <div className="space-y-6 border-t md:border-t-0 md:border-l border-gray-800 pt-6 md:pt-0 md:pl-6">
                {/* Cast */}
                {selectedMedia.cast && selectedMedia.cast.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400 font-semibold">Elenco:</p>
                    <p className="text-xs text-gray-200">{selectedMedia.cast.join(', ')}</p>
                  </div>
                )}

                {/* Stream Provider Switcher */}
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Server className="h-3.5 w-3.5 text-netflix-red" /> Servidor de Reprodução:
                  </p>
                  <div className="space-y-1.5">
                    {PROVIDERS.map((provider) => (
                      <button
                        key={provider.id}
                        onClick={() => setProvider(provider)}
                        className={`w-full flex items-center justify-between p-2 rounded text-xs transition border ${
                          selectedProvider.id === provider.id
                            ? 'bg-netflix-red/20 border-netflix-red text-white font-bold'
                            : 'bg-black/40 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                        }`}
                      >
                        <span>{provider.name}</span>
                        {provider.badge && (
                          <span className="text-[9px] bg-netflix-red px-1.5 py-0.5 rounded text-white font-bold">
                            {provider.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
