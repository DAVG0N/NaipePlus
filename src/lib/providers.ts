export interface StreamProvider {
  id: string;
  name: string;
  badge?: string;
  getMovieUrl: (imdbOrTmdbId: string) => string;
  getTvUrl: (imdbOrTmdbId: string, season: number, episode: number) => string;
}

export const PROVIDERS: StreamProvider[] = [
  {
    id: 'vidsrc-primary',
    name: 'Server 1 (VidSrc Pro)',
    badge: 'Recomendado',
    getMovieUrl: (id) => `https://vidsrc.me/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidsrc.me/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidsrc-xyz',
    name: 'Server 2 (VidSrc XYZ)',
    badge: 'Rápido',
    getMovieUrl: (id) => `https://vidsrc.xyz/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidsrc-in',
    name: 'Server 3 (VidSrc In)',
    badge: 'HD',
    getMovieUrl: (id) => `https://vidsrc.in/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidsrc.in/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'embed-su',
    name: 'Server 4 (Embed.su)',
    badge: 'Fallback',
    getMovieUrl: (id) => `https://embed.su/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://embed.su/embed/tv/${id}/${s}/${e}`,
  },
];
