export type NotificationType = 'episode_today' | 'episode_upcoming' | 'series_status';

export interface NotificationItem {
  id: string;
  seriesId: string;
  seriesTitle: string;
  posterPath: string;
  title: string;
  message: string;
  type: NotificationType;
  date: string;
  read: boolean;
  createdAt: string;
}

export interface TMDBNextEpisode {
  id: number;
  name: string;
  overview: string;
  air_date: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
}

export interface TMDBTVDetails {
  id: number;
  name: string;
  status: string; // e.g., "Returning Series", "Ended", "Canceled", "In Production"
  next_episode_to_air: TMDBNextEpisode | null;
  last_episode_to_air: TMDBNextEpisode | null;
  number_of_episodes: number;
  number_of_seasons: number;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
}
