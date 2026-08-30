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
    queryFn: () => apiClient.get('/api/v1/student/registration').then(r => (r as any).data || r),
    placeholderData: () => undefined,
  });
}
