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
    placeholderData: () => [
      { id: '1', title: 'Semester 1 End-Term Exams Begin', date: '2026-12-01', type: 'exam', description: 'End-semester examination period starts.' },
      { id: '2', title: 'Diwali Holiday', date: '2026-10-20', type: 'holiday', description: 'College closed for Diwali celebrations.' },
      { id: '3', title: 'Assignment 3 Due', date: '2026-09-25', type: 'deadline', description: 'Lab Report: Diode Characteristics due.' },
      { id: '4', title: 'Semester 2 Registration Opens', date: '2026-11-15', type: 'registration', description: 'Course registration for Semester 2 begins.' },
      { id: '5', title: 'Annual Tech Fest', date: '2026-11-10', type: 'event', description: 'Annual technical festival of the college.' },
      { id: '6', title: 'Mid-Term Exams', date: '2026-10-01', type: 'exam', description: 'Mid-semester examination period.' },
      { id: '7', title: 'Republic Day Holiday', date: '2027-01-26', type: 'holiday', description: 'College closed for Republic Day.' },
    ],
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
    placeholderData: () => [
      {
        id: '1', course_code: 'CS101', course_name: 'Introduction to Computer Science',
        total_classes: 20, present: 18, absent: 1, excused: 1, percentage: 90,
        records: Array.from({ length: 20 }, (_, i) => ({
          date: `2026-08-${String(i + 1).padStart(2, '0')}`,
          status: i === 5 ? 'absent' : i === 12 ? 'excused' : i === 8 ? 'late' : 'present',
        })),
      },
      {
        id: '2', course_code: 'MA101', course_name: 'Engineering Mathematics I',
        total_classes: 20, present: 16, absent: 3, excused: 1, percentage: 80,
        records: Array.from({ length: 20 }, (_, i) => ({
          date: `2026-08-${String(i + 1).padStart(2, '0')}`,
          status: i === 3 || i === 9 || i === 15 ? 'absent' : i === 18 ? 'excused' : 'present',
        })),
      },
      {
        id: '3', course_code: 'EE101', course_name: 'Basic Electronics',
        total_classes: 20, present: 19, absent: 0, excused: 1, percentage: 95,
        records: Array.from({ length: 20 }, (_, i) => ({
          date: `2026-08-${String(i + 1).padStart(2, '0')}`,
          status: i === 14 ? 'excused' : 'present',
        })),
      },
    ],
  });
}

// ============================================
// Documents
// ============================================

export interface DocumentRequest {
  id: string;
  type: string;
  status: 'requested' | 'processing' | 'ready' | 'issued';
  requested_at: string;
  issued_at?: string;
  file_url?: string;
}

export function useDocumentRequests() {
  const queryClient = useQueryClient();

  const query = useQuery<DocumentRequest[]>({
    queryKey: ['student-documents'],
    queryFn: () => apiClient.get('/api/v1/student/document-requests'),
    placeholderData: () => [
      { id: '1', type: 'Transcript', status: 'issued', requested_at: '2026-08-10', issued_at: '2026-08-15', file_url: '#' },
      { id: '2', type: 'Bonafide Certificate', status: 'processing', requested_at: '2026-08-20' },
    ],
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
    placeholderData: () => [
      {
        id: '1',
        subject: 'Grade discrepancy in MA101 Mid-Term',
        description: 'I believe there is an error in the grading of my mid-term exam for MA101. My calculated marks should be higher.',
        category: 'academic',
        priority: 'normal',
        status: 'in_review',
        created_at: '2026-08-15T10:00:00Z',
        replies: [
          { id: 'r1', message: 'We have received your grievance and are reviewing the exam papers. You will hear from us within 5 working days.', sender_role: 'admin', sender_name: 'Exam Committee', created_at: '2026-08-16T14:30:00Z' },
        ],
      },
    ],
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
