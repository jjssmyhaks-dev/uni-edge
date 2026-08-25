'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDateTime, capitalize } from '@/lib/utils';
import { Shield } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  created_at: string;
  users?: { full_name: string | null; email: string } | null;
}

export default function AuditLogsPage() {
  const { getToken } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_EXPRESS_API_URL}/api/v1/audit-logs?per_page=50`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">
          Track all sensitive actions across the platform.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : !data?.data?.length ? (
            <EmptyState
              title="No audit logs yet"
              description="Audit events will appear here as actions are performed."
              icon={<Shield className="h-8 w-8 text-muted-foreground" />}
            />
          ) : (
            <div className="divide-y">
              {data.data.map((log: AuditLogEntry) => (
                <div key={log.id} className="flex items-center justify-between px-6 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{capitalize(log.action)}</Badge>
                    <span className="text-muted-foreground">{log.entity_type}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-muted-foreground">
                      {log.users?.full_name || log.users?.email || 'System'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDateTime(log.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
