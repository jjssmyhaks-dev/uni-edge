'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEntranceExams, useLockExam } from '@/lib/hooks/useEntranceExams';
import {
  Plus,
  Loader2,
  ClipboardList,
  FileText,
  Lock,
  Eye,
  ArrowUpRight,
  Calendar,
  Clock,
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-500/10 text-gray-700',
  under_review: 'bg-yellow-500/10 text-yellow-700',
  locked: 'bg-blue-500/10 text-blue-700',
  completed: 'bg-green-500/10 text-green-700',
};

export default function EntranceExamsPage() {
  const { data: examsData, isLoading } = useEntranceExams();
  const lockExam = useLockExam();
  const exams = examsData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Entrance Exams</h1>
          <p className="text-muted-foreground text-sm">Create and manage entrance examinations</p>
        </div>
        <Button asChild>
          <Link href="/admin/exams/entrance/new">
            <Plus className="h-4 w-4 mr-1.5" /> Create Exam
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : exams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No entrance exams yet</p>
            <p className="text-xs text-muted-foreground mt-1">Create your first entrance exam to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {exams.map((exam: any) => (
            <Card key={exam.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{exam.name}</h3>
                      <Badge variant="secondary" className={`text-xs ${STATUS_COLORS[exam.status] || ''}`}>{exam.status}</Badge>
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
                      {exam.admission_cycles?.programs?.name && <span>{exam.admission_cycles.programs.name}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/exams/entrance/${exam.id}/questions`}>
                        <FileText className="h-3.5 w-3.5 mr-1" /> Questions
                      </Link>
                    </Button>
                    {exam.status === 'draft' && (
                      <Button variant="ghost" size="sm" onClick={() => lockExam.mutate(exam.id)} disabled={lockExam.isPending}>
                        <Lock className="h-3.5 w-3.5 mr-1" /> Lock
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
