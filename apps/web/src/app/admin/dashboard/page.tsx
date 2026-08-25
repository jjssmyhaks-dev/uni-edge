'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  GraduationCap,
  ClipboardList,
  FileText,
  ArrowRight,
  BookOpen,
  Bell,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { UserRole } from '@uni-edge/types';

const stats = [
  {
    title: 'Total Students',
    value: '—',
    change: '+12 this month',
    icon: <Users className="h-5 w-5" />,
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    title: 'Active Programs',
    value: '—',
    change: 'Across departments',
    icon: <GraduationCap className="h-5 w-5" />,
    color: 'bg-purple-500/10 text-purple-600',
  },
  {
    title: 'Applications',
    value: '—',
    change: 'This cycle',
    icon: <FileText className="h-5 w-5" />,
    color: 'bg-green-500/10 text-green-600',
  },
  {
    title: 'Upcoming Exams',
    value: '—',
    change: 'Next 30 days',
    icon: <ClipboardList className="h-5 w-5" />,
    color: 'bg-orange-500/10 text-orange-600',
  },
];

const quickActions = [
  { label: 'Create Exam', href: '/admin/exams/entrance/new', icon: <ClipboardList className="h-4 w-4" />, color: 'text-blue-600' },
  { label: 'New Program', href: '/admin/programs', icon: <GraduationCap className="h-4 w-4" />, color: 'text-purple-600' },
  { label: 'Mark Attendance', href: '/admin/attendance', icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-green-600' },
  { label: 'Post Notice', href: '/admin/notices', icon: <Bell className="h-4 w-4" />, color: 'text-yellow-600' },
  { label: 'Review Applications', href: '/admin/admissions/applications', icon: <FileText className="h-4 w-4" />, color: 'text-indigo-600' },
  { label: 'Proctoring', href: '/admin/exams/proctoring', icon: <AlertCircle className="h-4 w-4" />, color: 'text-red-600' },
];

const recentActivity = [
  { action: 'New application received', time: '2 minutes ago', type: 'application' },
  { action: 'Exam results published', time: '1 hour ago', type: 'result' },
  { action: 'Student enrollment confirmed', time: '3 hours ago', type: 'enrollment' },
  { action: 'Notice published to all students', time: '5 hours ago', type: 'notice' },
];

const activityIcons: Record<string, React.ReactNode> = {
  application: <FileText className="h-4 w-4 text-blue-500" />,
  result: <ClipboardList className="h-4 w-4 text-green-500" />,
  enrollment: <Users className="h-4 w-4 text-purple-500" />,
  notice: <Bell className="h-4 w-4 text-yellow-500" />,
};

export default function AdminDashboardPage() {
  const { user } = useUser();
  const role = (user?.publicMetadata?.role as UserRole) || 'staff';

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.firstName || 'Admin'} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening at your institution today.
            <Badge variant="secondary" className="ml-2 text-xs">
              {role.replace(/_/g, ' ')}
            </Badge>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/exams/entrance/new">
              <ClipboardList className="h-4 w-4 mr-2" />
              New Exam
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/notices">
              <Bell className="h-4 w-4 mr-2" />
              Post Notice
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common tasks for your role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-2 rounded-lg border p-3 text-sm font-medium hover:bg-accent transition-colors"
                >
                  <span className={action.color}>{action.icon}</span>
                  {action.label}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Latest actions across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                    {activityIcons[activity.type]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Module Status</CardTitle>
          <CardDescription>Overview of all active modules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Entrance Exams', status: 'active', href: '/admin/exams/entrance', icon: <ClipboardList className="h-4 w-4" /> },
              { name: 'Admissions', status: 'active', href: '/admin/admissions', icon: <FileText className="h-4 w-4" /> },
              { name: 'Regular Exams', status: 'active', href: '/admin/exams/regular', icon: <Calendar className="h-4 w-4" /> },
              { name: 'Attendance', status: 'active', href: '/admin/attendance', icon: <CheckCircle2 className="h-4 w-4" /> },
              { name: 'Proctoring', status: 'active', href: '/admin/exams/proctoring', icon: <AlertCircle className="h-4 w-4" /> },
              { name: 'Document Requests', status: 'active', href: '/admin/document-requests', icon: <BookOpen className="h-4 w-4" /> },
            ].map((mod) => (
              <Link
                key={mod.name}
                href={mod.href}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  {mod.icon}
                  <span className="text-sm font-medium">{mod.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600">
                  {mod.status}
                </Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
