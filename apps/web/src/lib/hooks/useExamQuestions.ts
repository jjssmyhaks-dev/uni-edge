'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface ExamQuestion {
  id: string;
  institution_id: string;
  exam_id: string;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string | null;
  marks: number;
  question_order: number;
  is_active: boolean;
  created_at: string;
}

export function useExamQuestions(examId: string) {
  return useQuery({
    queryKey: ['exam-questions', examId],
    queryFn: () => apiClient.get<{ data: ExamQuestion[] }>(`/api/v1/exam-questions/${examId}`),
    enabled: !!examId,
  });
}

export function useCreateExamQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ examId, ...data }: { examId: string; question_text: string; question_type?: string; options: string[]; correct_answer?: string; marks?: number }) =>
      apiClient.post<{ data: ExamQuestion }>(`/api/v1/exam-questions/${examId}`, data),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['exam-questions', vars.examId] }),
  });
}

export function useBulkUploadQuestions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ examId, questions }: { examId: string; questions: { question_text: string; question_type?: string; options: string[]; correct_answer?: string; marks?: number }[] }) =>
      apiClient.post<{ data: { count: number } }>(`/api/v1/exam-questions/${examId}/bulk`, { questions }),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['exam-questions', vars.examId] }),
  });
}

export function useDeleteExamQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<{ data: { message: string } }>(`/api/v1/exam-questions/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exam-questions'] }),
  });
}
