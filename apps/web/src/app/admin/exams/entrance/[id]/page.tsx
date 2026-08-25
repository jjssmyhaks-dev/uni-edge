'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable, ColumnDef } from '@/components/data-table/DataTable';
import { formatDate, capitalize } from '@/lib/utils';
import { ArrowLeft, Users, Award, Upload, Plus, CheckCircle, Send } from 'lucide-react';

type Tab = 'overview' | 'candidates' | 'results' | 'merit-list';

export default function EntranceExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');

  const examId = params.id as string;

  const { data: exam } = useQuery({
    queryKey: ['entrance-exam', examId],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_EXPRESS_API_URL}/api/v1/entrance-exams/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Not found');
      return res.json();
    },
  });

  const { data: candidates, isLoading: loadingCandidates } = useQuery({
    queryKey: ['exam-candidates', examId],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_EXPRESS_API_URL}/api/v1/exam-candidates?exam_id=${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: tab === 'candidates',
  });

  const { data: results, isLoading: loadingResults } = useQuery({
    queryKey: ['exam-results', examId],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_EXPRESS_API_URL}/api/v1/exam-results?exam_id=${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: tab === 'results' || tab === 'merit-list',
  });

  const generateMeritList = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_EXPRESS_API_URL}/api/v1/exam-results/generate-merit-list`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam_id: examId }),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-results', examId] });
    },
  });

  const publishResults = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_EXPRESS_API_URL}/api/v1/exam-results/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam_id: examId }),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-results', examId] });
    },
  });

  const examData = exam?.data;

  const candidateColumns: ColumnDef<any>[] = [
    { id: 'regNo', header: 'Registration #', accessorKey: 'registration_number', sortable: true },
    { id: 'name', header: 'Candidate Name', accessorKey: 'candidate_name', sortable: true },
    { id: 'email', header: 'Email', accessorKey: 'candidate_email' },
    { id: 'phone', header: 'Phone', accessorKey: 'candidate_phone' },
    { id: 'status', header: 'Status', sortable: true, accessorFn: (row) => <StatusBadge status={row.registration_status} /> },
  ];

  const resultColumns: ColumnDef<any>[] = [
    { id: 'rank', header: 'Rank', accessorKey: 'merit_rank', sortable: true },
    { id: 'name', header: 'Candidate', accessorFn: (row) => row.exam_candidates?.candidate_name || '—', sortable: true },
    { id: 'regNo', header: 'Reg #', accessorFn: (row) => row.exam_candidates?.registration_number || '—' },
    { id: 'score', header: 'Score', accessorKey: 'score', sortable: true },
    { id: 'category', header: 'Category', accessorKey: 'category', sortable: true },
    { id: 'published', header: 'Published', accessorFn: (row) => row.is_published ? '✅' : '❌' },
  ];

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: null },
    { key: 'candidates', label: 'Candidates', icon: <Users className="h-4 w-4" /> },
    { key: 'results', label: 'Results', icon: <Award className="h-4 w-4" /> },
    { key: 'merit-list', label: 'Merit List', icon: <Send className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.push('/admin/exams/entrance')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{examData?.name || 'Loading...'}</h1>
          {examData && (
            <p className="text-muted-foreground">
              {examData.admission_cycles?.programs?.name} • {formatDate(examData.exam_date)} • {examData.mode}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && examData && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader><CardTitle className="text-sm">Total Marks</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{examData.total_marks || '—'}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Passing Marks</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{examData.passing_marks || '—'}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Duration</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{examData.duration_minutes || '—'} min</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Status</CardTitle></CardHeader>
            <CardContent><StatusBadge status={examData.status} /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Mode</CardTitle></CardHeader>
            <CardContent><div className="text-lg font-semibold">{capitalize(examData.mode || '—')}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Academic Year</CardTitle></CardHeader>
            <CardContent><div className="text-lg font-semibold">{examData.admission_cycles?.academic_year || '—'}</div></CardContent>
          </Card>
        </div>
      )}

      {tab === 'candidates' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Candidates ({candidates?.data?.length || 0})</CardTitle>
            <Button size="sm"><Plus className="h-4 w-4" /> Add Candidate</Button>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              data={candidates?.data || []}
              columns={candidateColumns}
              loading={loadingCandidates}
              searchable
              searchPlaceholder="Search candidates..."
              searchKeys={['candidate_name', 'registration_number', 'candidate_email']}
              emptyMessage="No candidates registered yet."
            />
          </CardContent>
        </Card>
      )}

      {tab === 'results' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Results ({results?.data?.length || 0})</CardTitle>
            <Button size="sm"><Upload className="h-4 w-4" /> Bulk Upload Scores</Button>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              data={results?.data || []}
              columns={resultColumns}
              loading={loadingResults}
              searchable
              searchPlaceholder="Search results..."
              searchKeys={['exam_candidates.candidate_name', 'exam_candidates.registration_number']}
              emptyMessage="No results entered yet."
            />
          </CardContent>
        </Card>
      )}

      {tab === 'merit-list' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Merit List</CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => generateMeritList.mutate()}
                  disabled={generateMeritList.isPending}
                >
                  {generateMeritList.isPending ? 'Generating...' : 'Generate Merit List'}
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => publishResults.mutate()}
                  disabled={publishResults.isPending || !results?.data?.length}
                >
                  {publishResults.isPending ? 'Publishing...' : 'Publish Results'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                data={results?.data || []}
                columns={resultColumns}
                loading={loadingResults}
                emptyMessage="Generate a merit list to see ranked candidates."
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
