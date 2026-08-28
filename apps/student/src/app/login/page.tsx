'use client';

import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function StudentLogin() {
  return (
    <div className="flex min-h-screen">
      {/* Left: Branding */}
      <div className="hidden flex-1 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 lg:flex lg:flex-col lg:items-center lg:justify-center p-12">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-2xl">UE</div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Uni-Edge Student Portal</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Your academic life — courses, grades, exams, and more — all in one place.
          </p>
          <div className="grid grid-cols-2 gap-4 text-left">
            {[
              { title: 'Semester Overview', desc: 'Track your courses and credits' },
              { title: 'Grades & Transcript', desc: 'View marks and download reports' },
              { title: 'Exam Schedule', desc: 'Upcoming exams and hall tickets' },
              { title: 'Fee Payments', desc: 'Pay fees and track receipts' },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border bg-card/50 p-4">
                <h3 className="font-semibold text-sm">{f.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Right: Sign In */}
      <div className="flex flex-1 items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:hidden">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm">UE</div>
              <span className="text-xl font-bold">Uni-Edge</span>
            </div>
            <p className="text-sm text-muted-foreground">Student Portal</p>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">Welcome back</h2>
          <p className="text-sm text-muted-foreground text-center mb-8">Sign in to access your student portal</p>
          <SignIn
            routing="path"
            path="/login"
            signUpUrl="/sign-up"
            fallbackRedirectUrl="/dashboard"
            appearance={{
              elements: {
                card: 'shadow-none border',
                formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
              },
            }}
          />
          <p className="text-center text-xs text-muted-foreground mt-6">
            Are you an admin?{' '}
            <Link href="http://localhost:3000/login" className="text-primary hover:underline">
              Admin Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
