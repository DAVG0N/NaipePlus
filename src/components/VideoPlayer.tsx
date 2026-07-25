'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Server,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { PROVIDERS, StreamProvider } from '@/lib/providers';
import { MediaItem } from '@/lib/tmdb';
import { useAppStore } from '@/lib/store';

interface VideoPlayerProps {
  media?: MediaItem;
  season?: number;
  episode?: number;
}

export default function VideoPlayer({ media, season, episode }: VideoPlayerProps) {
  const router = useRouter();
  const {
    isPlayerOpen,
    playerMedia,
    playerSeason,
    playerEpisode,
    closePlayer,
    selectedProvider,
    setProvider,
  } = useAppStore();

  const [currentProvider, setCurrentProvider] = useState<StreamProvider>(selectedProvider || PROVIDERS[0]);
  const [key, setKey] = useState(0); // Used to reload iframe

  const activeMedia = media || playerMedia;
  const activeSeason = season ?? playerSeason ?? 1;
  const activeEpisode = episode ?? playerEpisode ?? 1;

  const handleClose = () => {
    if (isPlayerOpen) {
      closePlayer();
    } else {
      router.back();
    }
  };

  // Prevent background page scrolling while player modal is focused & handle Escape key
  useEffect(() => {
    const isShowing = !!activeMedia && (isPlayerOpen || !!media);
    if (!isShowing) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeMedia, isPlayerOpen, media]);

  if (!activeMedia || (!isPlayerOpen && !media)) return null;

  const embedUrl =
    activeMedia.media_type === 'tv'
      ? currentProvider.getTvUrl(activeMedia.id, activeSeason, activeEpisode)
      : currentProvider.getMovieUrl(activeMedia.id);

  const handleProviderChange = (provider: StreamProvider) => {
    setCurrentProvider(provider);
    setProvider(provider);
    setKey((prev) => prev + 1);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto overscroll-contain animate-fadeIn select-none"
    >
      {/* MODAL CARD CONTAINER */}
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-netflix-dark shadow-2xl border border-gray-800 my-auto px-5 sm:px-7 pt-3.5 sm:pt-4.5 pb-5 sm:pb-7 space-y-4">
        {/* Modal Card Header (Title & Close Button) */}
        <div className="flex items-center justify-between gap-4 py-0.5">
          <div className="truncate">
            <h2 className="text-xl sm:text-2xl font-black text-white truncate">
              {activeMedia.title}
            </h2>
          </div>

          {/* Close Modal Button */}
          <button
            onClick={handleClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-gray-300 hover:text-white transition hover:bg-white/20 border border-gray-700 shrink-0"
            title="Fechar Player"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video Player Frame Container (16:9 Aspect Ratio) */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/10 shadow-2xl">
          {/* Video Embed Iframe */}
          <iframe
            key={key}
            src={embedUrl}
            className="h-full w-full border-0 relative z-10"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
            title={activeMedia.title}
          />
        </div>

        {/* SERVERS SELECTOR SECTION (INSIDE CARD) */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <Server className="h-4 w-4 text-netflix-red" />
              <h3 className="text-xs font-extrabold text-white tracking-wide uppercase">
                Servidores de Reprodução
              </h3>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setKey((prev) => prev + 1)}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-black/60 text-gray-300 hover:text-white border border-gray-700 hover:border-netflix-red transition text-xs font-semibold"
                title="Recarregar Servidor"
              >
                <RefreshCw className="h-3.5 w-3.5 text-netflix-red" />
                <span>Recarregar</span>
              </button>
              <span className="text-[11px] text-gray-400 font-medium hidden sm:inline">
                {PROVIDERS.length} opções
              </span>
            </div>
          </div>

          {/* Server Selection Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {PROVIDERS.map((prov) => {
              const isSelected = currentProvider.id === prov.id;
              return (
                <button
                  key={prov.id}
                  onClick={() => handleProviderChange(prov)}
                  className={`group flex items-center space-x-2.5 px-3 py-2 rounded-xl border text-left transition-all duration-200 ${
                    isSelected
                      ? 'bg-netflix-red/15 border-netflix-red text-white shadow-md shadow-netflix-red/20 ring-1 ring-netflix-red'
                      : 'bg-black/40 border-gray-800 text-gray-300 hover:bg-gray-800/80 hover:border-gray-600 hover:text-white'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                      isSelected ? 'bg-netflix-red text-white' : 'bg-gray-800 text-gray-400 group-hover:text-white'
                    }`}
                  >
                    <Server className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-extrabold">{prov.name}</span>
                </button>
              );
            })}
          </div>

          {/* Helper Hint */}
          <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-black/40 border border-gray-800/80 text-gray-300 text-xs mt-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>
              Para uma melhor experiência de reprodução, recomendamos utilizar o navegador <strong className="text-white font-bold">Brave Browser</strong> ou a extensão <strong className="text-white font-bold">uBlock Origin</strong>.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}



