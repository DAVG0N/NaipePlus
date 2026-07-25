'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Sparkles, Bell, Check, Flame } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import SearchResults from './SearchResults';

const UPCOMING_ANIMES = [
  {
    id: 'anime-1',
    title: 'Solo Leveling - 2ª Temporada',
    genre: 'Ação / Fantasia Dark',
    release: 'Outono de 2026',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: 'anime-2',
    title: 'Demon Slayer: Infinity Castle Arc',
    genre: 'Sobrenatural / Ação',
    release: 'Em Breve',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: 'anime-3',
    title: 'Jujutsu Kaisen - Culling Game',
    genre: 'Shounen / Magia',
    release: 'Em Breve',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1000&auto=format&fit=crop',
  },
];

export default function AnimePlaceholder() {
  const [notified, setNotified] = useState(false);
  const { searchQuery } = useAppStore();

  if (searchQuery.trim()) {
    return <SearchResults query={searchQuery} pageType="tv" />;
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Hero Announcement Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-950 to-netflix-black p-8 sm:p-12 border border-purple-500/20 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-600/30 px-3 py-1 text-xs font-bold text-purple-300 border border-purple-500/40">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            NOVO MUNDO EM BREVE
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Hub de <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Animes</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300">
            Estamos a preparar uma experiência inigualável com suporte a streaming de alta velocidade para os animes mais populares do mundo com legendas em português.
          </p>

          <div className="pt-2">
            <button
              onClick={() => setNotified(!notified)}
              className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold transition-all shadow-lg active:scale-95 ${
                notified
                  ? 'bg-green-600 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white'
              }`}
            >
              {notified ? (
                <>
                  <Check className="h-5 w-5" /> Notificações Ativadas!
                </>
              ) : (
                <>
                  <Bell className="h-5 w-5" /> Notificar-me no Lançamento
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Teaser Catalog */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Flame className="h-5 w-5 text-purple-400" /> Animes Confirmados
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {UPCOMING_ANIMES.map((anime) => (
            <div
              key={anime.id}
              className="group relative overflow-hidden rounded-xl bg-netflix-dark border border-gray-800 transition-all hover:border-purple-500/50 hover:shadow-xl"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={anime.image}
                  alt={anime.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-netflix-dark via-transparent to-transparent" />
              </div>

              <div className="p-5 space-y-2">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                  {anime.release}
                </span>
                <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                  {anime.title}
                </h3>
                <p className="text-xs text-gray-400">{anime.genre}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
