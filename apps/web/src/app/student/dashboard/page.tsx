'use client';

import { useUser } from '@clerk/nextjs';
import { useEntranceExams } from '@/lib/hooks/useEntranceExams';
import { useRegularExams } from '@/lib/hooks/useRegularExams';
import { useAttendance } from '@/lib/hooks/useAttendance';
import { useNotices } from '@/lib/hooks/useNotices';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  FileText, 
  Award, 
  Clock, 
  Download,
  ExternalLink,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Bell,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboardPage() {
  const { user } = useUser();
  const { data: entranceData, isLoading: entranceLoading } = useEntranceExams();
  const { data: regularData, isLoading: regLoading } = useRegularExams();
  const { data: attendanceData, isLoading: attendanceLoading } = useAttendance();
  const { data: noticesData, isLoading: noticesLoading } = useNotices();

  const isLoading = entranceLoading || regLoading || attendanceLoading || noticesLoading;
  const entranceExams = entranceData?.data || [];
  const regularExams = regularData?.data || [];
  const attendanceRecords = attendanceData?.data || [];
  const notices = noticesData?.data || [];

  const upcomingExams = [...entranceExams, ...regularExams]
    .filter(e => new Date(e.exam_date || '').getTime() > Date.now())
    .slice(0, 3);
  
  const attendancePercentage = attendanceRecords.length > 0
    ? Math.round((attendanceRecords.filter(r => r.status === 'present').length / attendanceRecords.length) * 100)
    : 0;

  const recentNotices = notices.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName || 'Student'}!
          </h1>
          <p className="text-gray-600 mt-1">Here&apos;s what&apos;s happening with your academic journey</p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Student Portal</Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Attendance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : `${attendancePercentage}%`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><Calendar className="w-5 h-5 text-blue-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Upcoming Exams</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : upcomingExams.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg"><Award className="w-5 h-5 text-purple-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Results Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg"><Bell className="w-5 h-5 text-orange-600" /></div>
              <div>
                <p className="text-sm text-gray-500">New Notices</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : recentNotices.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Exams */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" /> Upcoming Exams
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
              ) : upcomingExams.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No upcoming exams scheduled</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingExams.map((exam) => (
                    <div key={exam.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg"><FileText className="w-4 h-4 text-blue-600" /></div>
                        <div>
                          <p className="font-medium text-gray-900">{exam.name}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(exam.exam_date || '').toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">{exam.duration_minutes || 120} min</Badge>
                        <Button variant="ghost" size="sm"><Download className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {upcomingExams.length > 0 && (
                <div className="mt-4">
                  <Link href="/student/exams"><Button variant="outline" className="w-full">View All Exams <ExternalLink className="w-4 h-4 ml-2" /></Button></Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-purple-600" /> Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/student/hall-tickets"><Button variant="outline" className="w-full justify-start h-auto py-3"><Download className="w-4 h-4 mr-2" /> Hall Tickets</Button></Link>
                <Link href="/student/results"><Button variant="outline" className="w-full justify-start h-auto py-3"><Award className="w-4 h-4 mr-2" /> View Results</Button></Link>
                <Link href="/student/attendance"><Button variant="outline" className="w-full justify-start h-auto py-3"><CheckCircle className="w-4 h-4 mr-2" /> Attendance</Button></Link>
                <Link href="/student/documents"><Button variant="outline" className="w-full justify-start h-auto py-3"><FileText className="w-4 h-4 mr-2" /> Documents</Button></Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-orange-600" /> Recent Notices</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
              ) : recentNotices.length === 0 ? (
                <div className="text-center py-4 text-gray-500"><Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" /><p className="text-sm">No new notices</p></div>
              ) : (
                <div className="space-y-3">
                  {recentNotices.map((notice) => (
                    <div key={notice.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <p className="font-medium text-gray-900 text-sm">{notice.title}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notice.content}</p>
                      <p className="text-xs text-gray-400 mt-2">{new Date(notice.created_at).toLocaleDateString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              )}
              {recentNotices.length > 0 && (
                <div className="mt-3"><Link href="/student/notices"><Button variant="ghost" size="sm" className="w-full">View All Notices</Button></Link></div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-600" /> Attendance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">{attendancePercentage}%</div>
                    <p className="text-sm text-gray-500 mt-1">Overall Attendance</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${attendancePercentage >= 75 ? 'bg-green-500' : attendancePercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${attendancePercentage}%` }}
                    />
                  </div>
                  {attendancePercentage < 75 && attendancePercentage > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <p className="text-xs text-yellow-700">Low attendance warning. Minimum required: 75%</p>
                    </div>
                  )}
                  <Link href="/student/attendance"><Button variant="outline" size="sm" className="w-full">View Detailed Report</Button></Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
