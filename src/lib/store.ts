import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MediaItem } from './tmdb';
import { PROVIDERS, StreamProvider } from './providers';
import { NotificationItem } from './types/notifications';
import { WatchHistoryItem } from './types/profile';
import {
  syncAddToMyList,
  syncRemoveFromMyList,
  syncToggleLike,
  syncAddToWatchHistory,
  syncClearWatchHistory,
} from './supabase/syncService';

interface AppState {
  // Preview Modal
  isPreviewOpen: boolean;
  selectedMedia: MediaItem | null;
  openPreview: (media: MediaItem) => void;
  closePreview: () => void;

  // Global Video Player Modal
  isPlayerOpen: boolean;
  playerMedia: MediaItem | null;
  playerSeason: number;
  playerEpisode: number;
  openPlayer: (media: MediaItem, season?: number, episode?: number) => void;
  closePlayer: () => void;

  // Active Streaming Provider
  selectedProvider: StreamProvider;
  setProvider: (provider: StreamProvider) => void;

  // My List
  myList: MediaItem[];
  addToMyList: (media: MediaItem) => void;
  removeFromMyList: (id: string) => void;
  isInMyList: (id: string) => boolean;

  // Liked Titles
  likedList: MediaItem[];
  toggleLike: (media: MediaItem) => void;
  isLiked: (id: string) => boolean;

  // Watch History
  watchHistory: WatchHistoryItem[];
  addToWatchHistory: (media: MediaItem, season?: number, episode?: number) => void;
  clearWatchHistory: () => void;

  // User Profile Settings
  userName: string;
  userEmail: string;
  userAvatarUrl: string;
  trailersEnabled: boolean;
  trailersMutedByDefault: boolean;
  updateUserProfile: (data: Partial<{ userName: string; userEmail: string; userAvatarUrl: string; trailersEnabled: boolean; trailersMutedByDefault: boolean }>) => void;

  // Hydrate Cloud Data from Supabase
  hydrateFromCloud: (data: { myList?: MediaItem[]; likedList?: MediaItem[]; watchHistory?: WatchHistoryItem[] }) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Notifications
  notifications: NotificationItem[];
  addNotifications: (items: NotificationItem[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isPreviewOpen: false,
      selectedMedia: null,
      openPreview: (media) => set({ isPreviewOpen: true, selectedMedia: media }),
      closePreview: () => set({ isPreviewOpen: false }),

      isPlayerOpen: false,
      playerMedia: null,
      playerSeason: 1,
      playerEpisode: 1,
      openPlayer: (media, season = 1, episode = 1) => {
        get().addToWatchHistory(media, media.media_type === 'tv' ? season : undefined, media.media_type === 'tv' ? episode : undefined);
        set({ isPlayerOpen: true, playerMedia: media, playerSeason: season, playerEpisode: episode });
      },
      closePlayer: () => set({ isPlayerOpen: false, playerMedia: null }),

      selectedProvider: PROVIDERS[0],
      setProvider: (provider) => set({ selectedProvider: provider }),

      userName: 'Utilizador NAIPE+',
      userEmail: 'utilizador@naipe.pt',
      userAvatarUrl: '',
      trailersEnabled: true,
      trailersMutedByDefault: false,
      updateUserProfile: (data) => set((state) => ({ ...state, ...data })),

      myList: [],
      addToMyList: (media) => {
        set((state) => {
          if (state.myList.some((m) => String(m.id) === String(media.id))) return state;
          return { myList: [media, ...state.myList] };
        });
        syncAddToMyList(media);
      },
      removeFromMyList: (id) => {
        set((state) => ({
          myList: state.myList.filter((m) => String(m.id) !== String(id)),
        }));
        syncRemoveFromMyList(id);
      },
      isInMyList: (id) => get().myList.some((m) => String(m.id) === String(id)),

      likedList: [],
      toggleLike: (media) => {
        let isLikedNow = false;
        set((state) => {
          const exists = state.likedList.some((m) => String(m.id) === String(media.id));
          isLikedNow = !exists;
          if (exists) {
            return { likedList: state.likedList.filter((m) => String(m.id) !== String(media.id)) };
          } else {
            return { likedList: [media, ...state.likedList] };
          }
        });
        syncToggleLike(media, isLikedNow);
      },
      isLiked: (id) => get().likedList.some((m) => String(m.id) === String(id)),

      watchHistory: [],
      addToWatchHistory: (media, season, episode) => {
        set((state) => {
          const newItem: WatchHistoryItem = {
            id: `hist_${media.id}_${Date.now()}`,
            media,
            watchedAt: new Date().toISOString(),
            season,
            episode,
          };
          const filtered = state.watchHistory.filter(
            (h) => !(String(h.media.id) === String(media.id) && h.season === season && h.episode === episode)
          );
          return { watchHistory: [newItem, ...filtered] };
        });
        syncAddToWatchHistory(media, season, episode);
      },
      clearWatchHistory: () => {
        set({ watchHistory: [] });
        syncClearWatchHistory();
      },

      hydrateFromCloud: (cloudData) => {
        set((state) => {
          // Merge local & cloud list, removing duplicates
          const mergedListMap = new Map<string, MediaItem>();
          (cloudData.myList || []).forEach((item) => mergedListMap.set(String(item.id), item));
          state.myList.forEach((item) => {
            if (!mergedListMap.has(String(item.id))) {
              mergedListMap.set(String(item.id), item);
            }
          });

          const mergedLikedMap = new Map<string, MediaItem>();
          (cloudData.likedList || []).forEach((item) => mergedLikedMap.set(String(item.id), item));
          state.likedList.forEach((item) => {
            if (!mergedLikedMap.has(String(item.id))) {
              mergedLikedMap.set(String(item.id), item);
            }
          });

          const mergedHistoryMap = new Map<string, WatchHistoryItem>();
          (cloudData.watchHistory || []).forEach((item) => {
            const key = `${item.media.id}_${item.season || 0}_${item.episode || 0}`;
            mergedHistoryMap.set(key, item);
          });
          state.watchHistory.forEach((item) => {
            const key = `${item.media.id}_${item.season || 0}_${item.episode || 0}`;
            if (!mergedHistoryMap.has(key)) {
              mergedHistoryMap.set(key, item);
            }
          });

          return {
            myList: Array.from(mergedListMap.values()),
            likedList: Array.from(mergedLikedMap.values()),
            watchHistory: Array.from(mergedHistoryMap.values()),
          };
        });
      },

      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      notifications: [],
      addNotifications: (items) =>
        set((state) => {
          const existingIds = new Set(state.notifications.map((n) => n.id));
          const filteredNew = items.filter((item) => !existingIds.has(item.id));
          if (filteredNew.length === 0) return state;
          return { notifications: [...filteredNew, ...state.notifications] };
        }),
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'naipe_app_store_v1',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
      partialize: (state) => ({
        myList: state.myList,
        likedList: state.likedList,
        watchHistory: state.watchHistory,
        userName: state.userName,
        userEmail: state.userEmail,
        userAvatarUrl: state.userAvatarUrl,
        trailersEnabled: state.trailersEnabled,
        trailersMutedByDefault: state.trailersMutedByDefault,
        selectedProvider: state.selectedProvider,
      }),
    }
  )
);

