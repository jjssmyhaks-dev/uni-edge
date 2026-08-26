'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useEntranceExams } from '@/lib/hooks/useEntranceExams';
import { apiClient } from '@/lib/api-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Shield,
  UserPlus,
  Trash2,
  Loader2,
  Users,
} from 'lucide-react';

export default function ProctorAssignPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: examsData } = useEntranceExams();
  const exams = examsData?.data || [];

  const [selectedExam, setSelectedExam] = useState('');
  const [proctorEmail, setProctorEmail] = useState('');
  const [batchName, setBatchName] = useState('');
  const [error, setError] = useState('');

  const { data: assignmentsData, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['proctor-assignments', selectedExam],
    queryFn: () => apiClient.get<{ data: any[] }>(`/api/v1/proctoring/assignments/${selectedExam}`),
    enabled: !!selectedExam,
  });

  const assignProctor = useMutation({
    mutationFn: async () => {
      // First, find the user by email
      const { data: users } = await apiClient.get<{ data: { id: string; full_name: string; email: string }[] }>(
        `/api/v1/users?search=${proctorEmail}`
      );
      const user = users?.find(u => u.email === proctorEmail);
      if (!user) throw new Error('User not found with this email');

      return apiClient.post<{ data: any }>('/api/v1/proctoring/assign', {
        exam_id: selectedExam,
        proctor_id: user.id,
        batch_name: batchName || undefined,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proctor-assignments', selectedExam] });
      setProctorEmail('');
      setBatchName('');
      setError('');
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Failed to assign'),
  });

  const removeAssignment = useMutation({
    mutationFn: (id: string) => apiClient.delete<{ data: { message: string } }>(`/api/v1/proctoring/assignments/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['proctor-assignments', selectedExam] }),
  });

  const assignments = assignmentsData?.data || [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assign Proctors</h1>
          <p className="text-muted-foreground text-sm">Assign staff members as proctors to entrance exams</p>
        </div>
      </div>

      {/* Select Exam */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Select Exam</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={selectedExam}
            onChange={e => setSelectedExam(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
          >
            <option value="">Choose an exam...</option>
            {exams.map((e: any) => (
              <option key={e.id} value={e.id}>{e.name} ({e.status})</option>
            ))}
          </select>
        </CardContent>
      </Card>

      {selectedExam && (
        <>
          {/* Add Proctor */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <UserPlus className="h-4 w-4" /> Add Proctor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Staff Email</label>
                  <Input
                    value={proctorEmail}
                    onChange={e => setProctorEmail(e.target.value)}
                    placeholder="proctor@college.edu"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Batch Name (Optional)</label>
                  <Input
                    value={batchName}
                    onChange={e => setBatchName(e.target.value)}
                    placeholder="e.g. Batch A"
                  />
                </div>
              </div>
              {error && <p className="text-destructive text-xs">{error}</p>}
              <Button
                size="sm"
                onClick={() => assignProctor.mutate()}
                disabled={!proctorEmail.trim() || assignProctor.isPending}
              >
                {assignProctor.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <UserPlus className="h-3.5 w-3.5 mr-1" />}
                Assign Proctor
              </Button>
            </CardContent>
          </Card>

          {/* Current Assignments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" /> Assigned Proctors ({assignments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignmentsLoading ? (
                <div className="flex items-center justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
              ) : assignments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No proctors assigned yet</p>
              ) : (
                <div className="divide-y">
                  {assignments.map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium">{a.users?.full_name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{a.users?.email}</p>
                        {a.batch_name && <Badge variant="outline" className="text-xs mt-1">{a.batch_name}</Badge>}
                      </div>
                      <Button
                        variant="ghost" size="sm"
                        className="h-7 px-2 text-destructive hover:text-destructive"
                        onClick={() => removeAssignment.mutate(a.id)}
                        disabled={removeAssignment.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
