'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface RegularExam {
  id: string;
  institution_id: string;
  program_id: string;
  name: string;
  course_code: string | null;
  term: string;
  academic_year: string;
  exam_date: string | null;
  exam_time: string | null;
  duration_minutes: number | null;
  total_marks: number | null;
  passing_marks: number | null;
  status: string;
  created_at: string;
  programs?: { name: string; code: string };
}

export function useRegularExams(params?: { program_id?: string; term?: string; status?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.program_id) searchParams.set('program_id', params.program_id);
  if (params?.term) searchParams.set('term', params.term);
  if (params?.status) searchParams.set('status', params.status);
  const query = searchParams.toString() ? `?${searchParams}` : '';

  return useQuery({
    queryKey: ['regular-exams', params],
    queryFn: () => apiClient.get<{ data: RegularExam[] }>(`/api/v1/regular-exams${query}`),
  });
}

export function useRegularExam(id: string) {
  return useQuery({
    queryKey: ['regular-exams', id],
    queryFn: () => apiClient.get<{ data: RegularExam }>(`/api/v1/regular-exams/${id}`),
    enabled: !!id,
  });
}

export function useCreateRegularExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient.post<{ data: RegularExam }>('/api/v1/regular-exams', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['regular-exams'] }),
  });
}

export function useUpdateExamStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.post<{ data: RegularExam }>(`/api/v1/regular-exams/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['regular-exams'] }),
  });
}

export function useGenerateHallTickets() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (examId: string) =>
      apiClient.post<{ data: { count: number } }>(`/api/v1/regular-exams/${examId}/hall-tickets`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hall-tickets'] }),
  });
}

export function useBulkUploadResults() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ examId, results }: { examId: string; results: Array<{ enrollment_number: string; marks_obtained: number }> }) =>
      apiClient.post<{ data: { count: number } }>(`/api/v1/regular-exams/${examId}/results/bulk`, { results }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['regular-exam-results'] }),
  });
}
