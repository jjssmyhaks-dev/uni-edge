'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  GraduationCap,
  ClipboardList,
  FileText,
  Bell,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowUpRight,
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
import type { UserRole } from '@uni-edge/types';

const monthlyData = [
  { month: 'Jan', students: 120, applications: 45, exams: 8 },
  { month: 'Feb', students: 135, applications: 62, exams: 12 },
  { month: 'Mar', students: 148, applications: 78, exams: 10 },
  { month: 'Apr', students: 162, applications: 95, exams: 15 },
  { month: 'May', students: 180, applications: 110, exams: 18 },
  { month: 'Jun', students: 195, applications: 88, exams: 22 },
];

const attendanceData = [
  { day: 'Mon', rate: 92 },
  { day: 'Tue', rate: 88 },
  { day: 'Wed', rate: 95 },
  { day: 'Thu', rate: 90 },
  { day: 'Fri', rate: 85 },
  { day: 'Sat', rate: 78 },
];

const recentActivity = [
  { action: 'New application received', detail: 'B.Tech Computer Science', time: '2 min ago' },
  { action: 'Exam results published', detail: 'Semester 4 — Mathematics', time: '1 hour ago' },
  { action: 'Student enrollment confirmed', detail: 'Rahul Sharma — Roll #2024CS015', time: '3 hours ago' },
  { action: 'Notice published', detail: 'Mid-semester exam schedule', time: '5 hours ago' },
  { action: 'Attendance marked', detail: 'B.Tech CS — Section A', time: 'Yesterday' },
];

const upcomingExams = [
  { name: 'Mid-Term — Data Structures', date: 'Sep 12, 2026', time: '10:00 AM', students: 68 },
  { name: 'Mid-Term — Operating Systems', date: 'Sep 14, 2026', time: '2:00 PM', students: 65 },
  { name: 'End-Term — Engineering Math', date: 'Sep 22, 2026', time: '9:00 AM', students: 120 },
];

export default function AdminDashboardPage() {
  const { user } = useUser();
  const role = (user?.publicMetadata?.role as UserRole) || 'staff';
  const displayName = user?.firstName || user?.lastName
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : 'Admin';

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
          { title: 'Total Students', value: '195', change: '+12%', trend: 'up' as const, subtitle: 'vs last month' },
          { title: 'Active Programs', value: '12', change: '+2', trend: 'up' as const, subtitle: 'across departments' },
          { title: 'Applications', value: '88', change: '-8%', trend: 'down' as const, subtitle: 'this cycle' },
          { title: 'Upcoming Exams', value: '6', change: '', trend: 'up' as const, subtitle: 'next 30 days' },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                {stat.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}>{stat.change}</span>
                <span className="text-muted-foreground">{stat.subtitle}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Enrollment Trend */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Enrollment Trend</CardTitle>
            <CardDescription>Monthly students and applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
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
                    dataKey="students"
                    stroke="#1e293b"
                    fill="#1e293b"
                    fillOpacity={0.08}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.05}
                    strokeWidth={1.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Attendance */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Weekly Attendance</CardTitle>
            <CardDescription>Average attendance rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
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
        {/* Upcoming Exams */}
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
            {upcomingExams.map((exam) => (
              <div key={exam.name} className="flex items-start gap-3 rounded-lg border p-3">
                <div className="flex items-center justify-center w-8 h-8 rounded bg-muted shrink-0">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{exam.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {exam.date} · {exam.time} · {exam.students} students
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <CardDescription className="text-xs">Latest actions across the platform</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-0">
            {recentActivity.map((activity, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-3 border-b last:border-0"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted shrink-0">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground truncate">{activity.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
