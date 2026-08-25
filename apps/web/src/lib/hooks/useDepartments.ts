'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Department {
  id: string;
  institution_id: string;
  name: string;
  code: string | null;
  created_at: string;
}

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => api.get<{ data: Department[] }>('/api/v1/departments'),
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; code?: string }) =>
      api.post<{ data: Department }>('/api/v1/departments', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; code?: string }) =>
      api.patch<{ data: Department }>(`/api/v1/departments/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  });
}
