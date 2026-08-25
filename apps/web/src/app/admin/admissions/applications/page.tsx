'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, ColumnDef } from '@/components/data-table/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Send, CheckCircle, XCircle } from 'lucide-react';

interface Application {
  id: string;
  applicant_name: string;
  applicant_email: string | null;
  status: string;
  merit_rank: number | null;
  submitted_at: string | null;
  form_data: Record<string, any>;
  admission_cycles?: { academic_year: string; programs?: { name: string } };
}

export default function ApplicationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [action, setAction] = useState<'shortlist' | 'reject' | 'send_offer' | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_EXPRESS_API_URL}/api/v1/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed');
      return res.json() as Promise<{ data: Application[] }>;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_EXPRESS_API_URL}/api/v1/applications/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setSelectedApp(null);
      setAction(null);
    },
  });

  const columns: ColumnDef<Application>[] = [
    { id: 'name', header: 'Applicant', accessorKey: 'applicant_name', sortable: true },
    { id: 'email', header: 'Email', accessorKey: 'applicant_email' },
    {
      id: 'program',
      header: 'Program',
      accessorFn: (row) => row.admission_cycles?.programs?.name || '—',
    },
    {
      id: '12th',
      header: '12th %',
      accessorFn: (row) => row.form_data?.['12th_percentage'] ?? '—',
      sortable: true,
    },
    { id: 'category', header: 'Category', accessorFn: (row) => row.form_data?.category || '—' },
    { id: 'rank', header: 'Rank', accessorKey: 'merit_rank', sortable: true },
    {
      id: 'submitted',
      header: 'Submitted',
      accessorFn: (row) => row.submitted_at ? formatDate(row.submitted_at) : '—',
    },
    { id: 'status', header: 'Status', sortable: true, accessorFn: (row) => <StatusBadge status={row.status} /> },
  ];

  const handleAction = (app: Application, act: typeof action) => {
    setSelectedApp(app);
    setAction(act);
  };

  const confirmAction = () => {
    if (!selectedApp || !action) return;
    const statusMap: Record<string, string> = {
      shortlist: 'shortlisted',
      reject: 'rejected',
      send_offer: 'offer_sent',
    };
    updateStatus.mutate({ id: selectedApp.id, status: statusMap[action] });
  };

  const actionLabels = {
    shortlist: { title: 'Shortlist Application', desc: `Shortlist ${selectedApp?.applicant_name}?`, confirm: 'Shortlist' },
    reject: { title: 'Reject Application', desc: `Reject ${selectedApp?.applicant_name}? This cannot be undone.`, confirm: 'Reject' },
    send_offer: { title: 'Send Offer', desc: `Send admission offer to ${selectedApp?.applicant_name}?`, confirm: 'Send Offer' },
  };

  const stats = data?.data || [];
  const submittedCount = stats.filter((a) => a.status === 'submitted').length;
  const shortlistedCount = stats.filter((a) => a.status === 'shortlisted').length;
  const offerCount = stats.filter((a) => a.status === 'offer_sent').length;
  const confirmedCount = stats.filter((a) => a.status === 'confirmed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.push('/admin/admissions')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground">Review and manage admission applications.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Submitted', value: submittedCount, color: 'text-blue-600' },
          { label: 'Shortlisted', value: shortlistedCount, color: 'text-success' },
          { label: 'Offers Sent', value: offerCount, color: 'text-warning-foreground' },
          { label: 'Confirmed', value: confirmedCount, color: 'text-success' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-4 text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Applications Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            data={(data?.data as any) || []}
            columns={columns}
            loading={isLoading}
            searchable
            searchPlaceholder="Search by name or email..."
            searchKeys={['applicant_name', 'applicant_email']}
            emptyMessage="No applications received yet."
            onRowClick={(row) => {
              /* Could open detail modal */
            }}
          />
        </CardContent>
      </Card>

      {/* Quick Actions for selected row — contextual buttons appear on hover */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select an application from the table above, then use the action buttons
            to shortlist, send offers, or reject applications.
          </p>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={!selectedApp}
              onClick={() => selectedApp && handleAction(selectedApp, 'shortlist')}
            >
              <CheckCircle className="h-4 w-4 mr-1" /> Shortlist
            </Button>
            <Button
              size="sm"
              disabled={!selectedApp}
              onClick={() => selectedApp && handleAction(selectedApp, 'send_offer')}
            >
              <Send className="h-4 w-4 mr-1" /> Send Offer
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={!selectedApp}
              onClick={() => selectedApp && handleAction(selectedApp, 'reject')}
            >
              <XCircle className="h-4 w-4 mr-1" /> Reject
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {action && selectedApp && (
        <ConfirmationDialog
          open={!!action}
          onOpenChange={(open) => { if (!open) { setAction(null); setSelectedApp(null); } }}
          title={actionLabels[action].title}
          description={actionLabels[action].desc}
          confirmLabel={actionLabels[action].confirm}
          variant={action === 'reject' ? 'destructive' : 'default'}
          onConfirm={confirmAction}
          loading={updateStatus.isPending}
        />
      )}
    </div>
  );
}
