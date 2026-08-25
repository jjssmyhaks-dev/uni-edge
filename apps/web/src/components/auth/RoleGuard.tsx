'use client';

import { useUser } from '@clerk/nextjs';
import type { UserRole } from '@uni-edge/types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

/**
 * Conditionally renders children based on user role.
 * Unlike AuthGuard, does NOT redirect — just hides content.
 */
export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { user } = useUser();

  const role = user?.publicMetadata?.role as UserRole | undefined;

  if (!role || !allowedRoles.includes(role)) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
