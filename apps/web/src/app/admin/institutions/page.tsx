'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { capitalize } from '@/lib/utils';
import { Building2, Plus } from 'lucide-react';

interface Institution {
  id: string;
  name: string;
  short_name: string | null;
  type: string;
}

export default function InstitutionsPage() {
  const { getToken } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['institutions'],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_EXPRESS_API_URL}/api/v1/institutions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Failed to fetch institutions');
      return res.json() as Promise<{ data: Institution[] }>;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Institutions</h1>
          <p className="text-muted-foreground">Manage institutions on the platform.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Add Institution
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : !data?.data?.length ? (
            <EmptyState
              title="No institutions yet"
              description="Add your first institution to start onboarding."
              icon={<Building2 className="h-8 w-8 text-muted-foreground" />}
            />
          ) : (
            <div className="divide-y">
              {data.data.map((inst) => (
                <div key={inst.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <span className="font-medium">{inst.name}</span>
                    {inst.short_name && (
                      <span className="ml-2 text-sm text-muted-foreground">({inst.short_name})</span>
                    )}
                  </div>
                  <StatusBadge status={capitalize(inst.type)} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
