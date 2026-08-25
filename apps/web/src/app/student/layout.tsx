'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { StudentLayout } from '@/components/layout/StudentLayout';

export default function StudentPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <StudentLayout>{children}</StudentLayout>
    </AuthGuard>
  );
}
