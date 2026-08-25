'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEntranceExamSchema } from '@uni-edge/types';
import type { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

type FormData = z.infer<typeof createEntranceExamSchema>;

export default function NewEntranceExamPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(createEntranceExamSchema),
    defaultValues: { mode: 'offline' as const },
  });

  const { data: cycles } = useQuery({
    queryKey: ['admission-cycles'],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_EXPRESS_API_URL}/api/v1/admission-cycles?status=active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_EXPRESS_API_URL}/api/v1/entrance-exams`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create');
      }
      router.push('/admin/exams/entrance');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">New Entrance Exam</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exam Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Admission Cycle */}
            <div>
              <label className="block text-sm font-medium mb-1">Admission Cycle *</label>
              <select {...register('cycle_id')} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                <option value="">Select cycle...</option>
                {cycles?.data?.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.programs?.name} — {c.academic_year}
                  </option>
                ))}
              </select>
              {errors.cycle_id && <p className="text-destructive text-xs mt-1">{errors.cycle_id.message}</p>}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Exam Name *</label>
              <input {...register('name')} className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="e.g., DTU B.Tech CSE Entrance 2026" />
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea {...register('description')} className="w-full rounded-md border bg-background px-3 py-2 text-sm" rows={3} />
            </div>

            {/* Date, Time, Duration */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Exam Date</label>
                <input type="date" {...register('exam_date')} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <input type="time" {...register('exam_time')} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (min)</label>
                <input type="number" {...register('duration_minutes', { valueAsNumber: true })} className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="180" />
              </div>
            </div>

            {/* Mode, Marks */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mode *</label>
                <select {...register('mode')} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                  <option value="offline">Offline</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Marks</label>
                <input type="number" {...register('total_marks', { valueAsNumber: true })} className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="300" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Passing Marks</label>
                <input type="number" {...register('passing_marks', { valueAsNumber: true })} className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="90" />
              </div>
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Exam'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
