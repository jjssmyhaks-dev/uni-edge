'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { useProctoringSessions, useProctoringStats, useFlaggedEvents, useReviewFlag } from '@/lib/hooks';
import { Eye, AlertTriangle, CheckCircle2, XCircle, Clock, Shield, Camera, Monitor } from 'lucide-react';

const flagTypeLabels: Record<string, string> = {
  tab_switch: 'Tab Switch', multiple_faces: 'Multiple Faces', no_face: 'No Face',
  unusual_audio: 'Unusual Audio', copy_paste: 'Copy/Paste', right_click: 'Right Click',
  fullscreen_exit: 'Fullscreen Exit', suspicious_movement: 'Suspicious Movement',
  id_mismatch: 'ID Mismatch', other: 'Other',
};

export default function ProctoringPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'flags' | 'reports'>('overview');
  const { data: statsData } = useProctoringStats();
  const { data: sessionsData, isLoading: sessionsLoading } = useProctoringSessions();
  const { data: flagsData, isLoading: flagsLoading } = useFlaggedEvents();
  const reviewFlag = useReviewFlag();

  const stats = statsData?.data;
  const sessions = sessionsData?.data || [];
  const flags = flagsData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exam Proctoring</h1>
          <p className="text-muted-foreground">Monitor live exam sessions, review flagged events.</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b">
        {[
          { id: 'overview' as const, label: 'Overview', icon: <Monitor className="h-4 w-4" /> },
          { id: 'sessions' as const, label: 'Sessions', icon: <Camera className="h-4 w-4" /> },
          { id: 'flags' as const, label: 'Flag Review', icon: <AlertTriangle className="h-4 w-4" /> },
          { id: 'reports' as const, label: 'Reports', icon: <Shield className="h-4 w-4" /> },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <Camera className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats?.in_progress || 0}</div>
                <p className="text-xs text-muted-foreground">Candidates in exam</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Flags</CardTitle>
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats?.total_flags || 0}</div>
                <p className="text-xs text-muted-foreground">Across all sessions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <Clock className="h-5 w-5 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats?.pending_review || 0}</div>
                <p className="text-xs text-muted-foreground">Sessions awaiting review</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Violations</CardTitle>
                <XCircle className="h-5 w-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats?.violations || 0}</div>
                <p className="text-xs text-muted-foreground">Confirmed violations</p>
              </CardContent>
            </Card>
          </div>

          {/* Flag Types Breakdown */}
          {stats?.flags_by_type && Object.keys(stats.flags_by_type).length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Flag Types Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {Object.entries(stats.flags_by_type).map(([type, count]) => (
                    <div key={type} className="flex items-center gap-2 p-3 rounded-lg border">
                      <div>
                        <p className="text-xs font-medium">{flagTypeLabels[type] || type}</p>
                        <p className="text-lg font-bold">{count as number}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Sessions */}
      {activeTab === 'sessions' && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Proctoring Sessions</CardTitle></CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
            ) : sessions.length === 0 ? (
              <EmptyState title="No sessions" description="Proctoring sessions will appear here." icon={<Camera className="h-8 w-8 text-muted-foreground" />} />
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${session.status === 'in_progress' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                      <div>
                        <p className="font-medium">{session.exam_candidates?.candidate_name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">Registration: {session.exam_candidates?.registration_number || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={session.status === 'in_progress' ? 'bg-green-500/10 text-green-600' : ''}>{session.status}</Badge>
                      {session.total_flag_count > 0 && <Badge variant="destructive">{session.total_flag_count} flags</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Flags */}
      {activeTab === 'flags' && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Flag Review Queue</CardTitle></CardHeader>
          <CardContent>
            {flagsLoading ? (
              <div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
            ) : flags.length === 0 ? (
              <EmptyState title="No flags to review" description="Flagged events will appear here." icon={<AlertTriangle className="h-8 w-8 text-muted-foreground" />} />
            ) : (
              <div className="space-y-3">
                {flags.map((flag) => (
                  <div key={flag.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`h-5 w-5 ${flag.severity >= 7 ? 'text-red-500' : 'text-yellow-500'}`} />
                      <div>
                        <p className="font-medium">{flagTypeLabels[flag.flag_type] || flag.flag_type}</p>
                        <p className="text-xs text-muted-foreground">Severity: {flag.severity}/10 • {new Date(flag.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={flag.review_status === 'cleared' ? 'bg-green-500/10 text-green-600' : flag.review_status === 'violation' ? 'bg-red-500/10 text-red-600' : ''}>
                        {flag.review_status}
                      </Badge>
                      {flag.review_status === 'pending' && (
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" onClick={() => reviewFlag.mutate({ id: flag.id, review_status: 'cleared' })} disabled={reviewFlag.isPending}>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => reviewFlag.mutate({ id: flag.id, review_status: 'violation', reviewer_notes: 'Confirmed violation' })} disabled={reviewFlag.isPending}>
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reports */}
      {activeTab === 'reports' && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Post-Exam Reports</CardTitle></CardHeader>
          <CardContent>
            <EmptyState title="No reports yet" description="Reports will appear after proctored exams complete." icon={<Shield className="h-8 w-8 text-muted-foreground" />} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
