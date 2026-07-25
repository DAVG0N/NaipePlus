'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Billboard from '@/components/Billboard';
import MovieRow from '@/components/MovieRow';
import SearchResults from '@/components/SearchResults';
import {
  getPopularTVShows,
  getTopRatedTVShows,
  getTrendingMedia,
  GENRE_MAP,
  MediaItem,
} from '@/lib/tmdb';
import { useAppStore } from '@/lib/store';
import { getPersonalizedRecommendations } from '@/lib/recommendations';

export default function SeriesPage() {
  const { searchQuery, myList, likedList, watchHistory } = useAppStore();

  const { data: popularTV = [], isLoading: loadTV } = useQuery({
    queryKey: ['popularTV'],
    queryFn: getPopularTVShows,
    staleTime: 1000 * 60 * 60,
  });

  const { data: topRatedTV = [], isLoading: loadTopTV } = useQuery({
    queryKey: ['topRatedTV'],
    queryFn: getTopRatedTVShows,
    staleTime: 1000 * 60 * 60,
  });

  const { data: trending = [], isLoading: loadTrending } = useQuery({
    queryKey: ['trending'],
    queryFn: getTrendingMedia,
    staleTime: 1000 * 60 * 60,
  });

  // Filter trending to TV shows
  const trendingTV = useMemo(
    () => trending.filter((item) => item.media_type === 'tv'),
    [trending]
  );

  // My List filtered for TV Shows
  const myTVList = useMemo(
    () => myList.filter((item) => item.media_type === 'tv'),
    [myList]
  );

  // Extract unique TV items for "Continuar a Ver: Séries"
  const continueWatchingTV = useMemo(() => {
    const seen = new Set<string>();
    const items: MediaItem[] = [];
    watchHistory.forEach((h) => {
      if (h.media.media_type === 'tv' && !seen.has(h.media.id)) {
        seen.add(h.media.id);
        items.push(h.media);
      }
    });
    return items;
  }, [watchHistory]);

  // Combined pool for TV recommendations
  const catalogTVPool = useMemo(() => {
    const map = new Map<string, MediaItem>();
    [...popularTV, ...topRatedTV, ...trendingTV].forEach((item) => {
      if (!map.has(item.id)) map.set(item.id, item);
    });
    return Array.from(map.values());
  }, [popularTV, topRatedTV, trendingTV]);

  // Recommendations for TV
  const { showParaTi, paraTiItems, favoriteGenreIds } = useMemo(() => {
    return getPersonalizedRecommendations(watchHistory, likedList, myList, catalogTVPool, 'tv');
  }, [watchHistory, likedList, myList, catalogTVPool]);

  // TV Favorite Category Rows
  const favoriteCategoryRows = useMemo(() => {
    return favoriteGenreIds.map((gId) => {
      const items = catalogTVPool.filter((item) => item.genre_ids?.includes(gId));
      const genreName = GENRE_MAP[gId] || 'Séries Populares';
      const isCustom = watchHistory.length >= 2 || likedList.length >= 2;
      const title = isCustom ? `Séries de ${genreName} Para Si` : `Séries de ${genreName}`;
      return { id: gId, title, items };
    }).filter((row) => row.items.length > 0);
  }, [favoriteGenreIds, catalogTVPool, watchHistory.length, likedList.length]);

  const loading = (loadTV || loadTopTV || loadTrending) && popularTV.length === 0;

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-netflix-black">
        <div className="h-10 w-10 rounded-full border-4 border-netflix-red border-t-transparent animate-spin" />
      </div>
    );
  }

  const heroTV = popularTV[0] || trendingTV[0];

  return (
    <div className="pb-16 space-y-4">
      {searchQuery.trim() ? (
        <SearchResults query={searchQuery} pageType="tv" />
      ) : (
        <>
          {heroTV && <Billboard media={heroTV} />}
          <div className="relative z-20 -mt-12 space-y-6">
            {/* 1. Continuar a Ver: Séries */}
            {continueWatchingTV.length > 0 && (
              <MovieRow title="Continuar a Ver: Séries" items={continueWatchingTV} />
            )}

            {/* 2. A Minha Lista de Séries */}
            {myTVList.length > 0 && <MovieRow title="A Minha Lista de Séries" items={myTVList} />}

            {/* 2. Para Ti: Séries (5+ watched items) */}
            {showParaTi && paraTiItems.length > 0 && (
              <MovieRow title="Para Ti: Séries Recomendadas" items={paraTiItems} />
            )}

            {/* 3. Séries em Tendência */}
            {trendingTV.length > 0 && <MovieRow title="Séries em Tendência" items={trendingTV} />}

            {/* 4. Séries Populares */}
            <MovieRow title="Séries Populares" items={popularTV} />

            {/* 5. Séries Mais Bem Avaliadas */}
            {topRatedTV.length > 0 && <MovieRow title="Séries Mais Bem Avaliadas" items={topRatedTV} />}

            {/* 6. Séries pelas Categorias Favoritas */}
            {favoriteCategoryRows.map((row) => (
              <MovieRow key={row.id} title={row.title} items={row.items} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
