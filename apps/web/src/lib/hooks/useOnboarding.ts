'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface OnboardingStatus {
  onboarded: boolean;
  user: {
    id: string;
    institution_id: string | null;
    role: string;
    full_name: string | null;
    email: string;
  } | null;
}

export function useOnboardingStatus() {
  return useQuery({
    queryKey: ['onboarding-status'],
    queryFn: () => apiClient.get<{ data: OnboardingStatus }>('/api/v1/onboarding/status'),
    retry: false,
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      institution_name: string;
      institution_type: 'government' | 'private' | 'deemed';
      short_name?: string;
      address?: string;
      website?: string;
    }) => apiClient.post<{ data: { institution: { id: string } } }>('/api/v1/onboarding/complete', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
    },
  });
}
