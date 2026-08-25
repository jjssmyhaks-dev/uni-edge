'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { useEntranceExams, useLockExam, usePublishExamResults } from '@/lib/hooks';
import { ClipboardList, Plus, Calendar, Clock, Eye, Lock, CheckCircle2 } from 'lucide-react';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500/10 text-gray-600',
  under_review: 'bg-yellow-500/10 text-yellow-600',
  locked: 'bg-blue-500/10 text-blue-600',
  completed: 'bg-green-500/10 text-green-600',
};

export default function EntranceExamsPage() {
  const { data: examsData, isLoading, error } = useEntranceExams();
  const lockExam = useLockExam();
  const publishResults = usePublishExamResults();

  const exams = examsData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Entrance Exams</h1>
          <p className="text-muted-foreground">Manage entrance examinations for admission.</p>
        </div>
        <Link href="/admin/exams/entrance/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Exam
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Exams</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{exams.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Draft</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-gray-600">{exams.filter(e => e.status === 'draft').length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Under Review</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-600">{exams.filter(e => e.status === 'under_review').length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Completed</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{exams.filter(e => e.status === 'completed').length}</div></CardContent>
        </Card>
      </div>

      {/* Exams List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Entrance Exams</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">Failed to load exams.</div>
          ) : exams.length === 0 ? (
            <EmptyState title="No entrance exams" description="Create your first entrance exam to start admissions." icon={<ClipboardList className="h-8 w-8 text-muted-foreground" />} action={{ label: 'Create Exam', onClick: () => window.location.href = '/admin/exams/entrance/new' }} />
          ) : (
            <div className="space-y-3">
              {exams.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600">
                      <ClipboardList className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">{exam.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {exam.exam_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {exam.exam_date}</span>}
                        {exam.duration_minutes && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {exam.duration_minutes} min</span>}
                        {exam.mode && <span>{exam.mode}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={statusColors[exam.status] || ''}>
                      {exam.status.replace('_', ' ')}
                    </Badge>
                    <Link href={`/admin/exams/entrance/${exam.id}`}>
                      <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                    </Link>
                    {exam.status === 'under_review' && (
                      <Button variant="ghost" size="sm" onClick={() => lockExam.mutate(exam.id)} disabled={lockExam.isPending}>
                        <Lock className="h-4 w-4" />
                      </Button>
                    )}
                    {exam.status === 'completed' && (
                      <Button variant="ghost" size="sm" onClick={() => publishResults.mutate(exam.id)} disabled={publishResults.isPending}>
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    )}
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
