'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  BookOpen,
  Users,
  FileText,
  ClipboardList,
  Bell,
  Shield,
  Settings,
  ChevronLeft,
  ClipboardCheck,
  FileCheck,
  Camera,
  GraduationCap as LogoIcon,
  IndianRupee,
} from 'lucide-react';
import type { UserRole } from '@uni-edge/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: UserRole[];
  section?: string;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />,
    section: 'Overview',
  },
  {
    label: 'Institutions',
    href: '/admin/institutions',
    icon: <Building2 className="h-4 w-4" />,
    roles: ['super_admin'],
    section: 'Management',
  },
  {
    label: 'Departments',
    href: '/admin/departments',
    icon: <BookOpen className="h-4 w-4" />,
    section: 'Management',
  },
  {
    label: 'Programs',
    href: '/admin/programs',
    icon: <GraduationCap className="h-4 w-4" />,
    section: 'Management',
  },
  {
    label: 'Students',
    href: '/admin/students',
    icon: <Users className="h-4 w-4" />,
    section: 'People',
  },
  {
    label: 'Staff',
    href: '/admin/staff',
    icon: <Users className="h-4 w-4" />,
    roles: ['super_admin', 'institution_admin'],
    section: 'People',
  },
  {
    label: 'Admissions',
    href: '/admin/admissions',
    icon: <FileText className="h-4 w-4" />,
    roles: ['super_admin', 'institution_admin', 'exam_committee', 'staff'],
    section: 'Academics',
  },
  {
    label: 'Applications',
    href: '/admin/applications',
    icon: <ClipboardList className="h-4 w-4" />,
    roles: ['super_admin', 'institution_admin'],
    section: 'Academics',
  },
  {
    label: 'Exams',
    href: '/admin/exams',
    icon: <ClipboardList className="h-4 w-4" />,
    roles: ['super_admin', 'institution_admin', 'exam_committee'],
    section: 'Academics',
  },
  {
    label: 'Attendance',
    href: '/admin/attendance',
    icon: <ClipboardCheck className="h-4 w-4" />,
    roles: ['super_admin', 'institution_admin', 'faculty', 'staff'],
    section: 'Academics',
  },
  {
    label: 'Proctoring',
    href: '/admin/exams/proctoring',
    icon: <Camera className="h-4 w-4" />,
    roles: ['super_admin', 'institution_admin', 'exam_committee'],
    section: 'Academics',
  },
  {
    label: 'Notices',
    href: '/admin/notices',
    icon: <Bell className="h-4 w-4" />,
    section: 'Communication',
  },
  {
    label: 'Fees & Payments',
    href: '/admin/fees',
    icon: <IndianRupee className="h-4 w-4" />,
    roles: ['super_admin', 'institution_admin', 'staff'],
    section: 'Finance',
  },
  {
    label: 'Doc Requests',
    href: '/admin/document-requests',
    icon: <FileCheck className="h-4 w-4" />,
    roles: ['super_admin', 'institution_admin', 'staff'],
    section: 'Communication',
  },
  {
    label: 'Audit Logs',
    href: '/admin/audit',
    icon: <Shield className="h-4 w-4" />,
    roles: ['super_admin', 'institution_admin', 'exam_committee'],
    section: 'System',
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: <Settings className="h-4 w-4" />,
    roles: ['super_admin', 'institution_admin'],
    section: 'System',
  },
];

interface SidebarProps {
  userRole?: UserRole;
  collapsed?: boolean;
  onCollapse?: () => void;
}

export function Sidebar({ userRole, collapsed = false, onCollapse }: SidebarProps) {
  const pathname = usePathname();

  const filteredItems = navItems.filter(
    (item) => !item.roles || (userRole && item.roles.includes(item.roles[0]))
  );

  // Group by section
  const sections = filteredItems.reduce((acc, item) => {
    const section = item.section || 'Other';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <LogoIcon className="h-6 w-6 text-primary shrink-0" />
        {!collapsed && (
          <span className="text-xl font-bold text-primary">Uni-Edge</span>
        )}
        <button
          onClick={onCollapse}
          className={cn(
            'rounded-md p-1.5 hover:bg-accent transition-colors ml-auto',
            collapsed && 'mx-auto'
          )}
        >
          <ChevronLeft
            className={cn('h-5 w-5 transition-transform', collapsed && 'rotate-180')}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {!collapsed ? (
          Object.entries(sections).map(([section, items]) => (
            <div key={section} className="mb-4">
              <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section}
              </p>
              {items.map((item) => {
                const isActive =
                  item.href === '/admin/dashboard'
                    ? pathname === '/admin/dashboard'
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
            </div>
          ))
        ) : (
          filteredItems.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin/dashboard' || pathname === '/admin'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-center rounded-md p-2 mb-1 transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
                title={item.label}
              >
                {item.icon}
              </Link>
            );
          })
        )}
      </nav>
    </aside>
  );
}
