'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { Users } from 'lucide-react';

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Students</h1>
        <p className="text-muted-foreground">Student directory and records management.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <EmptyState
            title="No students enrolled yet"
            description="Students will appear here once they are admitted through the admissions module."
            icon={<Users className="h-8 w-8 text-muted-foreground" />}
          />
        </CardContent>
      </Card>
    </div>
  );
}
