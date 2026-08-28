'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useCourses } from '@/lib/hooks/useCourses';

const ATTENDANCE_DATA = [
  { course_code: 'CS101', course_name: 'Introduction to Computer Science', total: 24, present: 22, absent: 2, percentage: 91.7 },
  { course_code: 'MA101', course_name: 'Engineering Mathematics I', total: 24, present: 20, absent: 4, percentage: 83.3 },
  { course_code: 'EE101', course_name: 'Basic Electronics', total: 24, present: 21, absent: 3, percentage: 87.5 },
  { course_code: 'HS101', course_name: 'English Communication', total: 16, present: 15, absent: 1, percentage: 93.8 },
  { course_code: 'PH101', course_name: 'Engineering Physics', total: 20, present: 18, absent: 2, percentage: 90.0 },
];

const overallPresent = ATTENDANCE_DATA.reduce((s, a) => s + a.present, 0);
const overallTotal = ATTENDANCE_DATA.reduce((s, a) => s + a.total, 0);
const overallPercent = Math.round((overallPresent / overallTotal) * 100 * 10) / 10;

function getAttendanceStatus(pct: number) {
  if (pct >= 90) return { color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950', icon: CheckCircle2, label: 'Excellent' };
  if (pct >= 75) return { color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950', icon: CheckCircle2, label: 'Good' };
  if (pct >= 60) return { color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950', icon: AlertTriangle, label: 'Warning' };
  return { color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950', icon: XCircle, label: 'Critical' };
}

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground">Track your class attendance across all courses</p>
      </div>

      {/* Overall */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Calendar className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Overall Attendance</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold">{overallPercent}%</p>
                <p className="text-sm text-muted-foreground">{overallPresent}/{overallTotal} classes attended</p>
              </div>
              <Progress value={overallPercent} className="h-2 mt-2 max-w-md" />
            </div>
            <Badge variant={overallPercent >= 75 ? 'default' : 'destructive'} className="text-sm">
              {overallPercent >= 75 ? '✓ Eligible' : '⚠ Shortage'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Per-Course Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Course-wise Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Total Classes</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Absent</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ATTENDANCE_DATA.map(att => {
                const status = getAttendanceStatus(att.percentage);
                const StatusIcon = status.icon;
                return (
                  <TableRow key={att.course_code} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{att.course_name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{att.course_code}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{att.total}</TableCell>
                    <TableCell className="text-center font-medium text-emerald-600">{att.present}</TableCell>
                    <TableCell className="text-center font-medium text-red-600">{att.absent}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={att.percentage} className="h-1.5 w-20" />
                        <span className="text-sm font-medium">{att.percentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className={`${status.color} border-current/20`}>
                        <StatusIcon className="mr-1 h-3 w-3" />{status.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
