'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useAttendance, type AttendanceRecord } from '@/lib/hooks/useStudentData';

function getAttendanceStatus(pct: number) {
  if (pct >= 90) return { color: 'text-emerald-600', icon: CheckCircle2, label: 'Excellent' };
  if (pct >= 75) return { color: 'text-blue-600', icon: CheckCircle2, label: 'Good' };
  if (pct >= 60) return { color: 'text-amber-600', icon: AlertTriangle, label: 'Warning' };
  return { color: 'text-red-600', icon: XCircle, label: 'Critical' };
}

export default function AttendancePage() {
  const { data: records = [], isLoading } = useAttendance();

  const overallPresent = records.reduce((s, r) => s + r.present, 0);
  const overallTotal = records.reduce((s, r) => s + r.total_classes, 0);
  const overallPercent = overallTotal > 0 ? Math.round((overallPresent / overallTotal) * 100 * 10) / 10 : 0;

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
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
          ) : records.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Calendar className="mx-auto mb-3 h-10 w-10 opacity-30" />
              <p>No attendance records yet</p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">Present</TableHead>
                      <TableHead className="text-center">Absent</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map(rec => {
                      const status = getAttendanceStatus(rec.percentage);
                      const StatusIcon = status.icon;
                      return (
                        <TableRow key={rec.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div>
                              <p className="font-medium">{rec.course_name}</p>
                              <p className="text-xs text-muted-foreground font-mono">{rec.course_code}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{rec.total_classes}</TableCell>
                          <TableCell className="text-center font-medium text-emerald-600">{rec.present}</TableCell>
                          <TableCell className="text-center font-medium text-red-600">{rec.absent}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={rec.percentage} className="h-1.5 w-20" />
                              <span className="text-sm font-medium">{rec.percentage}%</span>
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
              </div>
              {/* Mobile */}
              <div className="space-y-3 md:hidden">
                {records.map(rec => {
                  const status = getAttendanceStatus(rec.percentage);
                  const StatusIcon = status.icon;
                  return (
                    <div key={rec.id} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{rec.course_name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{rec.course_code}</p>
                        </div>
                        <Badge variant="outline" className={`text-xs ${status.color}`}>
                          <StatusIcon className="mr-1 h-3 w-3" />{status.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Present: <span className="font-medium text-emerald-600">{rec.present}</span></span>
                        <span>Absent: <span className="font-medium text-red-600">{rec.absent}</span></span>
                        <span className="ml-auto font-medium">{rec.percentage}%</span>
                      </div>
                      <Progress value={rec.percentage} className="h-1.5 mt-2" />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
