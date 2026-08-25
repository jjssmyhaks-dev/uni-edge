'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AttendanceRecord {
  id: string;
  institution_id: string;
  student_id: string;
  program_id: string;
  course_code: string | null;
  date: string;
  status: string;
  remarks: string | null;
  marked_by: string | null;
  created_at: string;
}

export interface AttendanceSummary {
  total_classes: number;
  present: number;
  absent: number;
  percentage: number;
}

export function useAttendance(params?: { program_id?: string; course_code?: string; date?: string; student_id?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.program_id) searchParams.set('program_id', params.program_id);
  if (params?.course_code) searchParams.set('course_code', params.course_code);
  if (params?.date) searchParams.set('date', params.date);
  if (params?.student_id) searchParams.set('student_id', params.student_id);
  const query = searchParams.toString() ? `?${searchParams}` : '';

  return useQuery({
    queryKey: ['attendance', params],
    queryFn: () => api.get<{ data: AttendanceRecord[] }>(`/api/v1/attendance${query}`),
  });
}

export function useAttendanceSummary(studentId: string) {
  return useQuery({
    queryKey: ['attendance-summary', studentId],
    queryFn: () => api.get<{ data: AttendanceSummary }>(`/api/v1/attendance/summary/${studentId}`),
    enabled: !!studentId,
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { student_id: string; program_id: string; course_code?: string; date: string; status: string; remarks?: string }) =>
      api.post<{ data: AttendanceRecord }>('/api/v1/attendance', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance'] }),
  });
}

export function useBulkMarkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { records: Array<{ student_id: string; program_id: string; course_code?: string; date: string; status: string; remarks?: string }> }) =>
      api.post<{ data: AttendanceRecord[] }>('/api/v1/attendance/bulk', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance'] }),
  });
}
