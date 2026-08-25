'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { SuperAdminLayout as SuperAdminLayoutComponent } from '@/components/layout/SuperAdminLayout';

export default function SuperAdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['super_admin']}>
        <SuperAdminLayoutComponent>{children}</SuperAdminLayoutComponent>
      </RoleGuard>
    </AuthGuard>
  );
}
