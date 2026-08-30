'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Exam {
  id: string;
  exam_name: string;
  course_code: string;
  course_name: string;
  date: string;
  time: string;
  duration_minutes: number;
  venue: string;
  hall_ticket_available: boolean;
  status: 'upcoming' | 'ongoing' | 'completed';
  type: 'midterm' | 'final' | 'quiz' | 'practical';
  marks?: number;
  max_marks?: number;
}

export function useExams() {
  return useQuery<Exam[]>({
    queryKey: ['student-exams'],
    queryFn: () => apiClient.get('/api/v1/student/exams').then(r => (r as any).data || r),
    placeholderData: () => [],
  });
}
