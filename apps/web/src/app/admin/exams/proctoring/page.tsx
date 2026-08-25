'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Eye, AlertTriangle, CheckCircle2, XCircle, Clock, Shield, Camera, Monitor } from 'lucide-react';

const flagTypeIcons: Record<string, string> = {
  tab_switch: '🔄',
  multiple_faces: '👥',
  no_face: '👤',
  unusual_audio: '🔊',
  copy_paste: '📋',
  right_click: '🖱️',
  fullscreen_exit: '🖥️',
  suspicious_movement: '🏃',
  id_mismatch: '🪪',
  other: '⚠️',
};

const flagTypeLabels: Record<string, string> = {
  tab_switch: 'Tab Switch',
  multiple_faces: 'Multiple Faces',
  no_face: 'No Face Detected',
  unusual_audio: 'Unusual Audio',
  copy_paste: 'Copy/Paste',
  right_click: 'Right Click',
  fullscreen_exit: 'Fullscreen Exit',
  suspicious_movement: 'Suspicious Movement',
  id_mismatch: 'ID Mismatch',
  other: 'Other',
};

export default function ProctoringPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'flags' | 'reports'>('overview');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exam Proctoring</h1>
          <p className="text-muted-foreground">Monitor live exam sessions, review flagged events, and manage anti-cheating reports.</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b">
        {[
          { id: 'overview' as const, label: 'Overview', icon: <Monitor className="h-4 w-4" /> },
          { id: 'sessions' as const, label: 'Live Sessions', icon: <Camera className="h-4 w-4" /> },
          { id: 'flags' as const, label: 'Flag Review Queue', icon: <AlertTriangle className="h-4 w-4" /> },
          { id: 'reports' as const, label: 'Post-Exam Reports', icon: <Shield className="h-4 w-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <Camera className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">—</div>
                <p className="text-xs text-muted-foreground">Candidates in exam</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Flags</CardTitle>
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">—</div>
                <p className="text-xs text-muted-foreground">Across all sessions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <Clock className="h-5 w-5 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">—</div>
                <p className="text-xs text-muted-foreground">Sessions awaiting review</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Violations Found</CardTitle>
                <XCircle className="h-5 w-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">—</div>
                <p className="text-xs text-muted-foreground">Confirmed violations</p>
              </CardContent>
            </Card>
          </div>

          {/* Flag Types Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Flag Types Breakdown</CardTitle>
              <CardDescription>Distribution of flagged events by type.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(flagTypeLabels).map(([type, label]) => (
                  <div key={type} className="flex items-center gap-2 p-3 rounded-lg border">
                    <span className="text-lg">{flagTypeIcons[type]}</span>
                    <div>
                      <p className="text-xs font-medium">{label}</p>
                      <p className="text-lg font-bold">—</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Live Sessions Tab */}
      {activeTab === 'sessions' && (
        <Card>
          <CardHeader>
            <CardTitle>Live Proctoring Sessions</CardTitle>
            <CardDescription>Currently active exam sessions being proctored.</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="No active sessions"
              description="When candidates start proctored exams, their sessions will appear here for real-time monitoring."
              icon={<Camera className="h-8 w-8 text-muted-foreground" />}
            />
          </CardContent>
        </Card>
      )}

      {/* Flag Review Queue Tab */}
      {activeTab === 'flags' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex gap-2 flex-wrap">
            <Button variant="default" size="sm">All Pending</Button>
            <Button variant="outline" size="sm">Tab Switches</Button>
            <Button variant="outline" size="sm">Face Issues</Button>
            <Button variant="outline" size="sm">Audio Flags</Button>
            <Button variant="outline" size="sm">High Severity (7+)</Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Flag Review Queue</CardTitle>
              <CardDescription>Review flagged events and mark as cleared or violation.</CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                title="No flags to review"
                description="Flagged events from proctored exams will appear here. Review each flag and mark as cleared or violation."
                icon={<AlertTriangle className="h-8 w-8 text-muted-foreground" />}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <Card>
          <CardHeader>
            <CardTitle>Post-Exam Proctoring Reports</CardTitle>
            <CardDescription>Complete proctoring reports for each candidate session after the exam ends.</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="No reports yet"
              description="After proctored exams complete, detailed reports with flag timelines and reviewer decisions will appear here."
              icon={<Shield className="h-8 w-8 text-muted-foreground" />}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
