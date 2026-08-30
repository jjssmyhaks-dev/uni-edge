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
  ChevronDown,
  ClipboardCheck,
  FileCheck,
  Camera,
  IndianRupee,
  LogOut,
  HelpCircle,
  Plus,
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import type { UserRole } from '@uni-edge/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useUser, useClerk } from '@clerk/nextjs';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Institutions', href: '/admin/institutions', icon: Building2, roles: ['super_admin'] },
      { label: 'Departments', href: '/admin/departments', icon: BookOpen },
      { label: 'Programs', href: '/admin/programs', icon: GraduationCap },
    ],
  },
  {
    title: 'People',
    items: [
      { label: 'Students', href: '/admin/students', icon: Users },
      { label: 'Staff', href: '/admin/staff', icon: Users, roles: ['super_admin', 'institution_admin'] },
    ],
  },
  {
    title: 'Academics',
    items: [
      { label: 'Admissions', href: '/admin/admissions', icon: FileText, roles: ['super_admin', 'institution_admin', 'exam_committee'] },
      { label: 'Applications', href: '/admin/applications', icon: ClipboardList, roles: ['super_admin', 'institution_admin'] },
      { label: 'Exams', href: '/admin/exams', icon: ClipboardList, roles: ['super_admin', 'institution_admin', 'exam_committee'] },
      { label: 'Attendance', href: '/admin/attendance', icon: ClipboardCheck, roles: ['super_admin', 'institution_admin', 'faculty', 'staff'] },
      { label: 'Proctoring', href: '/admin/exams/proctoring', icon: Camera, roles: ['super_admin', 'institution_admin', 'exam_committee'] },
    ],
  },
  {
    title: 'Finance',
    items: [
      { label: 'Fees & Payments', href: '/admin/fees', icon: IndianRupee, roles: ['super_admin', 'institution_admin', 'staff'] },
    ],
  },
  {
    title: 'Communication',
    items: [
      { label: 'Assistant', href: '/admin/assistant', icon: Bell },
      { label: 'Notices', href: '/admin/notices', icon: Bell },
      { label: 'Doc Requests', href: '/admin/document-requests', icon: FileCheck, roles: ['super_admin', 'institution_admin', 'staff'] },
      { label: 'Grievances', href: '/admin/grievances', icon: HelpCircle, roles: ['super_admin', 'institution_admin', 'staff', 'faculty'] },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Audit Logs', href: '/admin/audit', icon: Shield, roles: ['super_admin', 'institution_admin', 'exam_committee'] },
      { label: 'Settings', href: '/admin/settings', icon: Settings, roles: ['super_admin', 'institution_admin'] },
    ],
  },
];

interface SidebarProps {
  userRole?: UserRole;
  collapsed?: boolean;
  onCollapse?: () => void;
}

export function Sidebar({ userRole, collapsed = false, onCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();

  const displayName = user?.firstName || user?.lastName
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : 'Admin';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const email = user?.primaryEmailAddress?.emailAddress || '';

  const filteredSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.roles || (userRole && item.roles.includes(userRole))
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside className={cn('flex flex-col border-r bg-card transition-all duration-300', collapsed ? 'w-16' : 'w-64')}>
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-4 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold text-sm shrink-0">
          UE
        </div>
        {!collapsed && (
          <span className="text-lg font-semibold text-foreground">Uni-Edge</span>
        )}
        <button
          onClick={onCollapse}
          className={cn(
            'rounded-md p-1.5 hover:bg-accent transition-colors ml-auto',
            collapsed && 'mx-auto'
          )}
        >
          <ChevronLeft
            className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {collapsed ? (
          filteredSections.flatMap((section) => section.items).map((item) => {
            const isActive = item.href === '/admin/dashboard'
              ? pathname === '/admin/dashboard'
              : pathname.startsWith(item.href);
            return (
              <TooltipProvider key={item.href} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center justify-center rounded-md p-2 mb-1 transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })
        ) : (
          filteredSections.map((section) => (
            <Collapsible key={section.title} defaultOpen>
              <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
                {section.title}
                <ChevronDown className="h-3 w-3 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                {section.items.map((item) => {
                  const isActive = item.href === '/admin/dashboard'
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
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          ))
        )}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t p-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarFallback className="rounded-full text-xs">{initials}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="start">
                  <DropdownMenuLabel>
                    <p className="font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground font-normal">{email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut({ redirectUrl: '/' })}>
                    <LogOut className="mr-2 h-4 w-4 opacity-80" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 cursor-pointer opacity-60 hover:opacity-100" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[200px]">
                    <p className="text-xs">Uni-Edge University Management Platform</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel>Add New</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/admin/exams/entrance/new">
                    <ClipboardList className="mr-2 h-4 w-4 opacity-80" />
                    New Exam
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/notices">
                    <Bell className="mr-2 h-4 w-4 opacity-80" />
                    Post Notice
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </aside>
  );
}
