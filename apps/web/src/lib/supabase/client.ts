'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useSession } from '@clerk/nextjs';

/**
 * Create a Supabase client for use in Client Components.
 * Automatically attaches the Clerk session token for RLS enforcement.
 */
export function useSupabaseClient() {
  const { session } = useSession();

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: async (url: string | URL | Request, init?: RequestInit) => {
          const token = await session?.getToken();
          const headers = new Headers(init?.headers);
          if (token) {
            headers.set('Authorization', `Bearer ${token}`);
          }
          return fetch(url, { ...init, headers });
        },
      },
    }
  );
}
