import { createServerClient } from '@supabase/ssr';
import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';

/**
 * Create a Supabase client for use in Server Components, Route Handlers, and Server Actions.
 * Attaches the Clerk session token for RLS enforcement.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { getToken } = await auth();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as any)
            );
          } catch {
            // setAll is called from Server Components where cookies can't be modified.
          }
        },
      },
      global: {
        fetch: async (url: string | URL | Request, init?: RequestInit) => {
          const token = await getToken();
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
