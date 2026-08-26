'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useOnboardingStatus } from '@/lib/hooks/useOnboarding';
import { Loader2 } from 'lucide-react';

const PUBLIC_PATHS = ['/', '/login', '/signup', '/apply', '/onboarding'];

/**
 * Wraps admin/student/applicant layouts.
 * If the user is signed in but hasn't completed onboarding,
 * redirect them to /onboarding. Skip for public paths.
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { data, isLoading } = useOnboardingStatus();

  const isPublic = PUBLIC_PATHS.some(p => p === pathname || pathname.startsWith(p + '/'));

  useEffect(() => {
    if (!isLoaded || isLoading) return;
    if (isPublic) return;

    if (isSignedIn && data?.data && !data.data.onboarded && !pathname.startsWith('/onboarding')) {
      router.replace('/onboarding');
    }
  }, [isLoaded, isLoading, isSignedIn, data, pathname, router, isPublic]);

  // Show loading spinner while checking
  if (!isLoaded || (isSignedIn && isLoading)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
