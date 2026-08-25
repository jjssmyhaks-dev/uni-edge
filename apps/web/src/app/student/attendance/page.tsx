'use client';

import { useState } from 'react';
import { useAttendance } from '@/lib/hooks/useAttendance';
import type { AttendanceRecord } from '@/lib/hooks/useAttendance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download,
  AlertTriangle,
  Calendar,
  Loader2,
  TrendingUp
} from 'lucide-react';

export default function StudentAttendancePage() {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  
  const { data: attendanceData, isLoading } = useAttendance();
  const records: AttendanceRecord[] = attendanceData?.data || [];

  const totalClasses = records.length;
  const presentClasses = records.filter(r => r.status === 'present').length;
  const absentClasses = records.filter(r => r.status === 'absent').length;
  const lateClasses = records.filter(r => r.status === 'late').length;
  const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

  const filteredRecords = records.filter(r => !selectedMonth || r.date?.startsWith(selectedMonth));

  const groupedByDate: Record<string, AttendanceRecord[]> = {};
  filteredRecords.forEach(record => {
    const date = record.date || 'Unknown';
    if (!groupedByDate[date]) groupedByDate[date] = [];
    groupedByDate[date].push(record);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
          <p className="text-gray-600 mt-1">Track your attendance across all courses</p>
        </div>
        <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export Report</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-sm text-gray-500">Present</p><p className="text-2xl font-bold text-gray-900">{presentClasses}</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover:shadow-md transition-shadow"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg"><XCircle className="w-5 h-5 text-red-600" /></div>
            <div><p className="text-sm text-gray-500">Absent</p><p className="text-2xl font-bold text-gray-900">{absentClasses}</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover:shadow-md transition-shadow"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg"><Clock className="w-5 h-5 text-yellow-600" /></div>
            <div><p className="text-sm text-gray-500">Late</p><p className="text-2xl font-bold text-gray-900">{lateClasses}</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover:shadow-md transition-shadow"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><TrendingUp className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-sm text-gray-500">Overall</p><p className="text-2xl font-bold text-gray-900">{attendancePercentage}%</p></div>
          </div>
        </CardContent></Card>
      </div>

      <Card><CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Attendance Progress</span>
            <span className="font-medium">{attendancePercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${attendancePercentage >= 75 ? 'bg-green-500' : attendancePercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${attendancePercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span className="text-yellow-600">60% Warning</span>
            <span className="text-green-600">75% Required</span>
            <span>100%</span>
          </div>
        </div>
        {attendancePercentage < 75 && totalClasses > 0 && (
          <div className="mt-3 p-3 bg-yellow-50 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <p className="text-sm text-yellow-700">Your attendance is below the minimum required (75%).</p>
          </div>
        )}
      </CardContent></Card>

      <Card><CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-gray-400" />
          <Input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-48" />
          <span className="text-sm text-gray-500">Showing {filteredRecords.length} records</span>
        </div>
      </CardContent></Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : filteredRecords.length === 0 ? (
        <Card><CardContent className="py-12">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Records Found</h3>
            <p className="text-gray-500">{selectedMonth ? 'No attendance records for this month.' : 'No attendance records yet.'}</p>
          </div>
        </CardContent></Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedByDate).map(([date, dayRecords]) => (
            <Card key={date}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dayRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${record.status === 'present' ? 'bg-green-100' : record.status === 'absent' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                          {record.status === 'present' ? <CheckCircle className="w-4 h-4 text-green-600" /> : record.status === 'absent' ? <XCircle className="w-4 h-4 text-red-600" /> : <Clock className="w-4 h-4 text-yellow-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{record.course_code || 'Class'}</p>
                          <p className="text-sm text-gray-500">{record.remarks || 'Scheduled'}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={record.status === 'present' ? 'bg-green-50 text-green-700 border-green-200' : record.status === 'absent' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
