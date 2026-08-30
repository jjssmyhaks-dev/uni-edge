'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// ============================================
// Calendar Events
// ============================================

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'exam' | 'holiday' | 'deadline' | 'registration' | 'event';
  description?: string;
}

export function useCalendarEvents() {
  return useQuery<CalendarEvent[]>({
    queryKey: ['student-calendar'],
    queryFn: () => apiClient.get('/api/v1/student/calendar'),
    placeholderData: () => [],
  });
}

// ============================================
// Attendance
// ============================================

export interface AttendanceRecord {
  id: string;
  course_code: string;
  course_name: string;
  total_classes: number;
  present: number;
  absent: number;
  excused: number;
  percentage: number;
  records: { date: string; status: 'present' | 'absent' | 'late' | 'excused' }[];
}

export function useAttendance() {
  return useQuery<AttendanceRecord[]>({
    queryKey: ['student-attendance'],
    queryFn: () => apiClient.get('/api/v1/student/attendance'),
    placeholderData: () => [],
  });
}

// ============================================
// Documents
// ============================================

export interface DocumentRequest {
  id: string;
  type: string;
  document_type?: string;
  status: 'requested' | 'processing' | 'ready' | 'issued';
  requested_at: string;
  created_at: string;
  issued_at?: string;
  file_url?: string;
  purpose?: string;
}

export function useDocumentRequests() {
  const queryClient = useQueryClient();

  const query = useQuery<DocumentRequest[]>({
    queryKey: ['student-documents'],
    queryFn: () => apiClient.get('/api/v1/student/document-requests'),
    placeholderData: () => [],
  });

  const requestDocument = useMutation({
    mutationFn: (data: { type: string; purpose?: string }) =>
      apiClient.post('/api/v1/student/document-requests', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['student-documents'] }),
  });

  return { ...query, requestDocument };
}

// ============================================
// Grievances
// ============================================

export interface Grievance {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  resolution_notes?: string;
  resolved_at?: string;
  created_at: string;
  replies: GrievanceReply[];
}

export interface GrievanceReply {
  id: string;
  message: string;
  sender_role: string;
  sender_name?: string;
  created_at: string;
}

export function useGrievances() {
  const queryClient = useQueryClient();

  const query = useQuery<Grievance[]>({
    queryKey: ['student-grievances'],
    queryFn: () => apiClient.get('/api/v1/student/grievances'),
    placeholderData: () => [],
  });

  const createGrievance = useMutation({
    mutationFn: (data: { subject: string; description: string; category: string; priority?: string }) =>
      apiClient.post('/api/v1/student/grievances', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['student-grievances'] }),
  });

  const replyToGrievance = useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      apiClient.post(`/api/v1/student/grievances/${id}/replies`, { message }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['student-grievances'] }),
  });

  return { ...query, createGrievance, replyToGrievance };
}
