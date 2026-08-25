'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  ClipboardCheck,
  FileText,
  Bell,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  GraduationCap,
  BookOpen,
  TrendingUp,
} from 'lucide-react';

const stats = [
  { title: 'Attendance', value: '—%', icon: <ClipboardCheck className="h-5 w-5 text-green-500" />, description: 'This semester' },
  { title: 'Upcoming Exams', value: '—', icon: <Calendar className="h-5 w-5 text-blue-500" />, description: 'Next 30 days' },
  { title: 'Results', value: '—', icon: <TrendingUp className="h-5 w-5 text-purple-500" />, description: 'Published' },
  { title: 'Documents', value: '—', icon: <FileText className="h-5 w-5 text-orange-500" />, description: 'Pending requests' },
];

const upcomingExams = [
  { name: 'CS301 — Data Structures', date: 'Dec 10, 2025', time: '9:00 AM', duration: '3 hours', hallTicket: true },
  { name: 'CS302 — Operating Systems', date: 'Dec 12, 2025', time: '2:00 PM', duration: '3 hours', hallTicket: true },
  { name: 'CS303 — Computer Networks', date: 'Dec 15, 2025', time: '9:00 AM', duration: '3 hours', hallTicket: false },
];

const recentResults = [
  { exam: 'CS201 — Mid-Term', marks: '42/50', grade: 'A', status: 'published' },
  { exam: 'CS202 — Quiz 3', marks: '18/20', grade: 'O', status: 'published' },
];

const notices = [
  { title: 'Mid-Semester Exam Schedule Released', date: 'Aug 20', audience: 'all' },
  { title: 'Library Hours Extended During Exams', date: 'Aug 19', audience: 'students' },
];

export default function StudentDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your academic overview at a glance.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/student/attendance">
              <ClipboardCheck className="h-4 w-4 mr-2" />
              View Attendance
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/student/results">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Results
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Exams */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Upcoming Exams</CardTitle>
              <CardDescription>Your scheduled examinations</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/student/exams">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingExams.map((exam, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{exam.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {exam.date} • {exam.time} • {exam.duration}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {exam.hallTicket ? (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Hall Ticket
                      </Button>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Results */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentResults.map((result, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{result.exam}</p>
                      <p className="text-xs text-muted-foreground">{result.marks}</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600">{result.grade}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notices */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notices.map((notice, i) => (
                  <div key={i} className="border-b pb-2 last:border-0 last:pb-0">
                    <p className="text-sm font-medium">{notice.title}</p>
                    <p className="text-xs text-muted-foreground">{notice.date}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Download Hall Ticket', icon: <Download className="h-4 w-4" />, href: '/student/hall-tickets' },
              { label: 'View Attendance', icon: <ClipboardCheck className="h-4 w-4" />, href: '/student/attendance' },
              { label: 'Request Document', icon: <FileText className="h-4 w-4" />, href: '/student/documents' },
              { label: 'View Notices', icon: <Bell className="h-4 w-4" />, href: '/student/notices' },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-2 rounded-lg border p-3 text-sm font-medium hover:bg-accent transition-colors"
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
