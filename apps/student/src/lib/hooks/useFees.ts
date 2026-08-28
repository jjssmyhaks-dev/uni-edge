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
    queryFn: () => apiClient.get('/api/student/fees'),
    placeholderData: () => [
      { id: '1', fee_type: 'Semester Tuition Fee', amount: 25000, due_date: '2026-08-15', status: 'paid', paid_amount: 25000, paid_date: '2026-08-10', receipt_url: '#', semester: 'Semester 1', reference_number: 'SBI-2026-001' },
      { id: '2', fee_type: 'Hostel Fee', amount: 15000, due_date: '2026-08-15', status: 'paid', paid_amount: 15000, paid_date: '2026-08-12', semester: 'Semester 1', reference_number: 'SBI-2026-002' },
      { id: '3', fee_type: 'Exam Fee', amount: 2000, due_date: '2026-09-30', status: 'pending', semester: 'Semester 1' },
      { id: '4', fee_type: 'Library Fee', amount: 500, due_date: '2026-08-15', status: 'paid', paid_amount: 500, paid_date: '2026-08-10', semester: 'Semester 1', reference_number: 'SBI-2026-003' },
      { id: '5', fee_type: 'Lab Fee', amount: 3000, due_date: '2026-09-30', status: 'pending', semester: 'Semester 1' },
    ],
  });
}

export function usePaymentHistory() {
  return useQuery<FeePayment[]>({
    queryKey: ['student-payments'],
    queryFn: () => apiClient.get('/api/student/payments'),
    placeholderData: () => [
      { id: '1', receipt_number: 'REC-2026-001', amount: 25000, date: '2026-08-10', method: 'SBI Collect', fee_type: 'Semester Tuition Fee', status: 'verified' },
      { id: '2', receipt_number: 'REC-2026-002', amount: 15000, date: '2026-08-12', method: 'SBI Collect', fee_type: 'Hostel Fee', status: 'verified' },
      { id: '3', receipt_number: 'REC-2026-003', amount: 500, date: '2026-08-10', method: 'SBI Collect', fee_type: 'Library Fee', status: 'verified' },
    ],
  });
}
