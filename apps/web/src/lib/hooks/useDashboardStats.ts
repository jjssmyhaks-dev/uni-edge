'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface DashboardStats {
  totalStudents: number;
  activePrograms: number;
  totalApplications: number;
  pendingReview: number;
  upcomingExamCount: number;
  upcomingExams: { name: string; date: string; status: string }[];
  studentsThisMonth: number;
  enrollmentTrend: { month: string; count: number }[];
  attendanceTrend: { day: string; rate: number }[];
  recentNotices: { id: string; date: string | null }[];
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiClient.get<{ data: DashboardStats }>('/api/v1/dashboard'),
    staleTime: 30_000,
  });
}
