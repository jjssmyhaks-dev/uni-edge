'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface RegistrationCourse {
  id: string;
  course_code: string;
  course_name: string;
  instructor: string;
  credits: number;
  schedule: string;
  capacity: number;
  enrolled: number;
  prerequisites: string[];
  department: string;
  type: 'core' | 'elective' | 'lab';
  is_selected: boolean;
}

export interface RegistrationWindow {
  id: string;
  semester: string;
  start_date: string;
  end_date: string;
  status: 'open' | 'closed' | 'upcoming';
  min_credits: number;
  max_credits: number;
  flexible_mode: boolean;
}

export function useRegistration() {
  return useQuery<{ window: RegistrationWindow; courses: RegistrationCourse[] }>({
    queryKey: ['student-registration'],
    queryFn: () => apiClient.get('/api/student/registration'),
    placeholderData: () => ({
      window: {
        id: '1',
        semester: 'Semester 2',
        start_date: '2026-10-01',
        end_date: '2026-10-30',
        status: 'upcoming',
        min_credits: 14,
        max_credits: 22,
        flexible_mode: false,
      },
      courses: [
        { id: '1', course_code: 'CS201', course_name: 'Data Structures & Algorithms', instructor: 'Dr. Priya Sharma', credits: 4, schedule: 'Mon/Wed 10:00-11:30', capacity: 60, enrolled: 45, prerequisites: ['CS101'], department: 'Computer Science', type: 'core', is_selected: false },
        { id: '2', course_code: 'CS202', course_name: 'Object Oriented Programming', instructor: 'Prof. Amit Verma', credits: 3, schedule: 'Tue/Thu 11:00-12:30', capacity: 60, enrolled: 50, prerequisites: ['CS101'], department: 'Computer Science', type: 'core', is_selected: false },
        { id: '3', course_code: 'MA201', course_name: 'Engineering Mathematics II', instructor: 'Dr. Rajesh Kumar', credits: 4, schedule: 'Tue/Thu 09:00-10:30', capacity: 120, enrolled: 80, prerequisites: ['MA101'], department: 'Mathematics', type: 'core', is_selected: false },
        { id: '4', course_code: 'CS203', course_name: 'Discrete Mathematics', instructor: 'Dr. Sunita Rao', credits: 3, schedule: 'Mon/Wed/Fri 14:00-15:00', capacity: 60, enrolled: 30, prerequisites: ['MA101'], department: 'Computer Science', type: 'elective', is_selected: false },
        { id: '5', course_code: 'CS299', course_name: 'OOP Lab', instructor: 'Prof. Amit Verma', credits: 1, schedule: 'Fri 14:00-17:00', capacity: 30, enrolled: 25, prerequisites: ['CS202'], department: 'Computer Science', type: 'lab', is_selected: false },
      ],
    }),
  });
}
