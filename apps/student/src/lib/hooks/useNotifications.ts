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
    queryFn: () => apiClient.get('/api/student/notifications'),
    placeholderData: () => [
      { id: '1', title: 'Registration Open', message: 'Semester 2 course registration is now open. Please register before Oct 30.', type: 'info', read: false, created_at: '2026-09-20T10:00:00', scope: 'institution' },
      { id: '2', title: 'Exam Schedule Published', message: 'Mid-Term exam schedule for Semester 1 has been published. Check your exam page.', type: 'info', read: false, created_at: '2026-09-18T14:30:00', scope: 'institution' },
      { id: '3', title: 'Assignment Graded', message: 'Your Problem Set 1 for CS101 has been graded. Score: 18/20.', type: 'success', read: true, created_at: '2026-09-16T09:00:00', link: '/dashboard/grades', scope: 'course' },
      { id: '4', title: 'Fee Payment Reminder', message: 'Exam Fee of ₹2,000 is due by Sep 30. Pay via SBI Collect.', type: 'warning', read: false, created_at: '2026-09-15T08:00:00', link: '/dashboard/fees', scope: 'institution' },
      { id: '5', title: 'Assignment Returned', message: 'Your Physics Problem Set 3 has been returned for revision. Please check feedback.', type: 'urgent', read: false, created_at: '2026-09-14T16:00:00', link: '/dashboard/assignments', scope: 'course' },
    ],
  });
}
