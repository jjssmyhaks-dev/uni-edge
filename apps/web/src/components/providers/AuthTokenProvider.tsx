'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { registerTokenGetter } from '@/lib/api-client';

/**
 * Bridges Clerk's client-side auth token into the apiClient module.
 * Mount once in the root layout (inside ClerkProvider + QueryProvider).
 */
export function AuthTokenProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    registerTokenGetter(getToken);
  }, [getToken]);

  return <>{children}</>;
}
