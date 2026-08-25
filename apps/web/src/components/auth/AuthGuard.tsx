'use client';

import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Protects routes — redirects to sign-in if user is not authenticated.
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isSignedIn) {
    if (fallback) return <>{fallback}</>;
    redirect('/login');
  }

  return <>{children}</>;
}
