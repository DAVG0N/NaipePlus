'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { fetchUserDataFromSupabase } from '@/lib/supabase/syncService';

export default function AuthListener() {
  const router = useRouter();
  const updateUserProfile = useAppStore((state) => state.updateUserProfile);
  const hydrateFromCloud = useAppStore((state) => state.hydrateFromCloud);

  useEffect(() => {
    const supabase = createClient();

    const loadCloudData = async () => {
      const cloudData = await fetchUserDataFromSupabase();
      if (cloudData) {
        hydrateFromCloud(cloudData);
      }
    };

    // 1. Fetch current user session on mount
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        document.cookie = 'naipe_session=true; path=/; max-age=2592000';
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilizador NAIPE+';
        const avatar = user.user_metadata?.avatar_url || '';
        updateUserProfile({
          userName: name,
          userEmail: user.email || '',
          userAvatarUrl: avatar,
        });

        // Load data from Supabase into Zustand / localStorage
        loadCloudData();
      }
    });

    // 2. Listen to authentication state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        document.cookie = 'naipe_session=true; path=/; max-age=2592000';
        const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Utilizador NAIPE+';
        const avatar = session.user.user_metadata?.avatar_url || '';
        updateUserProfile({
          userName: name,
          userEmail: session.user.email || '',
          userAvatarUrl: avatar,
        });

        loadCloudData();
      } else if (event === 'SIGNED_OUT') {
        document.cookie = 'naipe_session=; path=/; max-age=0';
        router.push('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [updateUserProfile, hydrateFromCloud, router]);

  return null;
}

