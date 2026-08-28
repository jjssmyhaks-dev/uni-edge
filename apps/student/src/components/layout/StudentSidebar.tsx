'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, BookOpen, GraduationCap, ClipboardList, FileText,
  Calendar, Bell, IndianRupee, Download, Award, Briefcase, User,
  ChevronLeft, ChevronDown, LogOut, HelpCircle, Plus,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useUser, useClerk } from '@clerk/nextjs';

interface NavItem { label: string; href: string; icon: React.ComponentType<{ className?: string }> }
interface NavSection { title: string; items: NavItem[] }

const navSections: NavSection[] = [
  { title: 'Overview', items: [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }] },
  { title: 'Academics', items: [
    { label: 'My Courses', href: '/dashboard/courses', icon: BookOpen },
    { label: 'Registration', href: '/dashboard/registration', icon: ClipboardList },
    { label: 'Marks & Grades', href: '/dashboard/grades', icon: Award },
    { label: 'Assignments', href: '/dashboard/assignments', icon: FileText },
    { label: 'Attendance', href: '/dashboard/attendance', icon: Calendar },
  ]},
  { title: 'Exams', items: [{ label: 'Exam Schedule', href: '/dashboard/exams', icon: Calendar }] },
  { title: 'Finance', items: [{ label: 'Fees & Payments', href: '/dashboard/fees', icon: IndianRupee }] },
  { title: 'Resources', items: [
    { label: 'Documents', href: '/dashboard/documents', icon: Download },
    { label: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
    { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { label: 'Career Board', href: '/dashboard/career', icon: Briefcase },
  ]},
];

interface Props { collapsed?: boolean; onCollapse?: () => void }

export function StudentSidebar({ collapsed = false, onCollapse }: Props) {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();
  const name = user?.firstName || user?.lastName ? ((user.firstName || '') + ' ' + (user.lastName || '')).trim() : 'Student';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const email = user?.primaryEmailAddress?.emailAddress || '';

  return (
    <aside className={cn('flex flex-col border-r bg-card transition-all duration-300', collapsed ? 'w-16' : 'w-64')}>
      <div className="flex h-16 items-center gap-2 border-b px-4 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold text-sm shrink-0">UE</div>
        {!collapsed && <span className="text-lg font-semibold text-foreground">Uni-Edge</span>}
        <button onClick={onCollapse} className={cn('rounded-md p-1.5 hover:bg-accent transition-colors ml-auto', collapsed && 'mx-auto')}>
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {collapsed ? navSections.flatMap(s => s.items).map(item => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn('flex items-center justify-center rounded-md p-2 mb-1 transition-colors', isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground')} title={item.label}>
              <item.icon className="h-4 w-4" />
            </Link>
          );
        }) : navSections.map(section => (
          <Collapsible key={section.title} defaultOpen>
            <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
              {section.title}<ChevronDown className="h-3 w-3 shrink-0" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              {section.items.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className={cn('flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors', isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground')}>
                    <item.icon className="h-4 w-4 shrink-0" /><span>{item.label}</span>
                  </Link>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </nav>
      {!collapsed && (
        <div className="border-t p-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer"><AvatarFallback className="rounded-full text-xs">{initials}</AvatarFallback></Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="start">
                  <DropdownMenuLabel><p className="font-medium">{name}</p><p className="text-xs text-muted-foreground font-normal">{email}</p></DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href="/dashboard/profile"><User className="mr-2 h-4 w-4 opacity-80" /> Profile</Link></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut({ redirectUrl: '/' })}><LogOut className="mr-2 h-4 w-4 opacity-80" /> Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <HelpCircle className="h-4 w-4 cursor-pointer opacity-60 hover:opacity-100" />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
