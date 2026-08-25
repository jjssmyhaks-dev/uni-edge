'use client';

import { useUser } from '@clerk/nextjs';
import { useEntranceExams } from '@/lib/hooks/useEntranceExams';
import { useRegularExams } from '@/lib/hooks/useRegularExams';
import { useAttendance } from '@/lib/hooks/useAttendance';
import { useNotices } from '@/lib/hooks/useNotices';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  FileText,
  Award,
  Bell,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboardPage() {
  const { user } = useUser();
  const { data: entranceData, isLoading: entranceLoading } = useEntranceExams();
  const { data: regularData, isLoading: regLoading } = useRegularExams();
  const { data: attendanceData, isLoading: attendanceLoading } = useAttendance();
  const { data: noticesData, isLoading: noticesLoading } = useNotices();

  const isLoading = entranceLoading || regLoading || attendanceLoading || noticesLoading;
  const entranceExams = entranceData?.data || [];
  const regularExams = regularData?.data || [];
  const attendanceRecords = attendanceData?.data || [];
  const notices = noticesData?.data || [];

  const upcomingExams = [...entranceExams, ...regularExams]
    .filter(e => new Date(e.exam_date || '').getTime() > Date.now())
    .slice(0, 3);

  const attendancePercentage = attendanceRecords.length > 0
    ? Math.round((attendanceRecords.filter(r => r.status === 'present').length / attendanceRecords.length) * 100)
    : 0;

  const recentNotices = notices.slice(0, 3);
  const displayName = user?.firstName || user?.lastName
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : 'Student';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {displayName}</h1>
        <p className="text-sm text-muted-foreground mt-1">Here&apos;s your academic overview</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Attendance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '—' : `${attendancePercentage}%`}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {attendancePercentage >= 75 ? 'On track' : attendancePercentage > 0 ? 'Below 75% threshold' : 'No data'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Exams</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '—' : upcomingExams.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Next 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Results</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">No results yet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Notices</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '—' : recentNotices.length}</div>
            <p className="text-xs text-muted-foreground mt-1">New announcements</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Upcoming Exams */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
              <CardDescription className="text-xs">Your scheduled examinations</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/student/exams" className="text-xs">
                View all <ArrowUpRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="text-center py-6 text-sm text-muted-foreground">Loading...</div>
            ) : upcomingExams.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">No upcoming exams</div>
            ) : (
              upcomingExams.map((exam) => (
                <div key={exam.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded bg-muted shrink-0">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{exam.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(exam.exam_date || '').toLocaleDateString('en-IN', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                      {exam.duration_minutes ? ` · ${exam.duration_minutes} min` : ''}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Notices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium">Notices</CardTitle>
              <CardDescription className="text-xs">Latest announcements</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/student/notices" className="text-xs">
                View all <ArrowUpRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentNotices.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">No notices</div>
            ) : (
              recentNotices.map((notice) => (
                <div key={notice.id} className="border-b pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-medium">{notice.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notice.content}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {new Date(notice.created_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links + Attendance */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'Hall Tickets', href: '/student/hall-tickets', icon: <FileText className="h-4 w-4" /> },
              { label: 'Results', href: '/student/results', icon: <Award className="h-4 w-4" /> },
              { label: 'Attendance', href: '/student/attendance', icon: <Clock className="h-4 w-4" /> },
              { label: 'Documents', href: '/student/documents', icon: <FileText className="h-4 w-4" /> },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-2 rounded-lg border border-border/60 p-3 text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                <span className="text-muted-foreground">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Attendance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{attendancePercentage}%</span>
                  <span className="text-sm text-muted-foreground">overall</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-3">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      attendancePercentage >= 75 ? 'bg-emerald-500' : attendancePercentage > 0 ? 'bg-amber-500' : 'bg-muted'
                    }`}
                    style={{ width: `${attendancePercentage}%` }}
                  />
                </div>
                {attendancePercentage < 75 && attendancePercentage > 0 && (
                  <p className="text-xs text-amber-600 mt-2">Below 75% minimum requirement</p>
                )}
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/student/attendance">View Detailed Report</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
