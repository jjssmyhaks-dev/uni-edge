'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApplication, useApplicationDocuments } from '@/lib/hooks/useApplications';
import { apiClient } from '@/lib/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Loader2,
  Download,
  Shield,
  Calendar,
} from 'lucide-react';

const STATUS_STEPS = ['submitted', 'under_review', 'shortlisted', 'offer_sent', 'confirmed'];

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  shortlisted: 'Shortlisted',
  offer_sent: 'Offer Sent',
  confirmed: 'Enrolled',
  rejected: 'Rejected',
  waitlisted: 'Waitlisted',
};

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const qc = useQueryClient();

  const { data: appData, isLoading } = useApplication(id);
  const { data: docsData } = useApplicationDocuments(id);
  const app = appData?.data;
  const docs = docsData?.data || [];

  const confirmEnrollment = useMutation({
    mutationFn: () => apiClient.post<{ data: any }>(`/api/v1/applications/${id}/confirm`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications', id] });
      qc.invalidateQueries({ queryKey: ['my-applications'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Application not found</p>
        <Button variant="ghost" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Go Back
        </Button>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(app.status);
  const formPersonal = (app.form_data as any)?.personal || {};

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Application Detail</h1>
          <p className="text-muted-foreground text-sm font-mono">{app.id}</p>
        </div>
      </div>

      {/* Status Timeline */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            {STATUS_STEPS.map((step, i) => {
              const isCompleted = currentStepIndex >= i;
              const isCurrent = currentStepIndex === i;
              const isRejected = app.status === 'rejected' && i === currentStepIndex;
              return (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isRejected ? 'bg-red-500 text-white' :
                      isCompleted ? 'bg-primary text-primary-foreground' :
                      'bg-muted text-muted-foreground'
                    } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                      {isCompleted && !isRejected ? <CheckCircle className="h-4 w-4" /> : i + 1}
                    </div>
                    <p className={`text-xs mt-1.5 ${isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {STATUS_LABELS[step] || step}
                    </p>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 ${currentStepIndex > i ? 'bg-primary' : 'bg-muted'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{app.applicant_name}</span></div>
            <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{app.applicant_email}</span></div>
            {formPersonal.phone && <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{formPersonal.phone}</span></div>}
            {formPersonal.dateOfBirth && <div><span className="text-muted-foreground">DOB:</span> <span className="font-medium">{formPersonal.dateOfBirth}</span></div>}
            {formPersonal.gender && <div><span className="text-muted-foreground">Gender:</span> <span className="font-medium capitalize">{formPersonal.gender}</span></div>}
            {formPersonal.category && <div><span className="text-muted-foreground">Category:</span> <span className="font-medium uppercase">{formPersonal.category}</span></div>}
            {formPersonal.address && (
              <div className="col-span-2"><span className="text-muted-foreground">Address:</span> <span className="font-medium">
                {formPersonal.address?.full || ''}{formPersonal.address?.city ? `, ${formPersonal.address.city}` : ''}{formPersonal.address?.state ? `, ${formPersonal.address.state}` : ''} {formPersonal.address?.pincode || ''}
              </span></div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Documents</CardTitle>
          <CardDescription className="text-xs">Verification status of uploaded documents</CardDescription>
        </CardHeader>
        <CardContent>
          {docs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No documents uploaded</p>
          ) : (
            <div className="space-y-2">
              {docs.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm capitalize">{doc.document_type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={`text-xs ${
                      doc.verification_status === 'verified' ? 'bg-green-500/10 text-green-700' :
                      doc.verification_status === 'rejected' ? 'bg-red-500/10 text-red-700' :
                      'bg-yellow-500/10 text-yellow-700'
                    }`}>
                      {doc.verification_status}
                    </Badge>
                    {doc.file_url && (
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Merit Rank */}
      {app.merit_rank && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Merit Rank</p>
                <p className="text-2xl font-bold">#{app.merit_rank}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Offer Actions */}
      {app.status === 'offer_sent' && (
        <Card className="border-green-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-700">Offer Letter Received</h3>
                <p className="text-sm text-muted-foreground">Congratulations! You have been offered admission. Please confirm to enroll.</p>
              </div>
              <Button onClick={() => confirmEnrollment.mutate()} disabled={confirmEnrollment.isPending}>
                {confirmEnrollment.isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1.5" />}
                Accept & Enroll
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {app.status === 'waitlisted' && (
        <Card className="border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-amber-700">You are on the waitlist</p>
                <p className="text-xs text-muted-foreground">You will be notified if a seat becomes available.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
