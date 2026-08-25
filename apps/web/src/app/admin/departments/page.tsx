'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { Plus, BookOpen } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  code: string | null;
}

export default function DepartmentsPage() {
  const { getToken } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_EXPRESS_API_URL}/api/v1/departments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Failed to fetch departments');
      return res.json() as Promise<{ data: Department[] }>;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">Manage academic departments.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          New Department
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
              title="No departments yet"
              description="Create your first department to organize programs."
              icon={<BookOpen className="h-8 w-8 text-muted-foreground" />}
            />
          ) : (
            <div className="divide-y">
              {data.data.map((dept) => (
                <div key={dept.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <span className="font-medium">{dept.name}</span>
                    {dept.code && (
                      <span className="ml-2 text-sm text-muted-foreground">({dept.code})</span>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
