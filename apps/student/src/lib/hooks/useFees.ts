'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface FeeEntry {
  id: string;
  fee_type: string;
  amount: number;
  due_date: string;
  status: 'paid' | 'pending' | 'overdue' | 'partial';
  paid_amount?: number;
  paid_date?: string;
  receipt_url?: string;
  semester: string;
  reference_number?: string;
}

export interface FeePayment {
  id: string;
  receipt_number: string;
  amount: number;
  date: string;
  method: string;
  fee_type: string;
  status: 'verified' | 'pending' | 'rejected';
}

export function useFees() {
  return useQuery<FeeEntry[]>({
    queryKey: ['student-fees'],
    queryFn: () => apiClient.get('/api/v1/student/fees').then(r => (r as any).data || r),
    placeholderData: () => [],
  });
}

export function usePaymentHistory() {
  return useQuery<FeePayment[]>({
    queryKey: ['student-payments'],
    queryFn: () => apiClient.get('/api/v1/student/payments').then(r => (r as any).data || r),
    placeholderData: () => [],
  });
}
