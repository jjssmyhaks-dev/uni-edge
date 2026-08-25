'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Users,
  Shield,
  Settings,
  BarChart3,
  GraduationCap,
} from 'lucide-react';

const navItems = [
  { label: 'Overview', href: '/super-admin/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Institutions', href: '/super-admin/institutions', icon: <Building2 className="h-5 w-5" /> },
  { label: 'All Users', href: '/super-admin/users', icon: <Users className="h-5 w-5" /> },
  { label: 'Analytics', href: '/super-admin/analytics', icon: <BarChart3 className="h-5 w-5" /> },
  { label: 'Audit Logs', href: '/super-admin/audit', icon: <Shield className="h-5 w-5" /> },
  { label: 'Settings', href: '/super-admin/settings', icon: <Settings className="h-5 w-5" /> },
];

export function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen">
      <aside className="flex w-64 flex-col border-r bg-card">
        <div className="flex h-16 items-center gap-2 px-4 border-b">
          <GraduationCap className="h-6 w-6 text-primary" />
          <div>
            <span className="text-lg font-bold text-primary">Uni-Edge</span>
            <span className="ml-2 rounded bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600">
              Super Admin
            </span>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.href === '/super-admin/dashboard'
              ? pathname === '/super-admin/dashboard'
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4">
          <UserButton  />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 bg-muted/30">{children}</main>
    </div>
  );
}
