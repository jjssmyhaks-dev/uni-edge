'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, Monitor, ClipboardCheck, Ticket, Camera, FileText } from 'lucide-react';

export default function ExamsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Examinations</h1>
          <p className="text-muted-foreground">Manage entrance exams, regular exams, hall tickets, and online proctoring.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Entrance Exams */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Entrance Exams</CardTitle>
                <CardDescription>Admission entrance examinations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Create and manage entrance exams, register candidates, upload scores,
              and generate merit lists.
            </p>
            <Button asChild>
              <Link href="/admin/exams/entrance">Manage</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Regular Exams */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Regular Exams</CardTitle>
                <CardDescription>Scheduled program examinations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Schedule exams by term, allocate rooms, manage invigilator assignments,
              and enter/publish results.
            </p>
            <Button asChild>
              <Link href="/admin/exams/regular">Manage</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Hall Tickets */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <Ticket className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Hall Tickets</CardTitle>
                <CardDescription>Exam admit cards & tickets</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Auto-generate hall tickets with seat numbers, issue and print
              admit cards for regular examinations.
            </p>
            <Button asChild>
              <Link href="/admin/exams/hall-tickets">Manage</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Online Proctored */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-100 p-2">
                <Camera className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Online Proctoring</CardTitle>
                <CardDescription>AI-proctored online examinations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Deliver online exams with webcam monitoring, browser lockdown,
              and automated anti-cheating detection with human review queue.
            </p>
            <Button asChild>
              <Link href="/admin/exams/proctoring">Manage</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
