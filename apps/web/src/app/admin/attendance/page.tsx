'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAttendance, useMarkAttendance, useBulkMarkAttendance } from '@/lib/hooks';
import { ClipboardCheck, Plus, Download, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';

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
  excused: <AlertTriangle className="h-4 w-4 text-blue-500" />,
};

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [bulkRecords, setBulkRecords] = useState<Array<{ student_id: string; status: string }>>([]);

  const { data: attendanceData, isLoading } = useAttendance({ date: selectedDate });
  const markAttendance = useMarkAttendance();
  const bulkMark = useBulkMarkAttendance();

  const records = attendanceData?.data || [];

  const stats = {
    total: records.length,
    present: records.filter(r => r.status === 'present').length,
    absent: records.filter(r => r.status === 'absent').length,
    late: records.filter(r => r.status === 'late').length,
  };

  const handleBulkSubmit = async () => {
    if (bulkRecords.length === 0) return;
    try {
      await bulkMark.mutateAsync({
        records: bulkRecords.map(r => ({
          student_id: r.student_id,
          program_id: 'c1000000-0000-0000-0000-000000000001',
          date: selectedDate,
          status: r.status,
        })),
      });
      setShowBulkForm(false);
      setBulkRecords([]);
    } catch (err) {
      console.error('Error marking attendance:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">Mark and track student attendance.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> Export</Button>
          <Button size="sm" onClick={() => setShowBulkForm(!showBulkForm)}><Plus className="h-4 w-4 mr-2" /> Mark Attendance</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Records</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Present</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{stats.present}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Absent</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{stats.absent}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Late</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-600">{stats.late}</div></CardContent>
        </Card>
      </div>

      {/* Bulk Mark Form */}
      {showBulkForm && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Mark Attendance</CardTitle>
            <CardDescription>Mark attendance for multiple students at once for {selectedDate}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Date</label>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="block w-48 rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleBulkSubmit} disabled={bulkMark.isPending || bulkRecords.length === 0}>
                {bulkMark.isPending ? 'Saving...' : `Mark ${bulkRecords.length} Students`}
              </Button>
              <Button variant="outline" onClick={() => { setShowBulkForm(false); setBulkRecords([]); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Records */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Attendance Records</CardTitle>
            <CardDescription>
              <div className="flex items-center gap-4 mt-2">
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="rounded-md border border-input bg-background px-3 py-1.5 text-sm" />
              </div>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : records.length === 0 ? (
            <EmptyState title="No attendance records" description="No attendance has been marked for this date." icon={<ClipboardCheck className="h-8 w-8 text-muted-foreground" />} action={{ label: 'Mark Attendance', onClick: () => setShowBulkForm(true) }} />
          ) : (
            <div className="space-y-2">
              {records.map((record) => (
                <div key={record.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    {statusIcons[record.status]}
                    <div>
                      <p className="text-sm font-medium">{record.course_code || '—'}</p>
                      <p className="text-xs text-muted-foreground">Student: {record.student_id.substring(0, 8)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{record.date}</span>
                    <Badge variant="secondary" className={statusColors[record.status]}>
                      {record.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
