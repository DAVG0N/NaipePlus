'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';

export default function AuthListener() {
  const router = useRouter();
  const updateUserProfile = useAppStore((state) => state.updateUserProfile);

  useEffect(() => {
    const supabase = createClient();

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
      } else if (event === 'SIGNED_OUT') {
        document.cookie = 'naipe_session=; path=/; max-age=0';
        router.push('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [updateUserProfile, router]);

  return null;
}
