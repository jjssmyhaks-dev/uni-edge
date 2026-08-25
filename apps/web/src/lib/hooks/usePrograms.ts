'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Program {
  id: string;
  institution_id: string;
  department_id: string | null;
  name: string;
  code: string | null;
  degree_level: string;
  duration_years: number | null;
  total_seats: number | null;
  is_active: boolean;
  created_at: string;
  departments?: { name: string }[];
}

export function usePrograms() {
  return useQuery({
    queryKey: ['programs'],
    queryFn: () => apiClient.get<{ data: Program[] }>('/api/v1/programs'),
  });
}

export function useCreateProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient.post<{ data: Program }>('/api/v1/programs', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['programs'] }),
  });
}

export function useUpdateProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      apiClient.patch<{ data: Program }>(`/api/v1/programs/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['programs'] }),
  });
}
