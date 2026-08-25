'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Notice {
  id: string;
  institution_id: string;
  title: string;
  content: string;
  target_audience: string;
  target_department_id: string | null;
  published: boolean;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
}

export function useNotices(params?: { status?: string; target_audience?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.target_audience) searchParams.set('target_audience', params.target_audience);
  const query = searchParams.toString() ? `?${searchParams}` : '';

  return useQuery({
    queryKey: ['notices', params],
    queryFn: () => api.get<{ data: Notice[] }>(`/api/v1/notices${query}`),
  });
}

export function useCreateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; content: string; target_audience: string; publish_immediately?: boolean }) =>
      api.post<{ data: Notice }>('/api/v1/notices', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notices'] }),
  });
}

export function useUpdateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; title?: string; content?: string; status?: string }) =>
      api.patch<{ data: Notice }>(`/api/v1/notices/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notices'] }),
  });
}

export function useDeleteNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/notices/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notices'] }),
  });
}
