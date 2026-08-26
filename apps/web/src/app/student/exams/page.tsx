'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEntranceExams } from '@/lib/hooks/useEntranceExams';
import {
  Calendar,
  Clock,
  Monitor,
  ClipboardList,
  Loader2,
  ArrowUpRight,
  CheckCircle,
} from 'lucide-react';

export default function StudentExamsPage() {
  const { data: examsData, isLoading } = useEntranceExams();
  const exams = examsData?.data || [];

  const activeExams = exams.filter((e: any) => e.status === 'locked');
  const draftExams = exams.filter((e: any) => e.status === 'draft' || e.status === 'under_review');
  const completedExams = exams.filter((e: any) => e.status === 'completed');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Examinations</h1>
        <p className="text-muted-foreground text-sm">View and take entrance examinations</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : exams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No exams available yet</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Active Exams */}
          {activeExams.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Available Exams</h2>
              {activeExams.map((exam: any) => (
                <Card key={exam.id} className="border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{exam.name}</h3>
                          <Badge className="text-xs bg-green-500/10 text-green-700">Live Now</Badge>
                          {exam.mode && <Badge variant="outline" className="text-xs">{exam.mode}</Badge>}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          {exam.exam_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {new Date(exam.exam_date).toLocaleDateString('en-IN')}
                            </span>
                          )}
                          {exam.duration_minutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {exam.duration_minutes} min
                            </span>
                          )}
                          {exam.total_marks_computed > 0 && (
                            <span>{exam.total_marks_computed} marks</span>
                          )}
                        </div>
                      </div>
                      <Button asChild>
                        <Link href={`/student/exams/${exam.id}`}>
                          {exam.mode === 'online' ? <Monitor className="h-4 w-4 mr-1.5" /> : <ClipboardList className="h-4 w-4 mr-1.5" />}
                          Start Exam
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Upcoming / Draft */}
          {draftExams.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Upcoming Exams</h2>
              {draftExams.map((exam: any) => (
                <Card key={exam.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{exam.name}</h3>
                          <Badge variant="secondary" className="text-xs">Upcoming</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          {exam.exam_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {new Date(exam.exam_date).toLocaleDateString('en-IN')}
                            </span>
                          )}
                          {exam.duration_minutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {exam.duration_minutes} min
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" disabled>
                        <Clock className="h-4 w-4 mr-1.5" /> Not Yet Available
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Completed */}
          {completedExams.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Past Exams</h2>
              {completedExams.map((exam: any) => (
                <Card key={exam.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{exam.name}</h3>
                          <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" /> Completed
                          </Badge>
                        </div>
                        {exam.exam_date && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(exam.exam_date).toLocaleDateString('en-IN')}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
