'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import VideoPlayer from '@/components/VideoPlayer';
import { MediaItem, getMediaDetails } from '@/lib/tmdb';
import { useAppStore } from '@/lib/store';

export default function WatchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { addToWatchHistory } = useAppStore();

  const mediaType = (params?.mediaType as 'movie' | 'tv') || 'movie';
  const id = (params?.id as string) || 'tt17048514';

  const season = Number(searchParams.get('season')) || 1;
  const episode = Number(searchParams.get('episode')) || 1;

  const [media, setMedia] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMedia() {
      try {
        const data = await getMediaDetails(id, mediaType);
        setMedia(data);
        if (data) {
          addToWatchHistory(data, mediaType === 'tv' ? season : undefined, mediaType === 'tv' ? episode : undefined);
        }
      } catch (err) {
        console.error('Error fetching media details for watch:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMedia();
  }, [id, mediaType, season, episode, addToWatchHistory]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="h-12 w-12 rounded-full border-4 border-netflix-red border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!media) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white space-y-4">
        <p className="text-lg font-bold">Conteúdo não encontrado</p>
        <button
          onClick={() => window.history.back()}
          className="rounded bg-netflix-red px-4 py-2 font-bold text-white"
        >
          Voltar
        </button>
      </div>
    );
  }

  return <VideoPlayer media={media} season={season} episode={episode} />;
}
