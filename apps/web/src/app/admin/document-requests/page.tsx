'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { useDocumentRequests, useUpdateDocumentRequestStatus } from '@/lib/hooks';
import { FileCheck, Clock, CheckCircle2, XCircle, Package, AlertTriangle } from 'lucide-react';

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  requested: { color: 'bg-yellow-500/10 text-yellow-600', icon: <Clock className="h-4 w-4" /> },
  processing: { color: 'bg-blue-500/10 text-blue-600', icon: <Package className="h-4 w-4" /> },
  ready: { color: 'bg-green-500/10 text-green-600', icon: <CheckCircle2 className="h-4 w-4" /> },
  issued: { color: 'bg-green-500/10 text-green-600', icon: <CheckCircle2 className="h-4 w-4" /> },
  rejected: { color: 'bg-red-500/10 text-red-600', icon: <XCircle className="h-4 w-4" /> },
};

const statusFlow: Record<string, string> = {
  requested: 'processing',
  processing: 'ready',
  ready: 'issued',
};

export default function DocumentRequestsPage() {
  const { data: requestsData, isLoading } = useDocumentRequests();
  const updateStatus = useUpdateDocumentRequestStatus();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const requests = requestsData?.data || [];
  const filtered = filterStatus === 'all' ? requests : requests.filter(r => r.status === filterStatus);

  const handleAdvanceStatus = async (id: string, currentStatus: string) => {
    const nextStatus = statusFlow[currentStatus];
    if (nextStatus) {
      try {
        await updateStatus.mutateAsync({ id, status: nextStatus });
      } catch (err) {
        console.error('Error updating status:', err);
      }
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateStatus.mutateAsync({ id, status: 'rejected', remarks: 'Rejected by admin' });
    } catch (err) {
      console.error('Error rejecting:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Requests</h1>
          <p className="text-muted-foreground">Manage student document requests.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Requested</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-600">{requests.filter(r => r.status === 'requested').length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Processing</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600">{requests.filter(r => r.status === 'processing').length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Ready</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{requests.filter(r => r.status === 'ready').length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Issued</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-emerald-600">{requests.filter(r => r.status === 'issued').length}</div></CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'requested', 'processing', 'ready', 'issued', 'rejected'].map((status) => (
          <Button key={status} variant={filterStatus === status ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card><CardContent className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </CardContent></Card>
        ) : filtered.length === 0 ? (
          <Card><CardContent><EmptyState title="No document requests" description="Student document requests will appear here." icon={<FileCheck className="h-8 w-8 text-muted-foreground" />} /></CardContent></Card>
        ) : (
          filtered.map((req) => {
            const config = statusConfig[req.status] || statusConfig.requested;
            return (
              <Card key={req.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted">
                        <FileCheck className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium">{req.request_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>Student: {req.student_id.substring(0, 8)}...</span>
                          <span>{new Date(req.created_at).toLocaleDateString()}</span>
                        </div>
                        {req.remarks && <p className="text-xs text-muted-foreground mt-1">{req.remarks}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={config.color}>
                        <span className="flex items-center gap-1">{config.icon} {req.status}</span>
                      </Badge>
                      {req.status !== 'issued' && req.status !== 'rejected' && (
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" onClick={() => handleAdvanceStatus(req.id, req.status)} disabled={updateStatus.isPending}>
                            Advance
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleReject(req.id)} disabled={updateStatus.isPending}>
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
