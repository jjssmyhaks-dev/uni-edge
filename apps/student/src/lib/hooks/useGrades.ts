'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface GradeEntry {
  id: string;
  course_code: string;
  course_name: string;
  credits: number;
  grade: string;
  grade_points: number;
  semester: string;
  assessments: Assessment[];
}

export interface Assessment {
  id: string;
  name: string;
  type: string;
  marks_obtained: number;
  max_marks: number;
  weightage: number;
}

export function useGrades() {
  return useQuery<GradeEntry[]>({
    queryKey: ['student-grades'],
    queryFn: () => apiClient.get('/api/v1/student/grades').then(r => (r as any).data || r),
    placeholderData: () => [],
  });
}

export function calculateCGPA(grades: GradeEntry[]): number {
  if (!grades.length) return 0;
  const totalPoints = grades.reduce((sum, g) => sum + g.grade_points * g.credits, 0);
  const totalCredits = grades.reduce((sum, g) => sum + g.credits, 0);
  return totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;
}
