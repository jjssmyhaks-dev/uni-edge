'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface ProctoringSession {
  id: string;
  institution_id: string;
  exam_id: string;
  candidate_id: string;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  total_flag_count: number;
  review_status: string;
  created_at: string;
  exam_candidates?: { candidate_name: string; registration_number: string };
  flagged_events?: Array<{ id: string; flag_type: string; severity: number; review_status: string }>;
}

export interface ProctoringStats {
  total_sessions: number;
  in_progress: number;
  completed: number;
  terminated: number;
  pending_review: number;
  total_flags: number;
  violations: number;
  flags_by_type: Record<string, number>;
}

export function useProctoringSessions(params?: { exam_id?: string; status?: string; review_status?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.exam_id) searchParams.set('exam_id', params.exam_id);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.review_status) searchParams.set('review_status', params.review_status);
  const query = searchParams.toString() ? `?${searchParams}` : '';

  return useQuery({
    queryKey: ['proctoring-sessions', params],
    queryFn: () => apiClient.get<{ data: ProctoringSession[] }>(`/api/v1/proctoring${query}`),
  });
}

export function useProctoringStats() {
  return useQuery({
    queryKey: ['proctoring-stats'],
    queryFn: () => apiClient.get<{ data: ProctoringStats }>('/api/v1/proctoring/stats'),
  });
}

export function useReviewProctoringSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, review_status, reviewer_notes }: { id: string; review_status: string; reviewer_notes?: string }) =>
      apiClient.post<{ data: ProctoringSession }>(`/api/v1/proctoring/${id}/review`, { review_status, reviewer_notes }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['proctoring-sessions'] }),
  });
}

export function useFlaggedEvents(params?: { session_id?: string; flag_type?: string; review_status?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.session_id) searchParams.set('session_id', params.session_id);
  if (params?.flag_type) searchParams.set('flag_type', params.flag_type);
  if (params?.review_status) searchParams.set('review_status', params.review_status);
  const query = searchParams.toString() ? `?${searchParams}` : '';

  return useQuery({
    queryKey: ['flagged-events', params],
    queryFn: () => apiClient.get<{ data: Array<{ id: string; flag_type: string; severity: number; review_status: string; timestamp: string }> }>(`/api/v1/proctoring/flags${query}`),
  });
}

export function useReviewFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, review_status, reviewer_notes }: { id: string; review_status: string; reviewer_notes?: string }) =>
      apiClient.patch<{ data: { id: string; review_status: string } }>(`/api/v1/proctoring/flags/${id}`, { review_status, reviewer_notes }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['flagged-events'] }),
  });
}
