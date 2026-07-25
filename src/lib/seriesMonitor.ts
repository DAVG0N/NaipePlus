import { MediaItem, getImageUrl } from './tmdb';
import { NotificationItem, TMDBTVDetails } from './types/notifications';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const FALLBACK_TMDB_KEYS = [
  'fb7bb23f03b6994dafc674c074d01761',
  '8301a21598f8b45668d5711a814f01f6',
  '8cf43ad9c085135b9479ad5cf6bbcbda',
  'da63548086e399ffc910fbc08526df05',
];

const STORAGE_KEY_NOTIFIED = 'naipe_notified_events_v1';

function getNotifiedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFIED);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function saveNotifiedId(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const current = getNotifiedIds();
    current.add(id);
    localStorage.setItem(STORAGE_KEY_NOTIFIED, JSON.stringify(Array.from(current)));
  } catch (err) {
    console.error('Failed to save notified event:', err);
  }
}

async function fetchTVDetails(tmdbId: number): Promise<TMDBTVDetails | null> {
  const envKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const keysToTry = envKey && !envKey.includes('your-tmdb-api-key')
    ? [envKey, ...FALLBACK_TMDB_KEYS]
    : FALLBACK_TMDB_KEYS;

  for (const apiKey of keysToTry) {
    const queryParams = new URLSearchParams({
      api_key: apiKey,
      language: 'pt-PT',
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const res = await fetch(`${TMDB_BASE_URL}/tv/${tmdbId}?${queryParams.toString()}`, {
        next: { revalidate: 3600 },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      clearTimeout(timeoutId);
    }
  }

  return null;
}

export async function processSeriesNotifications(myList: MediaItem[]): Promise<NotificationItem[]> {
  const tvSeries = myList.filter((item) => item.media_type === 'tv');
  if (tvSeries.length === 0) return [];

  const notifiedIds = getNotifiedIds();
  const newNotifications: NotificationItem[] = [];
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDate = new Date(todayStr);

  for (const series of tvSeries) {
    const tmdbId = series.tmdbId || parseInt(series.id, 10);
    if (!tmdbId || isNaN(tmdbId)) continue;

    const details = await fetchTVDetails(tmdbId);
    if (!details) continue;

    const poster = getImageUrl(details.poster_path || series.poster_path, 'w500');

    // 1. Check next_episode_to_air
    if (details.next_episode_to_air) {
      const ep = details.next_episode_to_air;
      const eventId = `ep_${details.id}_s${ep.season_number}e${ep.episode_number}_${ep.air_date}`;

      if (!notifiedIds.has(eventId)) {
        const epAirDate = new Date(ep.air_date);
        const diffDays = Math.ceil((epAirDate.getTime() - todayDate.getTime()) / (1000 * 3600 * 24));

        if (diffDays === 0) {
          // Episode airs today!
          newNotifications.push({
            id: eventId,
            seriesId: String(details.id),
            seriesTitle: details.name,
            posterPath: poster,
            title: 'Novo Episódio Hoje! 🎬',
            message: `${details.name}: T${ep.season_number}E${ep.episode_number} "${ep.name || 'Novo Episódio'}" estreia hoje!`,
            type: 'episode_today',
            date: ep.air_date,
            read: false,
            createdAt: new Date().toISOString(),
          });
          saveNotifiedId(eventId);
        } else if (diffDays > 0 && diffDays <= 7) {
          // Episode airs in the next 7 days
          newNotifications.push({
            id: eventId,
            seriesId: String(details.id),
            seriesTitle: details.name,
            posterPath: poster,
            title: 'Novo Episódio em Breve 📅',
            message: `${details.name}: T${ep.season_number}E${ep.episode_number} "${ep.name || 'Novo Episódio'}" estreia em ${diffDays} dia(s) (${ep.air_date}).`,
            type: 'episode_upcoming',
            date: ep.air_date,
            read: false,
            createdAt: new Date().toISOString(),
          });
          saveNotifiedId(eventId);
        }
      }
    }

    // 2. Check series status
    if (details.status) {
      const statusEventId = `status_${details.id}_${details.status.toLowerCase()}`;
      if (!notifiedIds.has(statusEventId)) {
        if (details.status === 'Canceled') {
          newNotifications.push({
            id: statusEventId,
            seriesId: String(details.id),
            seriesTitle: details.name,
            posterPath: poster,
            title: 'Série Cancelada ⚠️',
            message: `${details.name} foi oficialmente cancelada.`,
            type: 'series_status',
            date: todayStr,
            read: false,
            createdAt: new Date().toISOString(),
          });
          saveNotifiedId(statusEventId);
        } else if (details.status === 'Ended') {
          newNotifications.push({
            id: statusEventId,
            seriesId: String(details.id),
            seriesTitle: details.name,
            posterPath: poster,
            title: 'Série Concluída 🏁',
            message: `${details.name} concluiu a sua transmissão oficial.`,
            type: 'series_status',
            date: todayStr,
            read: false,
            createdAt: new Date().toISOString(),
          });
          saveNotifiedId(statusEventId);
        }
      }
    }
  }

  return newNotifications;
}
