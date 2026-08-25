'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef } from '@/components/data-table/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';
import { Plus, ArrowLeft } from 'lucide-react';

interface Exam {
  id: string;
  name: string;
  exam_date: string | null;
  mode: string | null;
  total_marks: number | null;
  status: string;
  admission_cycles?: { academic_year: string; programs?: { name: string } };
}

const columns: ColumnDef<Exam>[] = [
  { id: 'name', header: 'Exam Name', accessorKey: 'name', sortable: true },
  {
    id: 'program',
    header: 'Program',
    sortable: false,
    accessorFn: (row) => row.admission_cycles?.programs?.name || '—',
  },
  {
    id: 'date',
    header: 'Date',
    accessorKey: 'exam_date',
    sortable: true,
    accessorFn: (row) => formatDate(row.exam_date || '—'),
  },
  { id: 'mode', header: 'Mode', accessorKey: 'mode', sortable: true, accessorFn: (row) => row.mode ? row.mode.charAt(0).toUpperCase() + row.mode.slice(1) : '—' },
  { id: 'marks', header: 'Total Marks', accessorKey: 'total_marks', sortable: true },
  { id: 'status', header: 'Status', sortable: true, accessorFn: (row) => <StatusBadge status={row.status} /> },
];

export default function EntranceExamsPage() {
  const router = useRouter();
  const { getToken } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['entrance-exams'],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_EXPRESS_API_URL}/api/v1/entrance-exams`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json() as Promise<{ data: Exam[] }>;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin/exams')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Entrance Exams</h1>
          </div>
          <p className="text-muted-foreground">Create and manage entrance examinations.</p>
        </div>
        <Button asChild>
          <Link href="/admin/exams/entrance/new">
            <Plus className="h-4 w-4" />
            New Exam
          </Link>
        </Button>
      </div>

      <DataTable
        data={(data?.data as any) || []}
        columns={columns}
        loading={isLoading}
        searchable
        searchPlaceholder="Search exams..."
        searchKeys={['name']}
        onRowClick={(row) => router.push(`/admin/exams/entrance/${row.id}`)}
        emptyMessage="No entrance exams created yet."
      />
    </div>
  );
}
