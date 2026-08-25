'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface DocumentRequest {
  id: string;
  institution_id: string;
  student_id: string;
  request_type: string;
  custom_type: string | null;
  status: string;
  remarks: string | null;
  processed_by: string | null;
  processed_at: string | null;
  issued_at: string | null;
  created_at: string;
}

export function useDocumentRequests(params?: { status?: string; student_id?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.student_id) searchParams.set('student_id', params.student_id);
  const query = searchParams.toString() ? `?${searchParams}` : '';

  return useQuery({
    queryKey: ['document-requests', params],
    queryFn: () => apiClient.get<{ data: DocumentRequest[] }>(`/api/v1/document-requests${query}`),
  });
}

export function useCreateDocumentRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { student_id: string; request_type: string; custom_type?: string; remarks?: string }) =>
      apiClient.post<{ data: DocumentRequest }>('/api/v1/document-requests', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['document-requests'] }),
  });
}

export function useUpdateDocumentRequestStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, remarks }: { id: string; status: string; remarks?: string }) =>
      apiClient.patch<{ data: DocumentRequest }>(`/api/v1/document-requests/${id}`, { status, remarks }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['document-requests'] }),
  });
}
