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
    queryFn: () => apiClient.get('/api/student/assignments'),
    placeholderData: () => [
      { id: '1', title: 'Problem Set 1: Basic Programming', course_code: 'CS101', course_name: 'Introduction to Computer Science', due_date: '2026-09-15', max_marks: 20, status: 'graded', grade: 18, feedback: 'Excellent work! Clean code and well-documented.', submitted_at: '2026-09-14', description: 'Complete the 5 programming exercises in Chapter 2.', allow_resubmit: true },
      { id: '2', title: 'Assignment 2: Calculus Problems', course_code: 'MA101', course_name: 'Engineering Mathematics I', due_date: '2026-09-20', max_marks: 20, status: 'submitted', submitted_at: '2026-09-18', description: 'Solve problems 2.1 to 2.15 from the textbook.', allow_resubmit: false },
      { id: '3', title: 'Lab Report: Diode Characteristics', course_code: 'EE101', course_name: 'Basic Electronics', due_date: '2026-09-25', max_marks: 20, status: 'pending', description: 'Write a lab report on the diode characteristics experiment conducted on Sept 22.', allow_resubmit: false },
      { id: '4', title: 'Essay: Technology in Rural India', course_code: 'HS101', course_name: 'English Communication', due_date: '2026-09-22', max_marks: 20, status: 'pending', description: 'Write a 1000-word essay on the impact of technology in rural India.', allow_resubmit: false },
      { id: '5', title: 'Problem Set 3: Waves & Optics', course_code: 'PH101', course_name: 'Engineering Physics', due_date: '2026-09-10', max_marks: 20, status: 'returned', grade: 12, feedback: 'Good attempt but review the lens formula derivation. Resubmit by Sep 18.', submitted_at: '2026-09-08', description: 'Solve wave mechanics problems from Chapter 5.', allow_resubmit: true },
    ],
  });
}
