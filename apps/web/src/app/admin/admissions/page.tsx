'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, Award } from 'lucide-react';

export default function AdmissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admissions</h1>
        <p className="text-muted-foreground">Manage admission cycles, applications, and enrollments.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Applications</CardTitle>
                <CardDescription>Review and manage applications</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Review submitted applications, shortlist candidates, and send offer letters.
            </p>
            <Button asChild variant="outline">
              <Link href="/admin/admissions/applications">View Applications</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Merit Lists</CardTitle>
                <CardDescription>Generate and publish merit lists</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Generate category-wise merit lists and publish results to candidates.
            </p>
            <Button asChild variant="outline">
              <Link href="/admin/admissions/merit-lists">Manage Merit Lists</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Enrollment</CardTitle>
                <CardDescription>Confirm and finalize enrollments</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Track seat confirmations and create student accounts.
            </p>
            <Button asChild variant="outline">
              <Link href="/admin/admissions/enrollment">Manage Enrollment</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
