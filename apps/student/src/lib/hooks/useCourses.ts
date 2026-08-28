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
    queryFn: () => apiClient.get('/api/student/courses'),
    placeholderData: () => [
      { id: '1', course_code: 'CS101', course_name: 'Introduction to Computer Science', instructor: 'Dr. Priya Sharma', schedule: 'Mon/Wed 10:00-11:30', credits: 4, semester: 'Semester 1', department: 'Computer Science', status: 'enrolled' },
      { id: '2', course_code: 'MA101', course_name: 'Engineering Mathematics I', instructor: 'Dr. Rajesh Kumar', schedule: 'Tue/Thu 09:00-10:30', credits: 4, semester: 'Semester 1', department: 'Mathematics', status: 'enrolled' },
      { id: '3', course_code: 'EE101', course_name: 'Basic Electronics', instructor: 'Prof. Anita Desai', schedule: 'Mon/Wed/Fri 14:00-15:00', credits: 3, semester: 'Semester 1', department: 'Electronics', status: 'enrolled' },
      { id: '4', course_code: 'HS101', course_name: 'English Communication', instructor: 'Dr. Meera Nair', schedule: 'Tue/Thu 11:00-12:30', credits: 2, semester: 'Semester 1', department: 'Humanities', status: 'enrolled' },
      { id: '5', course_code: 'PH101', course_name: 'Engineering Physics', instructor: 'Prof. Suresh Iyer', schedule: 'Mon/Wed 11:30-13:00', credits: 3, semester: 'Semester 1', department: 'Physics', status: 'enrolled' },
    ],
  });
}

export function useCourseDetail(id: string) {
  return useQuery<Course>({
    queryKey: ['student-course', id],
    queryFn: () => apiClient.get(`/api/student/courses/${id}`),
  });
}
