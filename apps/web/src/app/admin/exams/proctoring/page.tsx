'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useProctoringSessions, useProctoringStats } from '@/lib/hooks/useProctoring';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Camera,
  Loader2,
  RefreshCw,
  ArrowUpRight,
  Wifi,
  Search,
  Filter,
} from 'lucide-react';

export default function ProctoringDashboard() {
  const { data: sessionsData, isLoading: sessionsLoading, refetch } = useProctoringSessions();
  const { data: statsData, isLoading: statsLoading } = useProctoringStats();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const sessions = sessionsData?.data || [];
  const stats = statsData?.data;

  const liveSessions = sessions.filter((s: any) => s.status === 'in_progress');
  const filteredSessions = sessions.filter((s: any) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const name = s.exam_candidates?.candidate_name?.toLowerCase() || '';
      const exam = s.entrance_exams?.name?.toLowerCase() || '';
      return name.includes(q) || exam.includes(q);
    }
    return true;
  });

  // Auto-refresh every 15 seconds for live sessions
  useEffect(() => {
    if (liveSessions.length === 0) return;
    const interval = setInterval(() => refetch(), 15000);
    return () => clearInterval(interval);
  }, [liveSessions.length, refetch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Proctoring Dashboard</h1>
          <p className="text-muted-foreground text-sm">Monitor live exam sessions and review flagged events</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/exams/proctoring/assign">
              <Shield className="h-3.5 w-3.5 mr-1.5" /> Assign Proctors
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Sessions"
          value={stats?.total_sessions || 0}
          icon={<Shield className="h-4 w-4" />}
          loading={statsLoading}
        />
        <StatCard
          title="Live Now"
          value={stats?.in_progress || 0}
          icon={<Wifi className="h-4 w-4 text-green-600" />}
          loading={statsLoading}
          highlight={stats && stats.in_progress > 0}
        />
        <StatCard
          title="Pending Review"
          value={stats?.pending_review || 0}
          icon={<Eye className="h-4 w-4 text-amber-600" />}
          loading={statsLoading}
        />
        <StatCard
          title="Violations"
          value={stats?.violations || 0}
          icon={<AlertTriangle className="h-4 w-4 text-red-600" />}
          loading={statsLoading}
        />
      </div>

      {/* Live Sessions */}
      {liveSessions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Live Sessions ({liveSessions.length})
          </h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {liveSessions.map((session: any) => (
              <LiveSessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by candidate or exam..."
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
        >
          <option value="all">All Status</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="terminated">Terminated</option>
        </select>
      </div>

      {/* All Sessions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Sessions</CardTitle>
          <CardDescription className="text-xs">{filteredSessions.length} sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : filteredSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No sessions found</p>
          ) : (
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader><TableRow className="border-b hover:bg-transparent">
                  <TableHead className="h-12 px-4 font-medium">Candidate</TableHead>
                  <TableHead className="h-12 px-4 font-medium">Exam</TableHead>
                  <TableHead className="h-12 px-4 font-medium">Status</TableHead>
                  <TableHead className="h-12 px-4 font-medium">Flags</TableHead>
                  <TableHead className="h-12 px-4 font-medium">Review</TableHead>
                  <TableHead className="h-12 w-[120px] px-4 font-medium">Actions</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filteredSessions.map((session: any) => (
                    <TableRow key={session.id} className="hover:bg-muted/50">
                      <TableCell className="h-16 px-4">
                        <div className="flex items-center gap-2">
                          <Camera className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{session.exam_candidates?.candidate_name || 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="h-16 px-4 text-sm text-muted-foreground">{session.entrance_exams?.name || 'Exam'}</TableCell>
                      <TableCell className="h-16 px-4">
                        <Badge variant={session.status === 'in_progress' ? 'default' : 'secondary'} className="text-xs">{session.status}</Badge>
                      </TableCell>
                      <TableCell className="h-16 px-4 text-sm">{session.total_flag_count || 0} flags</TableCell>
                      <TableCell className="h-16 px-4">
                        <Badge variant="secondary" className={"text-xs " + (session.review_status === 'cleared' ? 'bg-green-500/10 text-green-700' : session.review_status === 'violation' ? 'bg-red-500/10 text-red-700' : 'bg-yellow-500/10 text-yellow-700')}>
                          {session.review_status?.replace('_', ' ') || 'pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="h-16 px-4">
                        <TooltipProvider><div className="flex items-center gap-1">
                          <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" className="h-8 w-8"><Eye className="size-4" /></Button></TooltipTrigger><TooltipContent>View Session</TooltipContent></Tooltip>
                          {session.status === 'in_progress' && <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /><span className="text-xs text-green-600">Live</span></span>}
                        </div></TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon, loading, highlight }: {
  title: string; value: number; icon: React.ReactNode; loading: boolean; highlight?: boolean;
}) {
  return (
    <Card className={highlight ? 'border-green-500/30' : ''}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground">{title}</p>
          {icon}
        </div>
        {loading ? (
          <div className="h-7 w-16 bg-muted rounded animate-pulse" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}

function LiveSessionCard({ session }: { session: any }) {
  const elapsed = session.started_at
    ? Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000)
    : 0;
  const minutes = Math.floor(elapsed / 60);
  const flags = session.total_flag_count || 0;

  return (
    <Card className="border-green-500/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium">{session.exam_candidates?.candidate_name || 'Candidate'}</span>
          </div>
          <Badge className="text-xs bg-green-500/10 text-green-700">Live</Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          {session.entrance_exams?.name || 'Exam'} · {minutes}m elapsed
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {flags > 0 && (
              <Badge variant="outline" className={`text-xs ${flags >= 5 ? 'text-red-600 border-red-300' : flags >= 3 ? 'text-amber-600 border-amber-300' : ''}`}>
                <AlertTriangle className="h-3 w-3 mr-1" /> {flags} flag{flags !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <Link href={`/admin/exams/proctoring/${session.id}`}>
            <Button variant="ghost" size="sm" className="h-7 px-2">
              <Eye className="h-3.5 w-3.5 mr-1" /> View
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
