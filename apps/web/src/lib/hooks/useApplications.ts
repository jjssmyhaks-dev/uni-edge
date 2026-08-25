'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Application {
  id: string;
  institution_id: string;
  cycle_id: string;
  applicant_name: string;
  applicant_email: string | null;
  applicant_phone: string | null;
  clerk_user_id: string | null;
  status: string;
  form_data: Record<string, unknown>;
  merit_rank: number | null;
  submitted_at: string | null;
  created_at: string;
  admission_cycles?: { academic_year: string; programs?: { name: string } };
}

export function useApplications(params?: { cycle_id?: string; status?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.cycle_id) searchParams.set('cycle_id', params.cycle_id);
  if (params?.status) searchParams.set('status', params.status);
  const query = searchParams.toString() ? `?${searchParams}` : '';

  return useQuery({
    queryKey: ['applications', params],
    queryFn: () => api.get<{ data: Application[] }>(`/api/v1/applications${query}`),
  });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: ['applications', id],
    queryFn: () => api.get<{ data: Application }>(`/api/v1/applications/${id}`),
    enabled: !!id,
  });
}

export function useSubmitApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { cycle_id: string; applicant_name: string; applicant_email: string; form_data: Record<string, unknown> }) =>
      api.post<{ data: Application }>('/api/v1/applications', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications'] }),
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch<{ data: Application }>(`/api/v1/applications/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications'] }),
  });
}

export function useShortlistApplications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cycleId, meritRankCutoff }: { cycleId: string; meritRankCutoff: number }) =>
      api.post<{ data: { message: string } }>(`/api/v1/applications/${cycleId}/shortlist`, { merit_rank_cutoff: meritRankCutoff }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications'] }),
  });
}
