'use client';

import React, { useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { getMediaDetails } from '@/lib/tmdb';
import { useAppStore } from '@/lib/store';

export default function WatchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openPlayer } = useAppStore();

  const mediaType = (params?.mediaType as 'movie' | 'tv') || 'movie';
  const id = (params?.id as string) || 'tt17048514';

  const season = Number(searchParams.get('season')) || 1;
  const episode = Number(searchParams.get('episode')) || 1;

  useEffect(() => {
    async function loadMedia() {
      try {
        const data = await getMediaDetails(id, mediaType);
        if (data) {
          openPlayer(data, season, episode);
          router.replace(mediaType === 'tv' ? '/series' : '/movies');
        } else {
          router.replace('/browse');
        }
      } catch (err) {
        console.error('Error fetching media details for watch:', err);
        router.replace('/browse');
      }
    }
    loadMedia();
  }, [id, mediaType, season, episode, openPlayer, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-black">
      <div className="h-12 w-12 rounded-full border-4 border-netflix-red border-t-transparent animate-spin" />
    </div>
  );
}
