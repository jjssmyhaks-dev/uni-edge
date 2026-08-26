'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface ExamSubmission {
  id: string;
  institution_id: string;
  exam_id: string;
  student_id: string | null;
  candidate_id: string | null;
  status: string;
  started_at: string | null;
  submitted_at: string | null;
  time_limit_minutes: number;
  total_marks: number;
  marks_obtained: number;
  score_percentage: number;
  answers: Record<string, string>;
  questions?: {
    id: string;
    question_text: string;
    question_type: string;
    options: string[];
    correct_answer?: string;
    marks: number;
    question_order: number;
  }[];
  entrance_exams?: { name: string; duration_minutes: number; total_marks_computed: number; question_count: number };
  students?: { enrollment_number: string; users?: { full_name: string } };
  exam_candidates?: { candidate_name: string; candidate_email: string };
}

export function useStartExam() {
  return useMutation({
    mutationFn: (data: { exam_id: string }) =>
      apiClient.post<{ data: ExamSubmission }>('/api/v1/exam-submissions/start', data),
  });
}

export function useExamSubmission(id: string) {
  return useQuery({
    queryKey: ['exam-submission', id],
    queryFn: () => apiClient.get<{ data: ExamSubmission }>(`/api/v1/exam-submissions/${id}`),
    enabled: !!id,
    refetchInterval: (query) => {
      // Auto-refetch while exam is in progress
      return query.state.data?.data?.status === 'in_progress' ? 5000 : false;
    },
  });
}

export function useSaveAnswer() {
  return useMutation({
    mutationFn: ({ submissionId, questionId, answer }: { submissionId: string; questionId: string; answer: string }) =>
      apiClient.post<{ data: { saved: boolean } }>(`/api/v1/exam-submissions/${submissionId}/answer`, {
        question_id: questionId,
        answer,
      }),
  });
}

export function useSubmitExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (submissionId: string) =>
      apiClient.post<{ data: ExamSubmission }>(`/api/v1/exam-submissions/${submissionId}/submit`, {}),
    onSuccess: (_, id) => qc.invalidateQueries({ queryKey: ['exam-submission', id] }),
  });
}

export function useExamResult(id: string) {
  return useQuery({
    queryKey: ['exam-result', id],
    queryFn: () => apiClient.get<{ data: Partial<ExamSubmission> }>(`/api/v1/exam-submissions/${id}/result`),
    enabled: !!id,
  });
}

export function useAllSubmissions(examId?: string) {
  const q = examId ? `?exam_id=${examId}` : '';
  return useQuery({
    queryKey: ['exam-submissions-all', examId],
    queryFn: () => apiClient.get<{ data: ExamSubmission[] }>(`/api/v1/exam-submissions/admin/all${q}`),
  });
}
