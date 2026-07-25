import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function getRedirectUrl() {
  if (typeof window !== 'undefined' && window.location.origin) {
    return `${window.location.origin}/`;
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    return siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;
  }
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/`;
  }
  return 'http://localhost:3000/';
}
