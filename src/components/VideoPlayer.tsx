'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Server, AlertCircle, RefreshCw } from 'lucide-react';
import { PROVIDERS, StreamProvider } from '@/lib/providers';
import { MediaItem } from '@/lib/tmdb';
import { useAppStore } from '@/lib/store';

interface VideoPlayerProps {
  media: MediaItem;
  season?: number;
  episode?: number;
}

export default function VideoPlayer({ media, season = 1, episode = 1 }: VideoPlayerProps) {
  const router = useRouter();
  const { selectedProvider, setProvider } = useAppStore();
  const [currentProvider, setCurrentProvider] = useState<StreamProvider>(selectedProvider || PROVIDERS[0]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [key, setKey] = useState(0); // Used to reload iframe if needed

  const embedUrl =
    media.media_type === 'tv'
      ? currentProvider.getTvUrl(media.id, season, episode)
      : currentProvider.getMovieUrl(media.id);

  const handleProviderChange = (provider: StreamProvider) => {
    setCurrentProvider(provider);
    setProvider(provider);
    setIsMenuOpen(false);
    setKey((prev) => prev + 1);
  };

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden select-none">
      {/* Top Controls Overlay Header */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/50 to-transparent p-4 sm:p-6 transition-opacity duration-300">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-white/20 active:scale-95"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-base sm:text-xl font-extrabold text-white truncate max-w-xs sm:max-w-md">
              {media.title}
            </h1>
            {media.media_type === 'tv' && (
              <p className="text-xs text-netflix-red font-semibold">
                T{season} : Ep{episode}
              </p>
            )}
          </div>
        </div>

        {/* Right Action Menu: Server Provider Selector & Reload */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setKey((prev) => prev + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-gray-300 hover:text-white transition"
            title="Recarregar Servidor"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {/* Server Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center space-x-2 rounded bg-netflix-dark/80 px-3 py-1.5 text-xs font-semibold text-white border border-gray-700 hover:border-netflix-red transition"
            >
              <Server className="h-3.5 w-3.5 text-netflix-red" />
              <span>{currentProvider.name}</span>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-md bg-netflix-dark border border-gray-800 shadow-2xl py-2 z-50 animate-fadeIn">
                <div className="px-3 py-1.5 border-b border-gray-800 text-[10px] text-gray-400 uppercase font-bold">
                  Alternar Servidor de Vídeo
                </div>
                {PROVIDERS.map((prov) => (
                  <button
                    key={prov.id}
                    onClick={() => handleProviderChange(prov)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition ${
                      currentProvider.id === prov.id
                        ? 'bg-netflix-red/20 text-white font-bold'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <span>{prov.name}</span>
                    {prov.badge && (
                      <span className="text-[9px] bg-netflix-red px-1.5 py-0.5 rounded text-white font-bold">
                        {prov.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embed Video Iframe Wrapper */}
      <div className="h-full w-full">
        <iframe
          key={key}
          src={embedUrl}
          className="h-full w-full border-0"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
          title={media.title}
        />
      </div>
    </div>
  );
}
