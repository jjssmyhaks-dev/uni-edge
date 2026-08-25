'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Plus, GraduationCap } from 'lucide-react';

interface Program {
  id: string;
  name: string;
  code: string | null;
  degree_level: string;
  total_seats: number | null;
  is_active: boolean;
  departments?: { name: string; code: string }[] | { name: string; code: string };
}

export default function ProgramsPage() {
  const { getToken } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_EXPRESS_API_URL}/api/v1/programs`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Failed to fetch programs');
      return res.json() as Promise<{ data: Program[] }>;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Programs</h1>
          <p className="text-muted-foreground">Manage academic programs and intake configuration.</p>
        </div>
        <Button asChild>
          <Link href="/admin/programs/new">
            <Plus className="h-4 w-4" />
            New Program
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : error ? (
            <div className="py-12 text-center text-destructive">
              Failed to load programs. Please try again.
            </div>
          ) : !data?.data?.length ? (
            <EmptyState
              title="No programs yet"
              description="Create your first academic program to get started."
              icon={<GraduationCap className="h-8 w-8 text-muted-foreground" />}
              action={{
                label: 'Create Program',
                onClick: () => window.location.href = '/admin/programs/new',
              }}
            />
          ) : (
            <div className="divide-y">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-muted-foreground">
                <div className="col-span-4">Name</div>
                <div className="col-span-2">Department</div>
                <div className="col-span-2">Level</div>
                <div className="col-span-2">Seats</div>
                <div className="col-span-2">Status</div>
              </div>
              {/* Table Rows */}
              {data.data.map((program) => (
                <Link
                  key={program.id}
                  href={`/admin/programs/${program.id}`}
                  className="grid grid-cols-12 gap-4 px-6 py-4 text-sm hover:bg-accent/50 transition-colors"
                >
                  <div className="col-span-4 font-medium">
                    {program.name}
                    {program.code && (
                      <span className="ml-2 text-muted-foreground">({program.code})</span>
                    )}
                  </div>
                  <div className="col-span-2 text-muted-foreground">
                    {Array.isArray(program.departments) ? program.departments[0]?.name : program.departments?.name || '—'}
                  </div>
                  <div className="col-span-2 capitalize">
                    {program.degree_level.replace(/_/g, ' ')}
                  </div>
                  <div className="col-span-2">{program.total_seats ?? '—'}</div>
                  <div className="col-span-2">
                    <StatusBadge status={program.is_active ? 'active' : 'inactive'} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
