'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProctoringSessions } from '@/lib/hooks/useProctoring';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  XCircle,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

export default function ProctoringReviewPage() {
  const { data: sessionsData, isLoading } = useProctoringSessions();
  const sessions = sessionsData?.data || [];

  const stats = {
    total: sessions.length,
    inProgress: sessions.filter((s: any) => s.status === 'in_progress').length,
    pendingReview: sessions.filter((s: any) => s.review_status === 'pending_review').length,
    violations: sessions.filter((s: any) => s.review_status === 'violation').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Proctoring Review</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor and review exam sessions</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '—' : stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '—' : stats.inProgress}</div>
            <p className="text-xs text-muted-foreground mt-1">Live sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '—' : stats.pendingReview}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting your review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '—' : stats.violations}</div>
            <p className="text-xs text-muted-foreground mt-1">Confirmed violations</p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Sessions</CardTitle>
          <CardDescription className="text-xs">All proctoring sessions for this institution</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
              No proctoring sessions yet
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session: any) => (
                <div
                  key={session.id}
                  className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted shrink-0">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {session.exam_candidates?.candidate_name || 'Unknown Candidate'}
                      </p>
                      <Badge
                        variant={session.status === 'in_progress' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {session.status}
                      </Badge>
                      {session.review_status === 'pending_review' && (
                        <Badge variant="outline" className="text-xs text-amber-600">Needs Review</Badge>
                      )}
                      {session.review_status === 'violation' && (
                        <Badge variant="destructive" className="text-xs">Violation</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {session.entrance_exams?.name || 'Exam'} · Started {new Date(session.started_at).toLocaleString()}
                      {session.total_flag_count ? ` · ${session.total_flag_count} flags` : ''}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/exams/proctoring/${session.id}`}>
                      Review
                      <ArrowUpRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
