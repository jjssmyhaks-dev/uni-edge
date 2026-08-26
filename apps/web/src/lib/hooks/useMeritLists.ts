'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface MeritListEntry {
  application_id: string;
  applicant_name: string;
  applicant_email: string;
  score: number;
  merit_rank: number;
  status: string;
  form_data: Record<string, unknown>;
}

export function useGenerateMeritList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { cycle_id: string; formula?: string; entrance_weight?: number }) =>
      apiClient.post<{ data: MeritListEntry[] }>('/api/v1/merit-lists/generate', data),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['merit-list', vars.cycle_id] }),
  });
}

export function useMeritList(cycleId: string) {
  return useQuery({
    queryKey: ['merit-list', cycleId],
    queryFn: () => apiClient.get<{ data: MeritListEntry[] }>(`/api/v1/merit-lists/${cycleId}`),
    enabled: !!cycleId,
  });
}

export function usePublishMeritList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cycleId: string) =>
      apiClient.post<{ data: { message: string } }>(`/api/v1/merit-lists/${cycleId}/publish`, {}),
    onSuccess: (_, cycleId) => {
      qc.invalidateQueries({ queryKey: ['merit-list', cycleId] });
      qc.invalidateQueries({ queryKey: ['admission-cycles'] });
    },
  });
}
