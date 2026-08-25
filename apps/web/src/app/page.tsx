'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Zap,
  Globe,
  Lock,
} from 'lucide-react';

const features = [
  { icon: <GraduationCap className="h-6 w-6" />, title: 'Smart Admissions', description: 'Automate entrance exams, merit list generation, and enrollment workflows with AI-powered document parsing.', color: 'bg-blue-500/10 text-blue-600' },
  { icon: <ClipboardList className="h-6 w-6" />, title: 'Exam Management', description: 'Schedule exams, auto-allocate rooms, assign invigilators, and manage results — all in one place.', color: 'bg-purple-500/10 text-purple-600' },
  { icon: <Camera className="h-6 w-6" />, title: 'Online Proctoring', description: 'AI-powered exam proctoring with face detection, tab-switch monitoring, and automated flagging.', color: 'bg-orange-500/10 text-orange-600' },
  { icon: <Users className="h-6 w-6" />, title: 'Student Portal', description: 'Students can view schedules, download hall tickets, track attendance, and access results.', color: 'bg-green-500/10 text-green-600' },
  { icon: <FileCheck className="h-6 w-6" />, title: 'Document Management', description: 'Upload, verify, and manage transcripts, certificates, and other academic documents with AI parsing.', color: 'bg-cyan-500/10 text-cyan-600' },
  { icon: <Bell className="h-6 w-6" />, title: 'Notice System', description: 'Publish notices to students, faculty, or departments. In-app, email, and SMS delivery.', color: 'bg-yellow-500/10 text-yellow-600' },
  { icon: <BarChart3 className="h-6 w-6" />, title: 'Analytics & Reports', description: 'Real-time dashboards, attendance analytics, exam performance, and audit trails.', color: 'bg-indigo-500/10 text-indigo-600' },
  { icon: <Shield className="h-6 w-6" />, title: 'Enterprise Security', description: 'Multi-tenant isolation, role-based access, full audit logging, and encrypted data.', color: 'bg-red-500/10 text-red-600' },
];

const modules = [
  { number: '01', title: 'Pre-Admission & Entrance', description: 'Configure programs, seats, eligibility criteria. Set up entrance exams with online/offline modes. Auto-generate merit lists.', icon: <BookOpen className="h-5 w-5" /> },
  { number: '02', title: 'Admission & Enrollment', description: 'Public application forms, AI-powered document verification, offer letters, and auto student account creation.', icon: <FileCheck className="h-5 w-5" /> },
  { number: '03', title: 'Academic Administration', description: 'Attendance tracking, student records, notices, and document request workflows.', icon: <Users className="h-5 w-5" /> },
  { number: '04', title: 'Regular Examinations', description: 'Exam scheduling, room allocation, hall tickets, invigilator management, and result publishing.', icon: <ClipboardList className="h-5 w-5" /> },
  { number: '05', title: 'Online Proctoring', description: 'Browser lockdown, webcam monitoring, anti-cheating detection, and human review queue.', icon: <Camera className="h-5 w-5" /> },
];

const steps = [
  { step: '1', title: 'Register Institution', description: 'Sign up and configure your institution, departments, and academic programs.' },
  { step: '2', title: 'Set Up Admissions', description: 'Configure admission cycles, eligibility criteria, and entrance exams.' },
  { step: '3', title: 'Manage Students', description: 'Track attendance, schedule exams, and publish results — all from one dashboard.' },
];

const stats = [
  { value: '10+', label: 'Institutions', icon: <Building2 className="h-5 w-5" /> },
  { value: '50+', label: 'Programs Managed', icon: <GraduationCap className="h-5 w-5" /> },
  { value: '99.9%', label: 'Uptime', icon: <Clock className="h-5 w-5" /> },
  { value: '24/7', label: 'Support', icon: <Zap className="h-5 w-5" /> },
];

export default function HomePage() {
  return (
    <PublicLayout>
      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
            <div className="flex flex-col items-center text-center">
              <Badge variant="secondary" className="mb-6">
                <Zap className="h-3 w-3 mr-1" />
                Built for Indian Universities &amp; Colleges
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                University Management,
                <br />
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Reimagined
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
                Uni-Edge automates administrative, admissions, and examination workflows
                for universities and colleges. One platform for the complete student lifecycle —
                from entrance exam to graduation.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="text-base px-8">
                  <Link href="/signup">
                    Start Free Trial
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base px-8">
                  <Link href="/login">Sign In to Dashboard</Link>
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> Free for government colleges</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> No credit card required</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> Data hosted in India</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="border-y bg-card">
          <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center justify-center gap-3">
                  <div className="text-primary">{stat.icon}</div>
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 px-6">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">Features</Badge>
              <h2 className="text-3xl font-bold sm:text-4xl">Everything You Need</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                A comprehensive platform covering every aspect of university administration, from admissions to examinations.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card key={feature.title} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className={`inline-flex items-center justify-center rounded-lg p-2.5 ${feature.color} mb-2`}>{feature.icon}</div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent><CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription></CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 px-6 bg-muted/50">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">How It Works</Badge>
              <h2 className="text-3xl font-bold sm:text-4xl">Up and Running in Minutes</h2>
              <p className="mt-4 text-lg text-muted-foreground">Three simple steps to digitize your institution.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step, i) => (
                <div key={step.step} className="relative">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg mb-4">{step.step}</div>
                  {i < steps.length - 1 && <div className="hidden md:block absolute top-6 left-14 right-0 h-0.5 bg-border" />}
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Modules */}
        <section id="modules" className="py-24 px-6">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">Modules</Badge>
              <h2 className="text-3xl font-bold sm:text-4xl">Modular by Design</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Each module works independently or together. Start with what you need, expand when ready.</p>
            </div>
            <div className="space-y-4">
              {modules.map((mod) => (
                <Card key={mod.number} className="group hover:shadow-md transition-all">
                  <CardContent className="flex items-center gap-6 p-6">
                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary font-bold text-lg shrink-0">{mod.number}</div>
                    <div className="flex-1"><h3 className="text-lg font-semibold">{mod.title}</h3><p className="text-sm text-muted-foreground mt-1">{mod.description}</p></div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-24 px-6 bg-muted/50">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">Why Uni-Edge</Badge>
              <h2 className="text-3xl font-bold sm:text-4xl">Built for Scale & Security</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <Card>
                <CardHeader><div className="inline-flex items-center justify-center rounded-lg p-2.5 bg-green-500/10 text-green-600 mb-2"><Lock className="h-6 w-6" /></div><CardTitle>Multi-Tenant Isolation</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">Every institution&apos;s data is completely isolated. Row-level security ensures no cross-institution data leakage.</p></CardContent>
              </Card>
              <Card>
                <CardHeader><div className="inline-flex items-center justify-center rounded-lg p-2.5 bg-blue-500/10 text-blue-600 mb-2"><Globe className="h-6 w-6" /></div><CardTitle>Data Residency in India</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">All data is hosted on servers in India. Meets government compliance requirements for educational institutions.</p></CardContent>
              </Card>
              <Card>
                <CardHeader><div className="inline-flex items-center justify-center rounded-lg p-2.5 bg-purple-500/10 text-purple-600 mb-2"><BarChart3 className="h-6 w-6" /></div><CardTitle>Full Audit Trail</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">Every admission decision, result entry, and permission change is logged. Complete transparency for compliance.</p></CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Ready to Transform Your Institution?</h2>
            <p className="mt-4 text-lg text-muted-foreground">Join the growing number of Indian universities and colleges using Uni-Edge to digitize their operations.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-base px-8"><Link href="/signup">Get Started Free<ArrowRight className="h-4 w-4 ml-1" /></Link></Button>
              <Button size="lg" variant="outline" asChild className="text-base px-8"><Link href="/login">Sign In</Link></Button>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
