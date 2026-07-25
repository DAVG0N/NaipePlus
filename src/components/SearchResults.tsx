'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { MediaItem, searchMedia, GENRE_MAP } from '@/lib/tmdb';
import MovieRow from './MovieRow';

interface SearchResultsProps {
  query: string;
  pageType?: 'all' | 'tv' | 'movie';
}

export default function SearchResults({ query, pageType = 'all' }: SearchResultsProps) {
  const [results, setResults] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchResults() {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const data = await searchMedia(query);
        if (isMounted) {
          setResults(data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchResults();
    return () => {
      isMounted = false;
    };
  }, [query]);

  // 1. Filter results based on current page context (all, tv, movie)
  const pageFilteredResults = useMemo(() => {
    if (pageType === 'tv') {
      return results.filter((item) => item.media_type === 'tv');
    }
    if (pageType === 'movie') {
      return results.filter((item) => item.media_type === 'movie');
    }
    return results;
  }, [results, pageType]);

  // Group results into category sections automatically
  const groupedSections = useMemo(() => {
    if (pageType === 'all') {
      const tvItems = pageFilteredResults.filter((i) => i.media_type === 'tv');
      const movieItems = pageFilteredResults.filter((i) => i.media_type === 'movie');

      const sections = [];
      if (tvItems.length > 0) {
        sections.push({ id: 'tv-section', title: 'Séries', items: tvItems });
      }
      if (movieItems.length > 0) {
        sections.push({ id: 'movie-section', title: 'Filmes', items: movieItems });
      }
      return sections.length > 0 ? sections : null;
    }

    // Grouping by ONLY the primary (first) genre of each item so each item appears exactly once
    const genreGroups = new Map<number, MediaItem[]>();
    const itemsWithoutGenre: MediaItem[] = [];

    pageFilteredResults.forEach((item) => {
      const primaryGenreId = item.genre_ids?.find((gId) => GENRE_MAP[gId]);
      if (primaryGenreId) {
        if (!genreGroups.has(primaryGenreId)) genreGroups.set(primaryGenreId, []);
        genreGroups.get(primaryGenreId)!.push(item);
      } else {
        itemsWithoutGenre.push(item);
      }
    });

    const sections = Array.from(genreGroups.entries()).map(([gId, items]) => ({
      id: `genre-${gId}`,
      title: `${pageType === 'tv' ? 'Séries de' : 'Filmes de'} ${GENRE_MAP[gId]}`,
      items,
    }));

    if (itemsWithoutGenre.length > 0) {
      sections.push({
        id: 'genre-other',
        title: `${pageType === 'tv' ? 'Outras Séries' : 'Outros Filmes'}`,
        items: itemsWithoutGenre,
      });
    }

    return sections.length > 0 ? sections : null;
  }, [pageFilteredResults, pageType]);

  if (isLoading) {
    return (
      <div className="pt-24 px-8 sm:px-12 min-h-[60vh]">
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="h-10 w-10 rounded-full border-4 border-netflix-red border-t-transparent animate-spin" />
          <span className="text-sm font-semibold text-netflix-gray">A pesquisar catálogo...</span>
        </div>
      </div>
    );
  }

  if (pageFilteredResults.length === 0) {
    const pageLabel =
      pageType === 'tv' ? 'séries' : pageType === 'movie' ? 'filmes' : 'filmes ou séries';

    return (
      <div className="pt-24 px-8 sm:px-12 max-w-7xl mx-auto min-h-[60vh]">
        <div className="py-16 text-center text-netflix-gray text-sm sm:text-base bg-netflix-dark/40 rounded-2xl border border-gray-800 p-8 space-y-2">
          <p className="font-semibold text-gray-300">Nenhum conteúdo de {pageLabel} encontrado para &quot;{query}&quot;.</p>
          <p className="text-xs text-netflix-gray">Tente pesquisar por outros termos, atores ou géneros.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 space-y-6 min-h-[60vh]">
      {groupedSections && groupedSections.length > 0 ? (
        <div className="space-y-6">
          {groupedSections.map((section) => (
            <MovieRow key={section.id} title={section.title} items={section.items} />
          ))}
        </div>
      ) : (
        <MovieRow
          title={
            pageType === 'tv'
              ? 'Séries Encontradas'
              : pageType === 'movie'
              ? 'Filmes Encontrados'
              : 'Resultados da Pesquisa'
          }
          items={pageFilteredResults}
        />
      )}
    </div>
  );
}
