'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  BookOpen, Award, Calendar, IndianRupee, Clock, Bell,
  TrendingUp, FileText, ChevronRight, CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { useCourses } from '@/lib/hooks/useCourses';
import { useGrades, calculateCGPA } from '@/lib/hooks/useGrades';
import { useAssignments } from '@/lib/hooks/useAssignments';
import { useExams } from '@/lib/hooks/useExams';
import { useFees } from '@/lib/hooks/useFees';
import { useNotifications } from '@/lib/hooks/useNotifications';

export default function StudentDashboard() {
  const { data: courses = [] } = useCourses();
  const { data: grades = [] } = useGrades();
  const { data: assignments = [] } = useAssignments();
  const { data: exams = [] } = useExams();
  const { data: fees = [] } = useFees();
  const { data: notifications = [] } = useNotifications();

  const cgpa = calculateCGPA(grades);
  const pendingAssignments = assignments.filter(a => a.status === 'pending').length;
  const pendingFees = fees.filter(f => f.status === 'pending' || f.status === 'overdue');
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const stats = [
    { label: 'Enrolled Courses', value: courses.length, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
    { label: 'Current CGPA', value: cgpa.toFixed(2), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950' },
    { label: 'Pending Assignments', value: pendingAssignments, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950' },
    { label: 'Upcoming Exams', value: exams.filter(e => e.status === 'upcoming').length, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s your academic overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Current Courses */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Current Courses</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/courses">View All <ChevronRight className="h-4 w-4 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {courses.slice(0, 4).map((course) => (
                <div key={course.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary font-bold text-xs">
                      {course.course_code.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{course.course_name}</p>
                      <p className="text-xs text-muted-foreground">{course.instructor} · {course.schedule}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{course.credits} credits</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Notifications</CardTitle>
            <Badge variant="secondary" className="text-xs">{unreadNotifications} new</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notif) => (
                <div key={notif.id} className={`rounded-lg border p-3 ${!notif.read ? 'bg-primary/5' : ''}`}>
                  <div className="flex items-start gap-2">
                    <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${!notif.read ? 'bg-primary' : 'bg-muted'}`} />
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{notif.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notif.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(notif.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Exams */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Upcoming Exams</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/exams">View All <ChevronRight className="h-4 w-4 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exams.filter(e => e.status === 'upcoming').slice(0, 3).map((exam) => (
                <div key={exam.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-purple-50 dark:bg-purple-950 text-purple-600">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{exam.course_code} — {exam.type.charAt(0).toUpperCase() + exam.type.slice(1)}</p>
                      <p className="text-xs text-muted-foreground">{exam.date} · {exam.time}</p>
                    </div>
                  </div>
                  {exam.hall_ticket_available && (
                    <Button variant="outline" size="sm" className="text-xs">Hall Ticket</Button>
                  )}
                </div>
              ))}
              {exams.filter(e => e.status === 'upcoming').length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No upcoming exams</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fee Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Fee Status</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/fees">View All <ChevronRight className="h-4 w-4 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fees.slice(0, 4).map((fee) => (
                <div key={fee.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium text-sm">{fee.fee_type}</p>
                    <p className="text-xs text-muted-foreground">Due: {fee.due_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">₹{fee.amount.toLocaleString('en-IN')}</p>
                    <Badge
                      variant={fee.status === 'paid' ? 'default' : fee.status === 'overdue' ? 'destructive' : 'secondary'}
                      className="text-[10px]"
                    >
                      {fee.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/registration"><Calendar className="h-4 w-4 mr-2" />Semester Registration</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/documents"><FileText className="h-4 w-4 mr-2" />Request Document</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/grades"><Award className="h-4 w-4 mr-2" />View Transcript</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/profile"><Bell className="h-4 w-4 mr-2" />Update Profile</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
