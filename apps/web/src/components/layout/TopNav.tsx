'use client';

import { UserButton } from '@clerk/nextjs';
import { Bell, Search, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TopNav() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4 flex-1">
        {/* Search */}
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search students, exams, programs..."
            className="w-full rounded-lg border bg-muted/50 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Help */}
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <HelpCircle className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative text-muted-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
            3
          </span>
        </Button>

        {/* Divider */}
        <div className="h-6 w-px bg-border mx-1" />

        {/* User menu */}
        <UserButton
          
          appearance={{
            elements: {
              avatarBox: 'h-9 w-9',
            },
          }}
        />
      </div>
    </header>
  );
}
