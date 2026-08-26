'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { OnboardingGuard } from '@/components/auth/OnboardingGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <OnboardingGuard>
        <DashboardLayout>{children}</DashboardLayout>
      </OnboardingGuard>
    </AuthGuard>
  );
}
