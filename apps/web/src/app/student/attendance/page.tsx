'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ClipboardCheck, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';

const attendanceData = [
  { course: 'CS301 — Data Structures', total: 20, present: 17, absent: 2, late: 1, percentage: 85 },
  { course: 'CS302 — Operating Systems', total: 18, present: 16, absent: 1, late: 1, percentage: 89 },
  { course: 'CS303 — Computer Networks', total: 15, present: 14, absent: 0, late: 1, percentage: 93 },
  { course: 'CS304 — Database Systems', total: 16, present: 12, absent: 3, late: 1, percentage: 75 },
];

const recentRecords = [
  { date: 'Aug 22, 2025', course: 'CS301', status: 'present' },
  { date: 'Aug 22, 2025', course: 'CS302', status: 'present' },
  { date: 'Aug 21, 2025', course: 'CS301', status: 'present' },
  { date: 'Aug 21, 2025', course: 'CS302', status: 'late' },
  { date: 'Aug 20, 2025', course: 'CS301', status: 'present' },
  { date: 'Aug 20, 2025', course: 'CS302', status: 'present' },
];

const statusColors: Record<string, string> = {
  present: 'bg-green-500/10 text-green-600',
  absent: 'bg-red-500/10 text-red-600',
  late: 'bg-yellow-500/10 text-yellow-600',
  excused: 'bg-blue-500/10 text-blue-600',
};

const statusIcons: Record<string, React.ReactNode> = {
  present: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  absent: <XCircle className="h-4 w-4 text-red-500" />,
  late: <Clock className="h-4 w-4 text-yellow-500" />,
};

export default function StudentAttendancePage() {
  const totalClasses = attendanceData.reduce((acc, c) => acc + c.total, 0);
  const totalPresent = attendanceData.reduce((acc, c) => acc + c.present, 0);
  const overallPercentage = Math.round((totalPresent / totalClasses) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Attendance</h1>
        <p className="text-muted-foreground">Track your attendance across all courses.</p>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallPercentage}%</div>
            <Progress value={overallPercentage} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalPresent}</div>
            <p className="text-xs text-muted-foreground">of {totalClasses} classes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{attendanceData.reduce((acc, c) => acc + c.absent, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Attendance?</CardTitle>
          </CardHeader>
          <CardContent>
            {overallPercentage < 75 ? (
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm font-medium">Warning</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Good Standing</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Course-wise Attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Course-wise Attendance</CardTitle>
          <CardDescription>Attendance breakdown by course</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {attendanceData.map((course) => (
              <div key={course.course}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{course.course}</span>
                  <Badge variant={course.percentage >= 75 ? 'secondary' : 'destructive'} className={
                    course.percentage >= 75 ? 'bg-green-500/10 text-green-600' : ''
                  }>
                    {course.percentage}%
                  </Badge>
                </div>
                <Progress value={course.percentage} className="h-2" />
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Present: {course.present}</span>
                  <span>Absent: {course.absent}</span>
                  <span>Late: {course.late}</span>
                  <span>Total: {course.total}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Records */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentRecords.map((record, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {statusIcons[record.status]}
                  <div>
                    <p className="text-sm font-medium">{record.course}</p>
                    <p className="text-xs text-muted-foreground">{record.date}</p>
                  </div>
                </div>
                <Badge variant="secondary" className={statusColors[record.status]}>
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
