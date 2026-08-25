'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import type { UserRole } from '@uni-edge/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useUser();
  const role = (user?.publicMetadata?.role as UserRole) || 'staff';

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        userRole={role}
        collapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-6 bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  );
}
