'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ClipboardList,
  Bell,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowUpRight,
  Users,
  GraduationCap,
  FileText,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useDashboardStats } from '@/lib/hooks/useDashboardStats';
import type { UserRole } from '@uni-edge/types';

const fallbackEnrollment = [
  { month: 'Jan', count: 10 },
  { month: 'Feb', count: 15 },
  { month: 'Mar', count: 22 },
  { month: 'Apr', count: 30 },
  { month: 'May', count: 35 },
  { month: 'Jun', count: 42 },
];

const fallbackAttendance = [
  { day: 'Mon', rate: 92 },
  { day: 'Tue', rate: 88 },
  { day: 'Wed', rate: 95 },
  { day: 'Thu', rate: 90 },
  { day: 'Fri', rate: 85 },
  { day: 'Sat', rate: 78 },
];

export default function AdminDashboardPage() {
  const { user } = useUser();
  const { data: statsData, isLoading } = useDashboardStats();
  const stats = statsData?.data;

  const displayName = user?.firstName || user?.lastName
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : 'Admin';

  const enrollmentTrend = stats?.enrollmentTrend?.length ? stats.enrollmentTrend : fallbackEnrollment;
  const attendanceTrend = stats?.attendanceTrend?.length ? stats.attendanceTrend : fallbackAttendance;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening at your institution today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/exams/entrance/new">
              <ClipboardList className="h-4 w-4 mr-1.5" />
              New Exam
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/notices">
              <Bell className="h-4 w-4 mr-1.5" />
              Post Notice
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'Total Students',
            value: isLoading ? '—' : String(stats?.totalStudents ?? 0),
            icon: <Users className="h-4 w-4" />,
            change: stats?.studentsThisMonth ? `+${stats.studentsThisMonth} this month` : '',
            trend: 'up' as const,
          },
          {
            title: 'Active Programs',
            value: isLoading ? '—' : String(stats?.activePrograms ?? 0),
            icon: <GraduationCap className="h-4 w-4" />,
            change: 'Across departments',
            trend: 'up' as const,
          },
          {
            title: 'Applications',
            value: isLoading ? '—' : String(stats?.totalApplications ?? 0),
            icon: <FileText className="h-4 w-4" />,
            change: stats?.pendingReview ? `${stats.pendingReview} pending review` : 'No applications yet',
            trend: 'up' as const,
          },
          {
            title: 'Upcoming Exams',
            value: isLoading ? '—' : String(stats?.upcomingExamCount ?? 0),
            icon: <Calendar className="h-4 w-4" />,
            change: 'Next 30 days',
            trend: 'up' as const,
          },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <span className="text-muted-foreground">{stat.icon}</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.change && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {stat.change}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Enrollment Trend</CardTitle>
            <CardDescription>Student enrollment over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={enrollmentTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" className="text-xs" tickLine={false} axisLine={false} />
                  <YAxis className="text-xs" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#1e293b"
                    fill="#1e293b"
                    fillOpacity={0.08}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Weekly Attendance</CardTitle>
            <CardDescription>Average attendance rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" className="text-xs" tickLine={false} axisLine={false} />
                  <YAxis className="text-xs" tickLine={false} axisLine={false} domain={[60, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [`${value}%`, 'Attendance']}
                  />
                  <Bar dataKey="rate" fill="#1e293b" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
              <CardDescription className="text-xs">Next scheduled exams</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/exams/entrance" className="text-xs">
                View all
                <ArrowUpRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats?.upcomingExams?.length ? (
              stats.upcomingExams.map((exam) => (
                <div key={exam.name} className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded bg-muted shrink-0">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{exam.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(exam.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No upcoming exams
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Quick Links</CardTitle>
            <CardDescription className="text-xs">Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Create Exam', href: '/admin/exams/entrance/new', icon: <ClipboardList className="h-4 w-4" /> },
                { label: 'Manage Programs', href: '/admin/programs', icon: <GraduationCap className="h-4 w-4" /> },
                { label: 'Mark Attendance', href: '/admin/attendance', icon: <Calendar className="h-4 w-4" /> },
                { label: 'Post Notice', href: '/admin/notices', icon: <Bell className="h-4 w-4" /> },
                { label: 'Review Applications', href: '/admin/applications', icon: <FileText className="h-4 w-4" /> },
                { label: 'Proctoring', href: '/admin/exams/proctoring', icon: <Clock className="h-4 w-4" /> },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-2 rounded-lg border border-border/60 p-3 text-sm font-medium hover:bg-muted/50 transition-colors"
                >
                  <span className="text-muted-foreground">{action.icon}</span>
                  {action.label}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
