'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Camera,
  IndianRupee,
  FileCheck,
  ClipboardCheck,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Kbd, KbdGroup } from '@/components/ui/kbd';

const navGroups = [
  {
    heading: 'Navigation',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Institutions', href: '/admin/institutions', icon: Building2 },
      { label: 'Departments', href: '/admin/departments', icon: BookOpen },
      { label: 'Programs', href: '/admin/programs', icon: GraduationCap },
      { label: 'Students', href: '/admin/students', icon: Users },
      { label: 'Staff', href: '/admin/staff', icon: Users },
    ],
  },
  {
    heading: 'Academics',
    items: [
      { label: 'Admissions', href: '/admin/admissions', icon: FileText },
      { label: 'Applications', href: '/admin/applications', icon: ClipboardList },
      { label: 'Exams', href: '/admin/exams', icon: ClipboardList },
      { label: 'Attendance', href: '/admin/attendance', icon: ClipboardCheck },
      { label: 'Proctoring', href: '/admin/exams/proctoring', icon: Camera },
    ],
  },
  {
    heading: 'System',
    items: [
      { label: 'Fees & Payments', href: '/admin/fees', icon: IndianRupee },
      { label: 'Notices', href: '/admin/notices', icon: Bell },
      { label: 'Document Requests', href: '/admin/document-requests', icon: FileCheck },
      { label: 'Audit Logs', href: '/admin/audit', icon: Shield },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/60 transition-colors cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-60">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span>Search...</span>
        <KbdGroup className="ml-2">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </button>

      <CommandDialog onOpenChange={setOpen} open={open}>
        <CommandInput placeholder="What do you need?" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {navGroups.map((group) => (
            <CommandGroup key={group.heading} heading={group.heading}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.href}
                  onSelect={() => runCommand(item.href)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
          <CommandSeparator />
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => runCommand('/admin/exams/entrance/new')}>
              <ClipboardList className="mr-2 h-4 w-4" />
              Create New Exam
            </CommandItem>
            <CommandItem onSelect={() => runCommand('/onboarding')}>
              <Settings className="mr-2 h-4 w-4" />
              Institution Setup
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
