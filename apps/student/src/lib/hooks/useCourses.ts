'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Course {
  id: string;
  course_code: string;
  course_name: string;
  instructor: string;
  schedule: string;
  credits: number;
  semester: string;
  department: string;
  syllabus?: string;
  materials_url?: string;
  status: 'enrolled' | 'completed' | 'dropped';
}

export function useCourses() {
  return useQuery<Course[]>({
    queryKey: ['student-courses'],
    queryFn: () => apiClient.get('/api/v1/student/courses').then(r => (r as any).data || r),
    placeholderData: () => [],
  });
}

export function useCourseDetail(id: string) {
  return useQuery<Course>({
    queryKey: ['student-course', id],
    queryFn: () => apiClient.get(`/api/v1/student/courses/${id}`).then(r => (r as any).data || r),
  });
}
