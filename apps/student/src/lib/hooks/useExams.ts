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
    queryFn: () => apiClient.get('/api/student/exams'),
    placeholderData: () => [
      { id: '1', exam_name: 'Mid-Term Exam', course_code: 'CS101', course_name: 'Introduction to Computer Science', date: '2026-10-05', time: '10:00 AM - 12:00 PM', duration_minutes: 120, venue: 'Hall A - Block 3', hall_ticket_available: true, status: 'upcoming', type: 'midterm' },
      { id: '2', exam_name: 'Mid-Term Exam', course_code: 'MA101', course_name: 'Engineering Mathematics I', date: '2026-10-07', time: '10:00 AM - 12:00 PM', duration_minutes: 120, venue: 'Hall B - Block 3', hall_ticket_available: true, status: 'upcoming', type: 'midterm' },
      { id: '3', exam_name: 'Mid-Term Exam', course_code: 'EE101', course_name: 'Basic Electronics', date: '2026-10-09', time: '02:00 PM - 04:00 PM', duration_minutes: 120, venue: 'Lab 2 - Block 5', hall_ticket_available: true, status: 'upcoming', type: 'midterm' },
      { id: '4', exam_name: 'Quiz 1', course_code: 'PH101', course_name: 'Engineering Physics', date: '2026-09-30', time: '11:00 AM - 11:45 AM', duration_minutes: 45, venue: 'Room 201 - Block 2', hall_ticket_available: false, status: 'upcoming', type: 'quiz' },
    ],
  });
}
