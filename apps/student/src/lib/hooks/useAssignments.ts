'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Assignment {
  id: string;
  title: string;
  course_code: string;
  course_name: string;
  due_date: string;
  max_marks: number;
  status: 'pending' | 'submitted' | 'graded' | 'late' | 'returned';
  grade?: number;
  feedback?: string;
  submitted_at?: string;
  description: string;
  allow_resubmit: boolean;
}

export function useAssignments() {
  return useQuery<Assignment[]>({
    queryKey: ['student-assignments'],
    queryFn: () => apiClient.get('/api/v1/student/assessments').then(r => (r as any).data || r),
    placeholderData: () => [],
  });
}
