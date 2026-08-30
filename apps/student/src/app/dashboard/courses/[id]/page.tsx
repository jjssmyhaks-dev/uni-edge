'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Clock, Users, FileText, Download } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCourses } from '@/lib/hooks/useCourses';
import { useCourseAnnouncements, useCourseMaterials, type CourseAnnouncement, type CourseMaterial } from '@/lib/hooks/useExtras';

export default function CourseDetailPage() {
  const params = useParams();
  const { data: courses = [], isLoading } = useCourses();
  const course = courses.find(c => c.id === params.id);

  // For now, fetch announcements and materials without course_offering_id
  // (will be wired to specific offering once enrollment data links them)
  const { data: allAnnouncements = [] } = useCourseAnnouncements();
  const { data: allMaterials = [] } = useCourseMaterials();

  // Filter announcements/materials relevant to this course
  const announcements = allAnnouncements.filter(a =>
    a.course_offerings?.courses?.course_code === course?.course_code
  );
  const materials = allMaterials.filter(() => false); // Will filter by offering once linked

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

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
            {announcements.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No announcements for this course</p>
            ) : (
              <div className="space-y-3">
                {announcements.map(a => (
                  <div key={a.id} className="rounded-lg border p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] capitalize">{a.scope}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(a.published_at).toLocaleDateString('en-IN')}</span>
                      {a.is_pinned && <Badge className="text-[10px] bg-primary/10 text-primary border-0">Pinned</Badge>}
                    </div>
                    <p className="font-medium text-sm">{a.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{a.content}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Materials */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Materials</CardTitle>
          </CardHeader>
          <CardContent>
            {materials.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No materials uploaded yet</p>
            ) : (
              <div className="space-y-2">
                {materials.map((file) => (
                  <div key={file.id} className="flex items-center justify-between rounded-lg border p-2.5 hover:bg-muted/50">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm truncate">{file.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {file.file_size && <span className="text-xs text-muted-foreground">{(file.file_size / 1024).toFixed(0)} KB</span>}
                      <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                        <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
