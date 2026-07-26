import { createClient } from './client';
import { MediaItem } from '../tmdb';
import { WatchHistoryItem } from '../types/profile';

/**
 * Sync Service for Supabase Persistence
 * All functions fail gracefully if offline, missing keys, or user is unauthenticated.
 */

export async function fetchUserDataFromSupabase() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch My List
    const { data: myListData, error: myListError } = await supabase
      .from('my_list')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Fetch Liked List
    const { data: likedListData, error: likedListError } = await supabase
      .from('liked_list')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Fetch Watch History
    const { data: historyData, error: historyError } = await supabase
      .from('watch_history')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (myListError || likedListError || historyError) {
      console.warn('Supabase fetch error (using local state fallback):', { myListError, likedListError, historyError });
    }

    const myList: MediaItem[] = (myListData || []).map((row) => (row.media_data as MediaItem) || {
      id: row.media_id,
      media_type: row.media_type,
      title: row.title,
      name: row.title,
      poster_path: row.poster_path,
      backdrop_path: row.backdrop_path,
      vote_average: Number(row.vote_average) || 0,
    });

    const likedList: MediaItem[] = (likedListData || []).map((row) => (row.media_data as MediaItem) || {
      id: row.media_id,
      media_type: row.media_type,
      title: row.title,
      name: row.title,
      poster_path: row.poster_path,
      backdrop_path: row.backdrop_path,
      vote_average: Number(row.vote_average) || 0,
    });

    const watchHistory: WatchHistoryItem[] = (historyData || []).map((row) => {
      const mediaItem: MediaItem = (row.media_data as MediaItem) || {
        id: row.media_id,
        media_type: row.media_type,
        title: 'Título Desconhecido',
      };
      return {
        id: row.id,
        media: mediaItem,
        watchedAt: row.updated_at,
        season: row.season || undefined,
        episode: row.episode || undefined,
      };
    });

    return { myList, likedList, watchHistory };
  } catch (err) {
    console.warn('Failed to fetch from Supabase (falling back to localStorage):', err);
    return null;
  }
}

export async function syncAddToMyList(media: MediaItem) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('my_list').upsert(
      {
        user_id: user.id,
        media_id: String(media.id),
        media_type: media.media_type || 'movie',
        title: media.title || media.name || 'Sem Título',
        poster_path: media.poster_path || null,
        backdrop_path: media.backdrop_path || null,
        vote_average: media.vote_average || 0,
        media_data: media,
      },
      { onConflict: 'user_id,media_id' }
    );
  } catch (err) {
    console.warn('Failed to sync addToMyList to Supabase:', err);
  }
}

export async function syncRemoveFromMyList(mediaId: string) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('my_list')
      .delete()
      .eq('user_id', user.id)
      .eq('media_id', String(mediaId));
  } catch (err) {
    console.warn('Failed to sync removeFromMyList to Supabase:', err);
  }
}

export async function syncToggleLike(media: MediaItem, isLikedNow: boolean) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const mediaIdStr = String(media.id);

    if (isLikedNow) {
      await supabase.from('liked_list').upsert(
        {
          user_id: user.id,
          media_id: mediaIdStr,
          media_type: media.media_type || 'movie',
          title: media.title || media.name || 'Sem Título',
          poster_path: media.poster_path || null,
          backdrop_path: media.backdrop_path || null,
          vote_average: media.vote_average || 0,
          media_data: media,
        },
        { onConflict: 'user_id,media_id' }
      );
    } else {
      await supabase
        .from('liked_list')
        .delete()
        .eq('user_id', user.id)
        .eq('media_id', mediaIdStr);
    }
  } catch (err) {
    console.warn('Failed to sync toggleLike to Supabase:', err);
  }
}

export async function syncAddToWatchHistory(media: MediaItem, season?: number, episode?: number) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('watch_history').upsert(
      {
        user_id: user.id,
        media_id: String(media.id),
        media_type: media.media_type || 'movie',
        season: season || null,
        episode: episode || null,
        media_data: media,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,media_id,season,episode' }
    );
  } catch (err) {
    console.warn('Failed to sync addToWatchHistory to Supabase:', err);
  }
}

export async function syncClearWatchHistory() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('watch_history').delete().eq('user_id', user.id);
  } catch (err) {
    console.warn('Failed to sync clearWatchHistory to Supabase:', err);
  }
}
