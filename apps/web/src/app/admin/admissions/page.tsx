'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useApplications } from '@/lib/hooks/useApplications';
import { useGenerateMeritList, useMeritList, usePublishMeritList } from '@/lib/hooks/useMeritLists';
import { apiClient } from '@/lib/api-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  FileText,
  BarChart3,
  Loader2,
  Plus,
  CheckCircle,
  Send,
  Eye,
  Trophy,
  ArrowUpRight,
} from 'lucide-react';

export default function AdmissionsPage() {
  const qc = useQueryClient();
  const { data: appsData, isLoading: appsLoading } = useApplications();
  const generateMeritList = useGenerateMeritList();
  const publishMeritList = usePublishMeritList();

  const applications = appsData?.data || [];

  // Fetch admission cycles
  const { data: cyclesData } = useQuery({
    queryKey: ['admission-cycles'],
    queryFn: () => apiClient.get<{ data: any[] }>('/api/v1/admission-cycles'),
  });
  const cycles = cyclesData?.data || [];

  const [selectedCycle, setSelectedCycle] = useState('');
  const { data: meritData } = useMeritList(selectedCycle);
  const meritList = meritData?.data || [];

  const statusCounts = {
    submitted: applications.filter(a => a.status === 'submitted').length,
    under_review: applications.filter(a => a.status === 'under_review').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    offer_sent: applications.filter(a => a.status === 'offer_sent').length,
    confirmed: applications.filter(a => a.status === 'confirmed').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    waitlisted: applications.filter(a => a.status === 'waitlisted').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admissions</h1>
          <p className="text-muted-foreground text-sm">Manage admission cycles, applications, and merit lists</p>
        </div>
        <Button asChild>
          <Link href="/admin/applications">
            <Users className="h-4 w-4 mr-1.5" /> View Applications
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
        {([
          { label: 'Submitted', count: statusCounts.submitted, color: 'bg-blue-500/10 text-blue-700' },
          { label: 'Under Review', count: statusCounts.under_review, color: 'bg-yellow-500/10 text-yellow-700' },
          { label: 'Shortlisted', count: statusCounts.shortlisted, color: 'bg-purple-500/10 text-purple-700' },
          { label: 'Offer Sent', count: statusCounts.offer_sent, color: 'bg-green-500/10 text-green-700' },
          { label: 'Confirmed', count: statusCounts.confirmed, color: 'bg-green-500/10 text-green-700' },
          { label: 'Waitlisted', count: statusCounts.waitlisted, color: 'bg-amber-500/10 text-amber-700' },
          { label: 'Rejected', count: statusCounts.rejected, color: 'bg-red-500/10 text-red-700' },
        ]).map(s => (
          <Link key={s.label} href={`/admin/applications?status=${s.label.toLowerCase().replace(' ', '_')}`} className="block">
            <Card className="cursor-pointer hover:shadow-sm transition-shadow">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold">{appsLoading ? '—' : s.count}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Admission Cycles */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Admission Cycles</CardTitle>
          <CardDescription className="text-xs">Manage academic year admission cycles</CardDescription>
        </CardHeader>
        <CardContent>
          {cycles.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No admission cycles yet</p>
          ) : (
            <div className="divide-y">
              {cycles.map((cycle: any) => (
                <div key={cycle.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{cycle.academic_year}</span>
                      <Badge variant="secondary" className="text-xs">{cycle.status}</Badge>
                      {cycle.programs?.name && <span className="text-xs text-muted-foreground">{cycle.programs.name}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/admissions/${cycle.id}`}>
                        <Eye className="h-3.5 w-3.5 mr-1" /> View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Merit List Generator */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Trophy className="h-4 w-4" /> Merit List Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <select
              value={selectedCycle}
              onChange={e => setSelectedCycle(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm flex-1"
            >
              <option value="">Select admission cycle...</option>
              {cycles.map((c: any) => (
                <option key={c.id} value={c.id}>{c.academic_year} — {c.programs?.name || 'All Programs'}</option>
              ))}
            </select>
            <Button
              size="sm"
              onClick={() => { if (selectedCycle) generateMeritList.mutate({ cycle_id: selectedCycle }); }}
              disabled={!selectedCycle || generateMeritList.isPending}
            >
              {generateMeritList.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <BarChart3 className="h-3.5 w-3.5 mr-1" />}
              Generate Merit List
            </Button>
            {meritList.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => { if (selectedCycle) publishMeritList.mutate(selectedCycle); }}
                disabled={publishMeritList.isPending}
              >
                <Send className="h-3.5 w-3.5 mr-1.5" /> Publish
              </Button>
            )}
          </div>

          {meritList.length > 0 && (
            <div className="border rounded-lg overflow-hidden mt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Rank</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Name</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Email</th>
                    <th className="text-right px-3 py-2 font-medium text-muted-foreground">Score</th>
                    <th className="text-center px-3 py-2 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {meritList.map((entry: any) => (
                    <tr key={entry.application_id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-3 py-2 font-bold">#{entry.merit_rank}</td>
                      <td className="px-3 py-2">{entry.applicant_name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{entry.applicant_email}</td>
                      <td className="px-3 py-2 text-right font-medium">{entry.score}%</td>
                      <td className="px-3 py-2 text-center">
                        <Badge variant="secondary" className="text-xs">{entry.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
