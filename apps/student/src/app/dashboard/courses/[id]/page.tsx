'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, BookOpen, Clock, Users, FileText, Download, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCourses } from '@/lib/hooks/useCourses';

const ANNOUNCEMENTS = [
  { id: '1', title: 'Assignment 3 Released', content: 'Problem Set 3 has been uploaded. Due date: Sep 25.', date: '2026-09-15', type: 'assignment' },
  { id: '2', title: 'Mid-Term Exam Date Confirmed', content: 'The mid-term exam will be held on Oct 5, 2026 in Hall A.', date: '2026-09-10', type: 'exam' },
  { id: '3', title: 'Lab Session Rescheduled', content: 'This week\'s lab session moved to Thursday 3-6 PM due to faculty leave.', date: '2026-09-08', type: 'schedule' },
];

export default function CourseDetailPage() {
  const params = useParams();
  const { data: courses = [] } = useCourses();
  const course = courses.find(c => c.id === params.id);

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Course not found</h2>
        <Button variant="ghost" asChild className="mt-4"><Link href="/dashboard/courses"><ArrowLeft className="h-4 w-4 mr-2" />Back to Courses</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/courses"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{course.course_name}</h1>
            <Badge variant="secondary">{course.course_code}</Badge>
          </div>
          <p className="text-muted-foreground">{course.instructor} · {course.department}</p>
        </div>
      </div>

      {/* Course Info Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Schedule</p>
            <p className="font-semibold text-sm">{course.schedule}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Credits</p>
            <p className="font-semibold text-sm">{course.credits}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Semester</p>
            <p className="font-semibold text-sm">{course.semester}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge variant={course.status === 'enrolled' ? 'default' : 'outline'}>{course.status}</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Announcements */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ANNOUNCEMENTS.map(a => (
                <div key={a.id} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px]">{a.type}</Badge>
                    <span className="text-xs text-muted-foreground">{a.date}</span>
                  </div>
                  <p className="font-medium text-sm">{a.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{a.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Course Materials */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { name: 'Course Syllabus', type: 'pdf', size: '245 KB' },
                { name: 'Lecture Notes - Week 1', type: 'pdf', size: '1.2 MB' },
                { name: 'Lecture Notes - Week 2', type: 'pdf', size: '980 KB' },
                { name: 'Problem Set 1', type: 'pdf', size: '320 KB' },
                { name: 'Problem Set 2', type: 'pdf', size: '290 KB' },
              ].map((file, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-2.5 hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{file.size}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
