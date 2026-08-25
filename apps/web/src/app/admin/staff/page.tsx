'use client';

import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { Users } from 'lucide-react';

export default function StaffPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff</h1>
        <p className="text-muted-foreground">Manage staff accounts and role assignments.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <EmptyState
            title="No staff members"
            description="Invite staff members and assign their roles to get started."
            icon={<Users className="h-8 w-8 text-muted-foreground" />}
          />
        </CardContent>
      </Card>
    </div>
  );
}
