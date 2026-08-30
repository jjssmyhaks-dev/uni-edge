'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// ============================================
// Job Postings (Career Board)
// ============================================

export interface JobPosting {
  id: string;
  title: string;
  description: string;
  company_name: string;
  company_logo_url?: string;
  job_type: 'full_time' | 'part_time' | 'internship' | 'contract' | 'apprenticeship';
  location: string;
  is_remote: boolean;
  salary_range: string;
  required_skills: string[];
  application_link?: string;
  application_email?: string;
  eligibility?: string;
  deadline: string;
  created_at: string;
  users?: { full_name: string };
}

export function useJobPostings() {
  return useQuery<JobPosting[]>({
    queryKey: ['student-job-postings'],
    queryFn: () => apiClient.get('/api/v1/student/job-postings').then((r: any) => r.data || []),
    placeholderData: () => [],
  });
}

// ============================================
// Course Materials
// ============================================

export interface CourseMaterial {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  file_name?: string;
  file_size?: number;
  material_type: 'document' | 'video' | 'link' | 'slides' | 'code' | 'other';
  uploaded_by?: string;
  created_at: string;
  users?: { full_name: string };
}

export function useCourseMaterials(courseOfferingId?: string) {
  return useQuery<CourseMaterial[]>({
    queryKey: ['student-course-materials', courseOfferingId],
    queryFn: () => apiClient.get(`/api/v1/student/course-materials?course_offering_id=${courseOfferingId}`).then((r: any) => r.data || []),
    enabled: !!courseOfferingId,
    placeholderData: () => [],
  });
}

// ============================================
// Course Announcements
// ============================================

export interface CourseAnnouncement {
  id: string;
  title: string;
  content: string;
  scope: 'institution' | 'course';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  published_at: string;
  is_pinned: boolean;
  course_offerings?: {
    courses?: { course_name: string; course_code: string };
  };
  users?: { full_name: string };
}

export function useCourseAnnouncements(courseOfferingId?: string) {
  return useQuery<CourseAnnouncement[]>({
    queryKey: ['student-course-announcements', courseOfferingId],
    queryFn: () => {
      const url = courseOfferingId
        ? `/api/v1/student/announcements?course_offering_id=${courseOfferingId}`
        : '/api/v1/student/announcements';
      return apiClient.get(url).then((r: any) => r.data || []);
    },
    placeholderData: () => [],
  });
}
