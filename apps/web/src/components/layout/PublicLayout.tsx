'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GraduationCap, Menu, X, Github, Twitter, Linkedin, Mail } from 'lucide-react';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Public header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <GraduationCap className="h-7 w-7" />
            Uni-Edge
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link href="/#modules" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Modules
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background px-6 py-4 space-y-3">
            <Link href="/#features" className="block text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Features</Link>
            <Link href="/#how-it-works" className="block text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>How It Works</Link>
            <Link href="/#modules" className="block text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Modules</Link>
            <hr className="my-2" />
            <Link href="/login" className="block text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
            <Button className="w-full" asChild>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>Get Started Free</Link>
            </Button>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
                <GraduationCap className="h-6 w-6" />
                Uni-Edge
              </Link>
              <p className="mt-3 text-sm text-muted-foreground">
                Automating university administration, admissions, and examinations for Indian institutions.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/#modules" className="hover:text-foreground transition-colors">Modules</Link></li>
                <li><Link href="/#how-it-works" className="hover:text-foreground transition-colors">How It Works</Link></li>
                <li><Link href="/apply" className="hover:text-foreground transition-colors">Apply Now</Link></li>
              </ul>
            </div>

            {/* For Institutions */}
            <div>
              <h3 className="text-sm font-semibold mb-3">For Institutions</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/login" className="hover:text-foreground transition-colors">Admin Portal</Link></li>
                <li><Link href="/signup" className="hover:text-foreground transition-colors">Register Institution</Link></li>
                <li><span className="text-muted-foreground/50">Pricing (Coming Soon)</span></li>
                <li><span className="text-muted-foreground/50">Support</span></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><span className="text-muted-foreground/50">Privacy Policy</span></li>
                <li><span className="text-muted-foreground/50">Terms of Service</span></li>
                <li><span className="text-muted-foreground/50">Data Processing</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4 border-t pt-6">
            <p className="text-sm text-muted-foreground">
              © 2026 Uni-Edge. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Built for Indian Universities</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
