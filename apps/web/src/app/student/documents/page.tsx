'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Clock, CheckCircle2, XCircle, Package } from 'lucide-react';

const requests = [
  { type: 'Transcript', requestedDate: 'Aug 20, 2025', status: 'processing', remarks: 'Processing — expected 3-5 business days' },
  { type: 'Bonafide Certificate', requestedDate: 'Aug 15, 2025', status: 'issued', remarks: 'Ready for pickup at admin office' },
];

const documentTypes = [
  { name: 'Transcript', desc: 'Official academic transcript', icon: '📄' },
  { name: 'Bonafide Certificate', desc: 'Enrollment verification', icon: '🎓' },
  { name: 'Transfer Certificate', desc: 'TC for transfer', icon: '📋' },
  { name: 'Migration Certificate', desc: 'Migration to another university', icon: '🏛️' },
  { name: 'Degree Certificate', desc: 'Degree completion certificate', icon: '🏅' },
  { name: 'Mark Sheet', desc: 'Duplicate mark sheet', icon: '📊' },
];

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  requested: { color: 'bg-yellow-500/10 text-yellow-600', icon: <Clock className="h-4 w-4" /> },
  processing: { color: 'bg-blue-500/10 text-blue-600', icon: <Package className="h-4 w-4" /> },
  ready: { color: 'bg-green-500/10 text-green-600', icon: <CheckCircle2 className="h-4 w-4" /> },
  issued: { color: 'bg-green-500/10 text-green-600', icon: <CheckCircle2 className="h-4 w-4" /> },
  rejected: { color: 'bg-red-500/10 text-red-600', icon: <XCircle className="h-4 w-4" /> },
};

export default function StudentDocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Requests</h1>
          <p className="text-muted-foreground">Request transcripts, certificates, and other academic documents.</p>
        </div>
      </div>

      {/* Request New Document */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Request a Document</CardTitle>
          <CardDescription>Select the type of document you need</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {documentTypes.map((type) => (
              <button
                key={type.name}
                className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center hover:bg-accent hover:border-primary/50 transition-all"
              >
                <span className="text-2xl">{type.icon}</span>
                <span className="text-sm font-medium">{type.name}</span>
                <span className="text-xs text-muted-foreground">{type.desc}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* My Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">My Requests</CardTitle>
          <CardDescription>Status of your document requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests.map((req, i) => {
              const config = statusConfig[req.status] || statusConfig.requested;
              return (
                <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{req.type}</p>
                      <p className="text-xs text-muted-foreground">Requested: {req.requestedDate}</p>
                      <p className="text-xs text-muted-foreground mt-1">{req.remarks}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className={config.color}>
                    <span className="flex items-center gap-1">
                      {config.icon}
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
