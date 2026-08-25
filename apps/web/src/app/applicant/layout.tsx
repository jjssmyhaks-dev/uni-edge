'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { ApplicantLayout as ApplicantLayoutComponent } from '@/components/layout/ApplicantLayout';

export default function ApplicantPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <ApplicantLayoutComponent>{children}</ApplicantLayoutComponent>
    </AuthGuard>
  );
}
