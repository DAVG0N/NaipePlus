'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Billboard from '@/components/Billboard';
import MovieRow from '@/components/MovieRow';
import SearchResults from '@/components/SearchResults';
import {
  getTrendingMedia,
  getPopularMovies,
  getPopularTVShows,
  getTopRated,
  GENRE_MAP,
  MediaItem,
} from '@/lib/tmdb';
import { useAppStore } from '@/lib/store';
import { getPersonalizedRecommendations } from '@/lib/recommendations';

export default function HomePage() {
  const { searchQuery, myList, likedList, watchHistory } = useAppStore();

  const { data: trending = [], isLoading: loadTrending } = useQuery({
    queryKey: ['trending'],
    queryFn: getTrendingMedia,
    staleTime: 1000 * 60 * 60,
  });

  const { data: popularMovies = [], isLoading: loadMovies } = useQuery({
    queryKey: ['popularMovies'],
    queryFn: getPopularMovies,
    staleTime: 1000 * 60 * 60,
  });

  const { data: popularTV = [], isLoading: loadTV } = useQuery({
    queryKey: ['popularTV'],
    queryFn: getPopularTVShows,
    staleTime: 1000 * 60 * 60,
  });

  const { data: topRated = [], isLoading: loadTop } = useQuery({
    queryKey: ['topRated'],
    queryFn: getTopRated,
    staleTime: 1000 * 60 * 60,
  });

  // Combine catalog items for recommendation pool
  const catalogPool = useMemo(() => {
    const map = new Map<string, MediaItem>();
    [...trending, ...popularMovies, ...popularTV, ...topRated].forEach((item) => {
      if (!map.has(item.id)) map.set(item.id, item);
    });
    return Array.from(map.values());
  }, [trending, popularMovies, popularTV, topRated]);

  // Extract unique items for "Continuar a Ver" (ordered by most recent watch)
  const continueWatchingItems = useMemo(() => {
    const seen = new Set<string>();
    const items: MediaItem[] = [];
    watchHistory.forEach((h) => {
      if (!seen.has(h.media.id)) {
        seen.add(h.media.id);
        items.push(h.media);
      }
    });
    return items;
  }, [watchHistory]);

  // Personalized recommendations & top genres calculation
  const { showParaTi, paraTiItems, favoriteGenreIds } = useMemo(() => {
    return getPersonalizedRecommendations(watchHistory, likedList, myList, catalogPool);
  }, [watchHistory, likedList, myList, catalogPool]);

  // Genre carousels for user's favorite categories
  const favoriteCategoryRows = useMemo(() => {
    return favoriteGenreIds.map((gId) => {
      const items = catalogPool.filter((item) => item.genre_ids?.includes(gId));
      const genreName = GENRE_MAP[gId] || 'Mais Populares';
      const isCustomUserGenre = watchHistory.length >= 2 || likedList.length >= 2;
      const title = isCustomUserGenre ? `Os Seus Favoritos em ${genreName}` : `Destaques em ${genreName}`;
      return { id: gId, title, items };
    }).filter((row) => row.items.length > 0);
  }, [favoriteGenreIds, catalogPool, watchHistory.length, likedList.length]);

  const isLoading = (loadTrending || loadMovies || loadTV || loadTop) && trending.length === 0 && popularMovies.length === 0;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-netflix-black">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 rounded-full border-4 border-netflix-red border-t-transparent animate-spin" />
          <span className="text-sm font-bold text-netflix-red tracking-wider">A carregar catálogo NAIPE+...</span>
        </div>
      </div>
    );
  }

  const heroMedia = trending[0] || popularMovies[0];

  return (
    <div className="pb-16 space-y-4">
      {/* If search query present, show search results */}
      {searchQuery.trim() ? (
        <SearchResults query={searchQuery} pageType="all" />
      ) : (
        <>
          {/* Billboard Hero */}
          {heroMedia && <Billboard media={heroMedia} />}

          {/* Content Carousels in requested order */}
          <div className="relative z-20 -mt-12 space-y-6">
            {/* 1. Continuar a Ver (only if user started watching something) */}
            {continueWatchingItems.length > 0 && (
              <MovieRow title="Continuar a Ver" items={continueWatchingItems} />
            )}

            {/* 2. A Minha Lista (only if items present) */}
            {myList.length > 0 && <MovieRow title="A Minha Lista" items={myList} />}

            {/* 2. Para Ti (unlocked after watching 5+ items) */}
            {showParaTi && paraTiItems.length > 0 && (
              <MovieRow title="Para Ti" items={paraTiItems} />
            )}

            {/* 3. Tendências da Semana */}
            <MovieRow title="Tendências da Semana" items={trending} />

            {/* 4. Filmes Populares */}
            <MovieRow title="Filmes Populares" items={popularMovies} />

            {/* 5. Séries Populares */}
            <MovieRow title="Séries Populares" items={popularTV} />

            {/* 6. Categorias Favoritas do Utilizador */}
            {favoriteCategoryRows.map((row) => (
              <MovieRow key={row.id} title={row.title} items={row.items} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
