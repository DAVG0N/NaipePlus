'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Billboard from '@/components/Billboard';
import MovieRow from '@/components/MovieRow';
import SearchResults from '@/components/SearchResults';
import {
  getPopularMovies,
  getTopRated,
  getTrendingMedia,
  GENRE_MAP,
  MediaItem,
} from '@/lib/tmdb';
import { useAppStore } from '@/lib/store';
import { getPersonalizedRecommendations } from '@/lib/recommendations';

export default function MoviesPage() {
  const { searchQuery, myList, likedList, watchHistory } = useAppStore();

  const { data: popular = [], isLoading: loadPop } = useQuery({
    queryKey: ['popularMovies'],
    queryFn: getPopularMovies,
    staleTime: 1000 * 60 * 60,
  });

  const { data: topRated = [], isLoading: loadTop } = useQuery({
    queryKey: ['topRated'],
    queryFn: getTopRated,
    staleTime: 1000 * 60 * 60,
  });

  const { data: trending = [], isLoading: loadTrending } = useQuery({
    queryKey: ['trending'],
    queryFn: getTrendingMedia,
    staleTime: 1000 * 60 * 60,
  });

  // Filter trending for Movies
  const trendingMovies = useMemo(
    () => trending.filter((item) => item.media_type === 'movie'),
    [trending]
  );

  // My List filtered for Movies
  const myMoviesList = useMemo(
    () => myList.filter((item) => item.media_type === 'movie'),
    [myList]
  );

  // Extract unique Movie items for "Continuar a Ver: Filmes"
  const continueWatchingMovies = useMemo(() => {
    const seen = new Set<string>();
    const items: MediaItem[] = [];
    watchHistory.forEach((h) => {
      if (h.media.media_type === 'movie' && !seen.has(h.media.id)) {
        seen.add(h.media.id);
        items.push(h.media);
      }
    });
    return items;
  }, [watchHistory]);

  // Combined pool for Movie recommendations
  const catalogMoviePool = useMemo(() => {
    const map = new Map<string, MediaItem>();
    [...popular, ...topRated, ...trendingMovies].forEach((item) => {
      if (!map.has(item.id)) map.set(item.id, item);
    });
    return Array.from(map.values());
  }, [popular, topRated, trendingMovies]);

  // Recommendations for Movies
  const { showParaTi, paraTiItems, favoriteGenreIds } = useMemo(() => {
    return getPersonalizedRecommendations(watchHistory, likedList, myList, catalogMoviePool, 'movie');
  }, [watchHistory, likedList, myList, catalogMoviePool]);

  // Movie Favorite Category Rows
  const favoriteCategoryRows = useMemo(() => {
    return favoriteGenreIds.map((gId) => {
      const items = catalogMoviePool.filter((item) => item.genre_ids?.includes(gId));
      const genreName = GENRE_MAP[gId] || 'Filmes Populares';
      const isCustom = watchHistory.length >= 2 || likedList.length >= 2;
      const title = isCustom ? `Filmes de ${genreName} Para Si` : `Filmes de ${genreName}`;
      return { id: gId, title, items };
    }).filter((row) => row.items.length > 0);
  }, [favoriteGenreIds, catalogMoviePool, watchHistory.length, likedList.length]);

  const loading = (loadPop || loadTop || loadTrending) && popular.length === 0;

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-netflix-black">
        <div className="h-10 w-10 rounded-full border-4 border-netflix-red border-t-transparent animate-spin" />
      </div>
    );
  }

  const heroMovie = popular[0] || trendingMovies[0];

  return (
    <div className="pb-16 space-y-4">
      {searchQuery.trim() ? (
        <SearchResults query={searchQuery} pageType="movie" />
      ) : (
        <>
          {heroMovie && <Billboard media={heroMovie} />}
          <div className="relative z-20 -mt-12 space-y-6">
            {/* 1. Continuar a Ver: Filmes */}
            {continueWatchingMovies.length > 0 && (
              <MovieRow title="Continuar a Ver: Filmes" items={continueWatchingMovies} />
            )}

            {/* 2. A Minha Lista de Filmes */}
            {myMoviesList.length > 0 && <MovieRow title="A Minha Lista de Filmes" items={myMoviesList} />}

            {/* 2. Para Ti: Filmes (5+ watched items) */}
            {showParaTi && paraTiItems.length > 0 && (
              <MovieRow title="Para Ti: Filmes Recomendados" items={paraTiItems} />
            )}

            {/* 3. Filmes em Tendência */}
            {trendingMovies.length > 0 && <MovieRow title="Filmes em Tendência" items={trendingMovies} />}

            {/* 4. Filmes Populares */}
            <MovieRow title="Filmes Populares" items={popular} />

            {/* 5. Filmes Mais Bem Avaliados */}
            {topRated.length > 0 && <MovieRow title="Filmes Mais Bem Avaliados" items={topRated} />}

            {/* 6. Filmes pelas Categorias Favoritas */}
            {favoriteCategoryRows.map((row) => (
              <MovieRow key={row.id} title={row.title} items={row.items} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
