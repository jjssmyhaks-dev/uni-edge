'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  User,
  ClipboardList,
  Award,
  Bell,
  Calendar,
  ClipboardCheck,
  Download,
  FileText,
  GraduationCap,
  Settings,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/student/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Profile', href: '/student/profile', icon: <User className="h-5 w-5" /> },
  { label: 'My Attendance', href: '/student/attendance', icon: <ClipboardCheck className="h-5 w-5" /> },
  { label: 'Exam Schedule', href: '/student/exams', icon: <Calendar className="h-5 w-5" /> },
  { label: 'Hall Tickets', href: '/student/hall-tickets', icon: <Download className="h-5 w-5" /> },
  { label: 'Results', href: '/student/results', icon: <Award className="h-5 w-5" /> },
  { label: 'Documents', href: '/student/documents', icon: <FileText className="h-5 w-5" /> },
  { label: 'Notices', href: '/student/notices', icon: <Bell className="h-5 w-5" /> },
];

export function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r bg-card">
        <div className="flex h-16 items-center gap-2 px-4 border-b">
          <GraduationCap className="h-6 w-6 text-primary" />
          <div>
            <span className="text-lg font-bold text-primary">Uni-Edge</span>
            <span className="ml-2 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Student</span>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.href === '/student/dashboard'
              ? pathname === '/student/dashboard'
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

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6 bg-muted/30">{children}</main>
    </div>
  );
}
