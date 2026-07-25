'use client';

import React from 'react';
import MovieGrid from '@/components/MovieGrid';
import SearchResults from '@/components/SearchResults';
import { useAppStore } from '@/lib/store';
import { Film } from 'lucide-react';

export default function MyListPage() {
  const { searchQuery, myList } = useAppStore();

  if (searchQuery.trim()) {
    return <SearchResults query={searchQuery} pageType="all" />;
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center space-x-3">
        <Film className="h-7 w-7 text-netflix-red" />
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
          A Minha Lista
        </h1>
      </div>

      {myList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-xl bg-netflix-dark/50 border border-gray-800 p-8">
          <Film className="h-16 w-16 text-netflix-gray opacity-50" />
          <h2 className="text-lg font-bold text-gray-300">A sua lista está vazia</h2>
          <p className="text-sm text-netflix-gray max-w-md">
            Adicione filmes e séries à sua lista para poder assistir mais tarde facilmente em qualquer dispositivo.
          </p>
        </div>
      ) : (
        <MovieGrid items={myList} cardsPerRow={4} />
      )}
    </div>
  );
}
