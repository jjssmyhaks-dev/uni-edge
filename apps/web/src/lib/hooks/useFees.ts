'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// ============================================
// Types
// ============================================

export interface FeeCategory {
  id: string;
  institution_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface FeeStructure {
  id: string;
  institution_id: string;
  fee_category_id: string;
  program_id: string | null;
  admission_cycle_id: string | null;
  amount: number;
  description: string | null;
  academic_year: string | null;
  is_active: boolean;
  created_at: string;
  fee_categories?: { name: string };
}

export interface Invoice {
  id: string;
  institution_id: string;
  student_id: string | null;
  application_id: string | null;
  fee_structure_id: string;
  invoice_number: string;
  amount: number;
  status: string;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  fee_structures?: { amount: number; fee_categories?: { name: string } };
  students?: { enrollment_number: string };
}

export interface Payment {
  id: string;
  institution_id: string;
  invoice_id: string;
  amount: number;
  payment_method: string;
  receipt_url: string | null;
  receipt_file_url: string | null;
  sbi_collect_reference: string | null;
  sbi_collect_student_name: string | null;
  sbi_collect_institution_code: string | null;
  sbi_collect_payment_date: string | null;
  status: string;
  verified_by: string | null;
  verified_at: string | null;
  remarks: string | null;
  created_at: string;
  invoices?: { invoice_number: string; amount: number; students?: { enrollment_number: string } };
}

export interface FeeSummary {
  totalBilled: number;
  totalCollected: number;
  pendingAmount: number;
  pendingVerification: number;
  overdueCount: number;
  paidCount: number;
  totalInvoices: number;
}

// ============================================
// Fee Categories
// ============================================

export function useFeeCategories() {
  return useQuery({
    queryKey: ['fee-categories'],
    queryFn: () => apiClient.get<{ data: FeeCategory[] }>('/api/v1/fees/categories'),
  });
}

export function useCreateFeeCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      apiClient.post<{ data: FeeCategory }>('/api/v1/fees/categories', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fee-categories'] }),
  });
}

// ============================================
// Fee Structures
// ============================================

export function useFeeStructures(params?: { program_id?: string }) {
  const sp = new URLSearchParams();
  if (params?.program_id) sp.set('program_id', params.program_id);
  const q = sp.toString() ? `?${sp}` : '';
  return useQuery({
    queryKey: ['fee-structures', params],
    queryFn: () => apiClient.get<{ data: FeeStructure[] }>(`/api/v1/fees/structures${q}`),
  });
}

export function useCreateFeeStructure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { fee_category_id: string; program_id?: string; amount: number; description?: string; academic_year?: string }) =>
      apiClient.post<{ data: FeeStructure }>('/api/v1/fees/structures', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fee-structures'] }),
  });
}

// ============================================
// Invoices
// ============================================

export function useInvoices(params?: { status?: string; student_id?: string }) {
  const sp = new URLSearchParams();
  if (params?.status) sp.set('status', params.status);
  if (params?.student_id) sp.set('student_id', params.student_id);
  const q = sp.toString() ? `?${sp}` : '';
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => apiClient.get<{ data: Invoice[] }>(`/api/v1/fees/invoices${q}`),
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { student_id?: string; fee_structure_id: string; amount: number; due_date?: string; notes?: string }) =>
      apiClient.post<{ data: Invoice }>('/api/v1/fees/invoices', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; status?: string; notes?: string }) =>
      apiClient.patch<{ data: Invoice }>(`/api/v1/fees/invoices/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

// ============================================
// Payments
// ============================================

export function usePayments(params?: { status?: string; invoice_id?: string }) {
  const sp = new URLSearchParams();
  if (params?.status) sp.set('status', params.status);
  if (params?.invoice_id) sp.set('invoice_id', params.invoice_id);
  const q = sp.toString() ? `?${sp}` : '';
  return useQuery({
    queryKey: ['payments', params],
    queryFn: () => apiClient.get<{ data: Payment[] }>(`/api/v1/fees/payments${q}`),
  });
}

export function useSubmitPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      invoice_id: string;
      amount: number;
      payment_method: string;
      receipt_file_url?: string;
      sbi_collect_reference?: string;
      sbi_collect_student_name?: string;
      sbi_collect_institution_code?: string;
      sbi_collect_payment_date?: string;
      remarks?: string;
    }) => apiClient.post<{ data: Payment }>('/api/v1/fees/payments', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
  });
}

export function useVerifyPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, remarks }: { id: string; status: 'verified' | 'rejected'; remarks?: string }) =>
      apiClient.patch<{ data: Payment }>(`/api/v1/fees/payments/${id}/verify`, { status, remarks }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['fee-summary'] });
    },
  });
}

// ============================================
// Fee Summary
// ============================================

export function useFeeSummary() {
  return useQuery({
    queryKey: ['fee-summary'],
    queryFn: () => apiClient.get<{ data: FeeSummary }>('/api/v1/fees/summary'),
  });
}
