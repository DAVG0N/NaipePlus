import { MediaItem } from '../tmdb';

export interface WatchHistoryItem {
  id: string;
  media: MediaItem;
  watchedAt: string;
  season?: number;
  episode?: number;
}
