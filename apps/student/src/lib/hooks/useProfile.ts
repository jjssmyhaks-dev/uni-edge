'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  roll_number: string;
  program: string;
  department: string;
  semester: number;
  enrollment_date: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  address: string;
  guardian_name: string;
  guardian_phone: string;
  blood_group: string;
  student_id_url?: string;
  institutional_email: string;
}

export function useProfile() {
  return useQuery<StudentProfile>({
    queryKey: ['student-profile'],
    queryFn: () => apiClient.get('/api/v1/student/profile').then(r => (r as any).data || r),
    placeholderData: () => undefined,
  });
}
