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
    queryFn: () => apiClient.get('/api/student/profile'),
    placeholderData: () => ({
      id: '1',
      name: 'Arjun Patel',
      email: 'arjun.patel@example.com',
      roll_number: '2026/CS/001',
      program: 'B.Tech Computer Science',
      department: 'Computer Science',
      semester: 1,
      enrollment_date: '2026-07-20',
      date_of_birth: '2004-03-15',
      gender: 'Male',
      phone: '+91 98765 43210',
      address: '42, MG Road, Pune, Maharashtra 411001',
      guardian_name: 'Vikram Patel',
      guardian_phone: '+91 98765 43211',
      blood_group: 'B+',
      institutional_email: 'arjun.2026@uni-edge.edu.in',
    }),
  });
}
