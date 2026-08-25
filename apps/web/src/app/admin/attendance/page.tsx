'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/components/data-table/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ClipboardCheck, Plus, Download } from 'lucide-react';
import type { UserRole } from '@uni-edge/types';

// Sample data shape
interface AttendanceRecord {
  id: string;
  date: string;
  student_name: string;
  enrollment_number: string;
  course_code: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  marked_by: string;
}

const statusColors: Record<string, string> = {
  present: 'bg-green-100 text-green-800',
  absent: 'bg-red-100 text-red-800',
  late: 'bg-yellow-100 text-yellow-800',
  excused: 'bg-blue-100 text-blue-800',
};

export default function AttendancePage() {
  const { user } = useUser();
  const role = (user?.publicMetadata?.role as UserRole) || 'staff';
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showBulkForm, setShowBulkForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">Mark and track student attendance.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {role !== 'student' && (
            <Button size="sm" onClick={() => setShowBulkForm(!showBulkForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Mark Attendance
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">—</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">—</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Attendance %</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>
            <div className="flex gap-4 mt-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="block w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Course</label>
                <input
                  type="text"
                  placeholder="Course code"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="block w-40 rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                />
              </div>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No attendance records"
            description="Start marking attendance for your classes. Records will appear here."
            icon={<ClipboardCheck className="h-8 w-8 text-muted-foreground" />}
            action={
              role !== 'student' ? (
                <Button onClick={() => setShowBulkForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Mark Attendance
                </Button>
              ) : undefined
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
