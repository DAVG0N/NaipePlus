import { create } from 'zustand';
import { MediaItem } from './tmdb';
import { PROVIDERS, StreamProvider } from './providers';
import { NotificationItem } from './types/notifications';
import { WatchHistoryItem } from './types/profile';

interface AppState {
  // Preview Modal
  isPreviewOpen: boolean;
  selectedMedia: MediaItem | null;
  openPreview: (media: MediaItem) => void;
  closePreview: () => void;

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

export const useAppStore = create<AppState>((set, get) => ({
  isPreviewOpen: false,
  selectedMedia: null,
  openPreview: (media) => set({ isPreviewOpen: true, selectedMedia: media }),
  closePreview: () => set({ isPreviewOpen: false }),

  selectedProvider: PROVIDERS[0],
  setProvider: (provider) => set({ selectedProvider: provider }),

  userName: 'Utilizador NAIPE+',
  userEmail: 'utilizador@naipe.pt',
  userAvatarUrl: '',
  trailersEnabled: true,
  trailersMutedByDefault: false,
  updateUserProfile: (data) => set((state) => ({ ...state, ...data })),

  myList: [],
  addToMyList: (media) =>
    set((state) => {
      if (state.myList.some((m) => m.id === media.id)) return state;
      return { myList: [media, ...state.myList] };
    }),
  removeFromMyList: (id) =>
    set((state) => ({
      myList: state.myList.filter((m) => m.id !== id),
    })),
  isInMyList: (id) => get().myList.some((m) => m.id === id),

  likedList: [],
  toggleLike: (media) =>
    set((state) => {
      const exists = state.likedList.some((m) => m.id === media.id);
      if (exists) {
        return { likedList: state.likedList.filter((m) => m.id !== media.id) };
      } else {
        return { likedList: [media, ...state.likedList] };
      }
    }),
  isLiked: (id) => get().likedList.some((m) => m.id === id),

  watchHistory: [],
  addToWatchHistory: (media, season, episode) =>
    set((state) => {
      const newItem: WatchHistoryItem = {
        id: `hist_${media.id}_${Date.now()}`,
        media,
        watchedAt: new Date().toISOString(),
        season,
        episode,
      };
      // Keep only most recent watch per title/episode to avoid cluttering
      const filtered = state.watchHistory.filter(
        (h) => !(h.media.id === media.id && h.season === season && h.episode === episode)
      );
      return { watchHistory: [newItem, ...filtered] };
    }),
  clearWatchHistory: () => set({ watchHistory: [] }),

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
}));
