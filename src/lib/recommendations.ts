import { MediaItem, GENRE_MAP } from './tmdb';
import { WatchHistoryItem } from './types/profile';

export interface UserRecommendations {
  showParaTi: boolean;
  paraTiItems: MediaItem[];
  favoriteGenreIds: number[];
}

/**
 * Calculates user personalized recommendations and favorite genre IDs based on watch history, likes, and my list.
 */
export function getPersonalizedRecommendations(
  watchHistory: WatchHistoryItem[],
  likedList: MediaItem[],
  myList: MediaItem[],
  candidatePool: MediaItem[],
  mediaFilter?: 'movie' | 'tv'
): UserRecommendations {
  const watchedCount = watchHistory.length;
  // "Para Ti" appears after the user has watched at least 5 series/movies
  const showParaTi = watchedCount >= 5;

  // 1. Calculate genre frequency score
  const genreScores = new Map<number, number>();

  const processMedia = (media: MediaItem, weight: number) => {
    if (mediaFilter && media.media_type !== mediaFilter) return;
    if (media.genre_ids && media.genre_ids.length > 0) {
      media.genre_ids.forEach((gId) => {
        if (GENRE_MAP[gId]) {
          genreScores.set(gId, (genreScores.get(gId) || 0) + weight);
        }
      });
    }
  };

  watchHistory.forEach((h) => processMedia(h.media, 2));
  likedList.forEach((m) => processMedia(m, 3));
  myList.forEach((m) => processMedia(m, 1));

  // Sort genres by score descending
  const sortedGenres = Array.from(genreScores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([gId]) => gId);

  // Fallback default popular genre IDs if user doesn't have enough history
  const defaultGenres = mediaFilter === 'tv' ? [10759, 18, 35, 10765] : [28, 35, 18, 878];
  const favoriteGenreIds = sortedGenres.length >= 2 ? sortedGenres.slice(0, 4) : defaultGenres;

  // 2. Generate "Para Ti" items
  const watchedIds = new Set(watchHistory.map((h) => h.media.id));
  const filteredCandidates = candidatePool.filter((item) => {
    if (mediaFilter && item.media_type !== mediaFilter) return false;
    return !watchedIds.has(item.id);
  });

  // Score candidates based on match with favorite genres
  const paraTiItems = filteredCandidates
    .map((item) => {
      let score = item.vote_average || 8.0;
      if (item.genre_ids) {
        item.genre_ids.forEach((gId) => {
          if (genreScores.has(gId)) {
            score += genreScores.get(gId)! * 0.5;
          }
        });
      }
      return { item, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item);

  return {
    showParaTi,
    paraTiItems: paraTiItems.length > 0 ? paraTiItems : filteredCandidates,
    favoriteGenreIds,
  };
}
