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
    name: 'Servidor 1',
    getMovieUrl: (id) => `https://vidsrc.me/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidsrc.me/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidsrc-xyz',
    name: 'Servidor 2',
    getMovieUrl: (id) => `https://vidsrc.xyz/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidsrc-in',
    name: 'Servidor 3',
    getMovieUrl: (id) => `https://vidsrc.in/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidsrc.in/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'embed-su',
    name: 'Servidor 4',
    getMovieUrl: (id) => `https://embed.su/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://embed.su/embed/tv/${id}/${s}/${e}`,
  },
];
