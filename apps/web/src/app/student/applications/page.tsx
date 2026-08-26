'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMyApplications } from '@/lib/hooks/useApplications';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Eye,
  Loader2,
  ArrowUpRight,
  Plus,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Draft', color: 'bg-gray-500/10 text-gray-700', icon: <FileText className="h-3.5 w-3.5" /> },
  submitted: { label: 'Submitted', color: 'bg-blue-500/10 text-blue-700', icon: <Send className="h-3.5 w-3.5" /> },
  under_review: { label: 'Under Review', color: 'bg-yellow-500/10 text-yellow-700', icon: <Clock className="h-3.5 w-3.5" /> },
  shortlisted: { label: 'Shortlisted', color: 'bg-purple-500/10 text-purple-700', icon: <CheckCircle className="h-3.5 w-3.5" /> },
  offer_sent: { label: 'Offer Sent', color: 'bg-green-500/10 text-green-700', icon: <CheckCircle className="h-3.5 w-3.5" /> },
  confirmed: { label: 'Enrolled', color: 'bg-green-600/10 text-green-700', icon: <CheckCircle className="h-3.5 w-3.5" /> },
  rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-700', icon: <XCircle className="h-3.5 w-3.5" /> },
  waitlisted: { label: 'Waitlisted', color: 'bg-amber-500/10 text-amber-700', icon: <Clock className="h-3.5 w-3.5" /> },
};

const STATUS_STEPS = ['submitted', 'under_review', 'shortlisted', 'offer_sent', 'confirmed'];

export default function StudentApplicationsPage() {
  const { data: appsData, isLoading } = useMyApplications();
  const applications = appsData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Applications</h1>
          <p className="text-muted-foreground text-sm">Track your admission applications</p>
        </div>
        <Button asChild>
          <Link href="/apply">
            <Plus className="h-4 w-4 mr-1.5" /> New Application
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-3">No applications yet</p>
            <Button asChild>
              <Link href="/apply">Apply Now</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app: any) => {
            const config = STATUS_CONFIG[app.status] || STATUS_CONFIG.submitted;
            const currentStepIndex = STATUS_STEPS.indexOf(app.status);

            return (
              <Card key={app.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{app.admission_cycles?.programs?.name || 'Program'}</h3>
                        <Badge variant="secondary" className={`text-xs ${config.color}`}>
                          {config.icon}
                          <span className="ml-1">{config.label}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>Applied: {new Date(app.created_at).toLocaleDateString('en-IN')}</span>
                        {app.merit_rank && <span>Rank: #{app.merit_rank}</span>}
                        <span className="font-mono text-[10px]">{app.id.substring(0, 8)}</span>
                      </div>
                    </div>
                    <Link href={`/student/applications/${app.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-3.5 w-3.5 mr-1" /> View
                      </Button>
                    </Link>
                  </div>

                  {/* Status Timeline */}
                  <div className="flex items-center gap-1">
                    {STATUS_STEPS.map((step, i) => {
                      const isCompleted = currentStepIndex >= i;
                      const isCurrent = currentStepIndex === i;
                      return (
                        <div key={step} className="flex items-center flex-1">
                          <div className="flex flex-col items-center flex-1">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                              isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            } ${isCurrent ? 'ring-2 ring-primary ring-offset-1' : ''}`}>
                              {isCompleted ? <CheckCircle className="h-3 w-3" /> : i + 1}
                            </div>
                            <p className={`text-[10px] mt-1 text-center ${isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                              {step.replace('_', ' ')}
                            </p>
                          </div>
                          {i < STATUS_STEPS.length - 1 && (
                            <div className={`h-0.5 flex-1 mx-1 ${currentStepIndex > i ? 'bg-primary' : 'bg-muted'}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Documents */}
                  {app.documents && app.documents.length > 0 && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                      <span className="text-xs text-muted-foreground">Documents:</span>
                      {app.documents.map((doc: any) => (
                        <Badge key={doc.id} variant="outline" className={`text-[10px] ${
                          doc.verification_status === 'verified' ? 'text-green-600' :
                          doc.verification_status === 'rejected' ? 'text-red-600' :
                          'text-muted-foreground'
                        }`}>
                          {doc.document_type.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Accept/Decline for offer_sent */}
                  {app.status === 'offer_sent' && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                      <Button size="sm" asChild>
                        <Link href={`/student/applications/${app.id}`}>
                          <CheckCircle className="h-3.5 w-3.5 mr-1" /> View Offer
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
