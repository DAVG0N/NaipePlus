# ARCHITECTURAL SPECIFICATION & MASTER IMPLEMENTATION PROMPT
## Project: Netflix Clone Platform ("StreamFlix")

---

### EXECUTIVE SUMMARY & VISION
This document is a comprehensive, production-grade master specification for building **StreamFlix**—a high-performance, pixel-perfect clone of the Netflix web platform. 

The system architecture utilizes **Next.js 14+ (App Router)** as a unified full-stack framework with **Supabase (PostgreSQL + Auth)**, **Tailwind CSS**, **Framer Motion**, and **Redis** for high-speed caching. Video streaming is driven via embed iframe endpoints (e.g., VidSrc protocol) using IMDB/TMDB identifiers, designed for fallback support across up to 4 providers.

---

### ARCHITECTURE OVERVIEW

```
                  ┌────────────────────────────────────────┐
                  │          Next.js 14 (App Router)       │
                  │  (Frontend React + SSR + Server Actions│
                  └───────────────────┬────────────────────┘
                                      │
           ┌──────────────────────────┼──────────────────────────┐
           ▼                          ▼                          ▼
┌────────────────────┐      ┌────────────────────┐     ┌────────────────────┐
│   Supabase Auth    │      │ Supabase Postgres  │     │   Upstash Redis    │
│ (Email + Google)   │      │  (Data & Watch Time│     │(API Cache / Limit) │
└────────────────────┘      └────────────────────┘     └────────────────────┘
                                      │
                                      ▼
                   ┌──────────────────────────────────────┐
                   │    External Embed & Provider Layer   │
                   │ (VidSrc / TMDB API / Future Animes)  │
                   └──────────────────────────────────────┘
```

---

### TECH STACK & CORE SETUP

| Layer | Technology Selected |
| :--- | :--- |
| **Framework** | Next.js 14+ (App Router, TypeScript, Server Actions) |
| **Styling** | Tailwind CSS, Lucide React, Framer Motion |
| **Database & Auth** | Supabase (PostgreSQL, Row Level Security, Auth with Google & Email) |
| **Caching Layer** | Upstash Redis / Redis (for TMDB API responses & metadata caching) |
| **UI Components** | Radix UI Primitives / Shadcn UI |
| **State / Player** | Zustand (Global UI State), `@tanstack/react-query` |

---

### DATABASE SCHEMA (Supabase PostgreSQL)

#### 1. `profiles`
* `id` (uuid, Primary Key, references `auth.users.id`)
* `email` (text)
* `full_name` (text)
* `avatar_url` (text)
* `created_at` (timestamp with time zone)

#### 2. `watch_history`
* `id` (uuid, Primary Key)
* `user_id` (uuid, references `profiles.id`)
* `media_id` (text) — IMDB ID (e.g., `tt17048514`) or TMDB ID
* `media_type` (text) — `'movie'` | `'tv'`
* `season` (integer, optional)
* `episode` (integer, optional)
* `progress_seconds` (integer)
* `duration_seconds` (integer)
* `updated_at` (timestamp with time zone)

#### 3. `my_list`
* `id` (uuid, Primary Key)
* `user_id` (uuid, references `profiles.id`)
* `media_id` (text)
* `media_type` (text) — `'movie'` | `'tv'`
* `title` (text)
* `poster_path` (text)
* `backdrop_path` (text)
* `vote_average` (numeric)
* `created_at` (timestamp with time zone)

---

### API INTEGRATION & EMBED ENGINE SPECIFICATION

#### Provider Fallback Logic
The video engine supports primary and fallback embed URLs. Embed requests do not require API keys for rendering if using VidSrc endpoints.

* **Movie Embed Format:** `https://vidsrc.me/embed/movie/{id}` or `https://vidsrc.xyz/embed/movie/{id}` (Supports TMDB or IMDB `tt` prefix).
* **TV Show Embed Format:** `https://vidsrc.me/embed/tv/{id}/{season}/{episode}`
* **Metadata Provider:** Official TMDB REST API (`api.themoviedb.org/3`) cached via Redis for 24 hours to ensure high performance.

#### Provider Selector Architecture
Define an abstracted resolver interface in code (`lib/providers.ts`):
```typescript
export interface StreamProvider {
  id: string;
  name: string;
  getMovieUrl: (imdbOrTmdbId: string) => string;
  getTvUrl: (imdbOrTmdbId: string, season: number, episode: number) => string;
}

export const PROVIDERS: StreamProvider[] = [
  {
    id: 'vidsrc-primary',
    name: 'Server 1 (VidSrc Pro)',
    getMovieUrl: (id) => `https://vidsrc.me/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidsrc.me/embed/tv/${id}/${s}/${e}`
  },
  {
    id: 'vidsrc-xyz',
    name: 'Server 2 (VidSrc XYZ)',
    getMovieUrl: (id) => `https://vidsrc.xyz/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}`
  },
  {
    id: 'vidsrc-in',
    name: 'Server 3 (VidSrc In)',
    getMovieUrl: (id) => `https://vidsrc.in/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidsrc.in/embed/tv/${id}/${s}/${e}`
  }
];
```

---

### FEATURE IMPLEMENTATION ROADMAP

#### STEP 1: Core Setup & Authentication
1. Initialize Next.js app with Tailwind CSS and TypeScript.
2. Integrate Supabase SSR package (`@supabase/ssr`).
3. Setup Google OAuth & Email/Password Sign-In / Sign-Up pages matching Netflix layout.
4. Implement Middleware to protect routes (`/browse`, `/watch`, `/my-list`).

#### STEP 2: Netflix UI Engine (Pixel Perfect)
1. **Header / Navbar:** Glassmorphism effect on scroll, logo, links ("Início", "Séries", "Filmes", "A Minha Lista", "Animes (Em Breve)"), search bar expansion, profile dropdown.
2. **Hero Billboard:** Large featured backdrop with trailer snippet/overlay, title logo, "Play" button, and "Mais Informações" button.
3. **Content Rows (Carousels):** Smooth horizontal scrolling with hover preview cards (auto-expand with play, add to list, like buttons, and metadata badges like 4K, HD, Rating).
4. **Detail Modal:** Netflix-style expanded modal with full summary, cast, episode selector (for TV series), recommended titles, and provider switcher.

#### STEP 3: Video Player Engine & Engagement
1. Fullscreen iframe wrapper with custom control bar over overlay.
2. Auto-resume capability using `watch_history` from Supabase.
3. "Next Episode" overlay prompt when video approaches completion.
4. Server Switcher menu inside player toolbar to toggle providers instantly.

#### STEP 4: Anime Hub Future-Proofing
1. Reserve tab `Animes` in Navigation.
2. Render a visually stunning "Em Breve / Coming Soon" page with teaser cards and option for users to click "Notificar-me".

---

### STEP-BY-STEP INSTRUCTIONS FOR ANTIGRAVITY AGENT

Execute the following sequential tasks to build the full repository:

1. **Project Scaffold:** Run `npx create-next-app@latest streamflix --typescript --tailwind --eslint --app --src-dir`.
2. **Dependencies:** Install `@supabase/supabase-js`, `@supabase/ssr`, `lucide-react`, `framer-motion`, `clsx`, `tailwind-merge`, `@upstash/redis`, `zustand`.
3. **Environment Setup:** Create `.env.local` containing:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `NEXT_PUBLIC_TMDB_API_KEY`
   * `UPSTASH_REDIS_REST_URL`
   * `UPSTASH_REDIS_REST_TOKEN`
4. **Database Migration:** Create SQL migration script for Supabase containing `profiles`, `watch_history`, and `my_list` tables with RLS policies enabled.
5. **API Services:** Implement `lib/tmdb.ts` with Redis caching layer and `lib/providers.ts` for multi-embed routing.
6. **UI Components:** Build `Navbar`, `Billboard`, `MovieRow`, `MovieCard`, `PreviewModal`, `VideoPlayer`, and `AnimePlaceholder`.
7. **Testing Build:** Ensure `npm run build` succeeds without TypeScript or ESLint errors.
