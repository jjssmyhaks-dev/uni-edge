'use client';

import { UserButton } from '@clerk/nextjs';
import { Bell, HelpCircle, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { CommandMenu } from './CommandMenu';

export function TopNav() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center flex-1 max-w-md">
        <CommandMenu />
      </div>

      <div className="flex items-center gap-1">
        <button className="flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
          <HelpCircle className="h-4 w-4" />
        </button>

        <button className="relative flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
        </button>

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          title="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>

        <div className="h-5 w-px bg-border mx-1" />

        <UserButton
          appearance={{
            elements: {
              avatarBox: 'h-8 w-8',
            },
          }}
        />
      </div>
    </header>
  );
}
