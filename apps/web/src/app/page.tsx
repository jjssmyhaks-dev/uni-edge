'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PublicLayout } from '@/components/layout/PublicLayout';
import {
  GraduationCap,
  ClipboardList,
  Users,
  Shield,
  BookOpen,
  FileCheck,
  Camera,
  Bell,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Building2,
  Clock,
  Globe,
  Lock,
} from 'lucide-react';

const features = [
  { icon: <GraduationCap className="h-5 w-5" />, title: 'Smart Admissions', description: 'Automate entrance exams, merit list generation, and enrollment workflows.' },
  { icon: <ClipboardList className="h-5 w-5" />, title: 'Exam Management', description: 'Schedule exams, auto-allocate rooms, assign invigilators, and manage results.' },
  { icon: <Camera className="h-5 w-5" />, title: 'Online Proctoring', description: 'AI-powered proctoring with face detection and tab-switch monitoring.' },
  { icon: <Users className="h-5 w-5" />, title: 'Student Portal', description: 'Students view schedules, download hall tickets, track attendance, and results.' },
  { icon: <FileCheck className="h-5 w-5" />, title: 'Document Management', description: 'Upload, verify, and manage transcripts with AI-powered parsing.' },
  { icon: <Bell className="h-5 w-5" />, title: 'Notice System', description: 'Publish notices to students, faculty, or departments via multiple channels.' },
  { icon: <BarChart3 className="h-5 w-5" />, title: 'Analytics & Reports', description: 'Real-time dashboards, attendance analytics, and audit trails.' },
  { icon: <Shield className="h-5 w-5" />, title: 'Enterprise Security', description: 'Multi-tenant isolation, role-based access, and full audit logging.' },
];

const modules = [
  { number: '01', title: 'Pre-Admission & Entrance', description: 'Programs, seats, eligibility criteria, entrance exams, merit lists.' },
  { number: '02', title: 'Admission & Enrollment', description: 'Application forms, document verification, offer letters, enrollment.' },
  { number: '03', title: 'Academic Administration', description: 'Attendance, student records, notices, document request workflows.' },
  { number: '04', title: 'Regular Examinations', description: 'Scheduling, room allocation, hall tickets, invigilators, results.' },
  { number: '05', title: 'Online Proctoring', description: 'Browser lockdown, webcam monitoring, anti-cheating, human review.' },
];

const steps = [
  { step: '1', title: 'Register Institution', description: 'Sign up and configure your institution, departments, and programs.' },
  { step: '2', title: 'Set Up Admissions', description: 'Configure admission cycles, eligibility criteria, and entrance exams.' },
  { step: '3', title: 'Manage Students', description: 'Track attendance, schedule exams, and publish results.' },
];

const stats = [
  { value: '10+', label: 'Institutions', icon: <Building2 className="h-4 w-4" /> },
  { value: '50+', label: 'Programs', icon: <GraduationCap className="h-4 w-4" /> },
  { value: '99.9%', label: 'Uptime', icon: <Clock className="h-4 w-4" /> },
  { value: '24/7', label: 'Support', icon: <Globe className="h-4 w-4" /> },
];

export default function HomePage() {
  return (
    <PublicLayout>
      <div className="flex flex-col">
        {/* Hero */}
        <section className="border-b">
          <div className="mx-auto max-w-5xl px-6 py-24 lg:py-32">
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground mb-8">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Built for Indian Universities &amp; Colleges
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                University Management,
                <br />
                Reimagined
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
                Automate administrative, admissions, and examination workflows.
                One platform for the complete student lifecycle — from entrance exam to graduation.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button size="lg" asChild>
                  <Link href="/signup">
                    Start Free Trial
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Free for govt colleges</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> No credit card</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Data in India</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b bg-muted/30">
          <div className="mx-auto max-w-5xl px-6 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center justify-center gap-3">
                  <div className="text-muted-foreground">{stat.icon}</div>
                  <div>
                    <div className="text-xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 px-6">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12">
              <h2 className="text-2xl font-bold">Everything You Need</h2>
              <p className="mt-2 text-muted-foreground">
                A comprehensive platform covering every aspect of university administration.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card key={feature.title} className="border-border/50">
                  <CardHeader className="pb-3">
                    <div className="text-muted-foreground mb-1">{feature.icon}</div>
                    <CardTitle className="text-sm font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 px-6 border-y bg-muted/30">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12">
              <h2 className="text-2xl font-bold">Up and Running in Minutes</h2>
              <p className="mt-2 text-muted-foreground">Three simple steps to digitize your institution.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step, i) => (
                <div key={step.step} className="relative">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm mb-3">
                    {step.step}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-4 left-10 right-0 h-px bg-border" />
                  )}
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Modules */}
        <section id="modules" className="py-20 px-6">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12">
              <h2 className="text-2xl font-bold">Modular by Design</h2>
              <p className="mt-2 text-muted-foreground">Start with what you need, expand when ready.</p>
            </div>
            <div className="space-y-2">
              {modules.map((mod) => (
                <div
                  key={mod.number}
                  className="flex items-center gap-4 rounded-lg border border-border/50 px-5 py-4 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-mono text-muted-foreground shrink-0">{mod.number}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold">{mod.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{mod.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust */}
        <section className="py-20 px-6 border-y bg-muted/30">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12">
              <h2 className="text-2xl font-bold">Built for Scale & Security</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <Lock className="h-5 w-5 text-muted-foreground mb-1" />
                  <CardTitle className="text-sm font-semibold">Multi-Tenant Isolation</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">Every institution&apos;s data is completely isolated with row-level security.</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <Globe className="h-5 w-5 text-muted-foreground mb-1" />
                  <CardTitle className="text-sm font-semibold">Data Residency in India</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">All data hosted in India. Meets government compliance requirements.</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <BarChart3 className="h-5 w-5 text-muted-foreground mb-1" />
                  <CardTitle className="text-sm font-semibold">Full Audit Trail</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">Every decision, result entry, and permission change is logged.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold">Ready to Transform Your Institution?</h2>
            <p className="mt-3 text-muted-foreground">
              Join the growing number of Indian universities using Uni-Edge.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
