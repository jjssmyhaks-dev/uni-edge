'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  read: boolean;
  created_at: string;
  link?: string;
  scope: 'institution' | 'course' | 'personal';
}

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: ['student-notifications'],
    queryFn: () => apiClient.get('/api/v1/student/notifications').then(r => (r as any).data || r),
    placeholderData: () => [],
  });
}
