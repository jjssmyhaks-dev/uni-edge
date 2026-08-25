'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Institution {
  id: string;
  name: string;
  short_name: string | null;
  type: string;
  address: string | null;
  logo_url: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export function useInstitutions() {
  return useQuery({
    queryKey: ['institutions'],
    queryFn: () => api.get<{ data: Institution[] }>('/api/v1/institutions'),
  });
}

export function useInstitution(id: string) {
  return useQuery({
    queryKey: ['institutions', id],
    queryFn: () => api.get<{ data: Institution }>(`/api/v1/institutions/${id}`),
    enabled: !!id,
  });
}

export function useCreateInstitution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; type: string; address?: string }) =>
      api.post<{ data: Institution }>('/api/v1/institutions', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['institutions'] }),
  });
}
