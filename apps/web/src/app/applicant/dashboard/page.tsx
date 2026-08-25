'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Upload,
  Clock,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  GraduationCap,
  BookOpen,
  Bell,
} from 'lucide-react';

const applicationSteps = [
  { label: 'Application Started', status: 'completed', icon: <CheckCircle2 className="h-5 w-5 text-green-500" /> },
  { label: 'Documents Uploaded', status: 'completed', icon: <CheckCircle2 className="h-5 w-5 text-green-500" /> },
  { label: 'Under Review', status: 'current', icon: <Clock className="h-5 w-5 text-blue-500" /> },
  { label: 'Shortlisted', status: 'pending', icon: <div className="h-5 w-5 rounded-full border-2 border-muted" /> },
  { label: 'Offer Sent', status: 'pending', icon: <div className="h-5 w-5 rounded-full border-2 border-muted" /> },
  { label: 'Enrolled', status: 'pending', icon: <div className="h-5 w-5 rounded-full border-2 border-muted" /> },
];

const requiredDocuments = [
  { name: '10th Marksheet', status: 'uploaded', type: 'marksheet' },
  { name: '12th Marksheet', status: 'uploaded', type: 'marksheet' },
  { name: 'Aadhar Card', status: 'uploaded', type: 'id_proof' },
  { name: 'Category Certificate', status: 'pending', type: 'category_cert' },
  { name: 'Photograph', status: 'uploaded', type: 'photo' },
  { name: 'Signature', status: 'uploaded', type: 'signature' },
];

export default function ApplicantDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Application Tracker</h1>
          <p className="text-muted-foreground mt-1">Track your admission application progress.</p>
        </div>
        <Button asChild>
          <Link href="/apply">
            <FileText className="h-4 w-4 mr-2" />
            New Application
          </Link>
        </Button>
      </div>

      {/* Application Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Application Progress</CardTitle>
          <CardDescription>B.Tech Computer Science — 2025-26</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {applicationSteps.map((step, i) => (
              <div key={step.label} className="flex items-center">
                <div className="flex flex-col items-center">
                  {step.icon}
                  <span className="text-xs text-center mt-2 max-w-[80px]">{step.label}</span>
                </div>
                {i < applicationSteps.length - 1 && (
                  <div className={`h-0.5 w-12 mx-2 ${
                    step.status === 'completed' ? 'bg-green-500' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Application Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Application Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Program</p>
                <p className="font-medium">B.Tech Computer Science</p>
              </div>
              <div>
                <p className="text-muted-foreground">Institution</p>
                <p className="font-medium">Delhi Technical University</p>
              </div>
              <div>
                <p className="text-muted-foreground">Application ID</p>
                <p className="font-medium font-mono text-xs">APP-2025-001</p>
              </div>
              <div>
                <p className="text-muted-foreground">Submitted</p>
                <p className="font-medium">Jun 1, 2025</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">Under Review</Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Merit Rank</p>
                <p className="font-medium">—</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Documents</CardTitle>
              <CardDescription>Upload status for required documents</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-1" />
              Upload
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requiredDocuments.map((doc) => (
                <div key={doc.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {doc.status === 'uploaded' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm">{doc.name}</span>
                  </div>
                  <Badge variant={doc.status === 'uploaded' ? 'secondary' : 'outline'} className={
                    doc.status === 'uploaded' ? 'bg-green-500/10 text-green-600' : 'text-yellow-600'
                  }>
                    {doc.status === 'uploaded' ? 'Uploaded' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Start New Application', icon: <FileText className="h-4 w-4" />, href: '/apply' },
              { label: 'Upload Documents', icon: <Upload className="h-4 w-4" />, href: '/applicant/documents' },
              { label: 'View Notices', icon: <Bell className="h-4 w-4" />, href: '/applicant/notices' },
              { label: 'Contact Support', icon: <BookOpen className="h-4 w-4" />, href: '/applicant/support' },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-2 rounded-lg border p-3 text-sm font-medium hover:bg-accent transition-colors"
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
