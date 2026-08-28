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
    queryFn: () => apiClient.get('/api/student/grades'),
    placeholderData: () => [
      {
        id: '1', course_code: 'CS101', course_name: 'Introduction to Computer Science',
        credits: 4, grade: 'A', grade_points: 10, semester: 'Semester 1',
        assessments: [
          { id: 'a1', name: 'Mid-Term', type: 'midterm', marks_obtained: 42, max_marks: 50, weightage: 30 },
          { id: 'a2', name: 'Assignments', type: 'assignment', marks_obtained: 18, max_marks: 20, weightage: 20 },
          { id: 'a3', name: 'Final Exam', type: 'final', marks_obtained: 85, max_marks: 100, weightage: 50 },
        ],
      },
      {
        id: '2', course_code: 'MA101', course_name: 'Engineering Mathematics I',
        credits: 4, grade: 'A+', grade_points: 10, semester: 'Semester 1',
        assessments: [
          { id: 'b1', name: 'Mid-Term', type: 'midterm', marks_obtained: 46, max_marks: 50, weightage: 30 },
          { id: 'b2', name: 'Assignments', type: 'assignment', marks_obtained: 19, max_marks: 20, weightage: 20 },
          { id: 'b3', name: 'Final Exam', type: 'final', marks_obtained: 92, max_marks: 100, weightage: 50 },
        ],
      },
      {
        id: '3', course_code: 'EE101', course_name: 'Basic Electronics',
        credits: 3, grade: 'B+', grade_points: 8, semester: 'Semester 1',
        assessments: [
          { id: 'c1', name: 'Mid-Term', type: 'midterm', marks_obtained: 38, max_marks: 50, weightage: 30 },
          { id: 'c2', name: 'Assignments', type: 'assignment', marks_obtained: 17, max_marks: 20, weightage: 20 },
          { id: 'c3', name: 'Final Exam', type: 'final', marks_obtained: 78, max_marks: 100, weightage: 50 },
        ],
      },
      {
        id: '4', course_code: 'HS101', course_name: 'English Communication',
        credits: 2, grade: 'A', grade_points: 10, semester: 'Semester 1',
        assessments: [
          { id: 'd1', name: 'Mid-Term', type: 'midterm', marks_obtained: 43, max_marks: 50, weightage: 30 },
          { id: 'd2', name: 'Assignments', type: 'assignment', marks_obtained: 18, max_marks: 20, weightage: 20 },
          { id: 'd3', name: 'Final Exam', type: 'final', marks_obtained: 88, max_marks: 100, weightage: 50 },
        ],
      },
      {
        id: '5', course_code: 'PH101', course_name: 'Engineering Physics',
        credits: 3, grade: 'A-', grade_points: 9, semester: 'Semester 1',
        assessments: [
          { id: 'e1', name: 'Mid-Term', type: 'midterm', marks_obtained: 40, max_marks: 50, weightage: 30 },
          { id: 'e2', name: 'Assignments', type: 'assignment', marks_obtained: 16, max_marks: 20, weightage: 20 },
          { id: 'e3', name: 'Final Exam', type: 'final', marks_obtained: 82, max_marks: 100, weightage: 50 },
        ],
      },
    ],
  });
}

export function calculateCGPA(grades: GradeEntry[]): number {
  if (!grades.length) return 0;
  const totalPoints = grades.reduce((sum, g) => sum + g.grade_points * g.credits, 0);
  const totalCredits = grades.reduce((sum, g) => sum + g.credits, 0);
  return totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;
}
