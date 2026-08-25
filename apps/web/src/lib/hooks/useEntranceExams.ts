'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface EntranceExam {
  id: string;
  institution_id: string;
  cycle_id: string;
  name: string;
  description: string | null;
  exam_date: string | null;
  exam_time: string | null;
  duration_minutes: number | null;
  mode: string | null;
  total_marks: number | null;
  passing_marks: number | null;
  status: string;
  created_at: string;
  admission_cycles?: { academic_year: string; programs?: { name: string }[] };
}

export function useEntranceExams(params?: { cycle_id?: string; status?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.cycle_id) searchParams.set('cycle_id', params.cycle_id);
  if (params?.status) searchParams.set('status', params.status);
  const query = searchParams.toString() ? `?${searchParams}` : '';

  return useQuery({
    queryKey: ['entrance-exams', params],
    queryFn: () => apiClient.get<{ data: EntranceExam[] }>(`/api/v1/entrance-exams${query}`),
  });
}

export function useEntranceExam(id: string) {
  return useQuery({
    queryKey: ['entrance-exams', id],
    queryFn: () => apiClient.get<{ data: EntranceExam }>(`/api/v1/entrance-exams/${id}`),
    enabled: !!id,
  });
}

export function useCreateEntranceExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient.post<{ data: EntranceExam }>('/api/v1/entrance-exams', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['entrance-exams'] }),
  });
}

export function useLockExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post<{ data: EntranceExam }>(`/api/v1/entrance-exams/${id}/lock`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['entrance-exams'] }),
  });
}

export function usePublishExamResults() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post<{ data: { message: string } }>(`/api/v1/entrance-exams/${id}/publish-results`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['entrance-exams'] }),
  });
}
