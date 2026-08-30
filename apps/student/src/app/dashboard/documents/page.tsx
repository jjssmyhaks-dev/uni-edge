'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, Plus, Clock, CheckCircle2 } from 'lucide-react';
import { useDocumentRequests, type DocumentRequest } from '@/lib/hooks/useStudentData';

const DOCUMENT_TYPES = [
  'Transcript',
  'Bonafide Certificate',
  'Migration Certificate',
  'Character Certificate',
  'Transfer Certificate',
  'Migration NOC',
  'Fee Receipt',
];

export default function DocumentsPage() {
  const { data: requests = [], isLoading, requestDocument } = useDocumentRequests();
  const [showRequest, setShowRequest] = useState(false);
  const [docType, setDocType] = useState('');
  const [purpose, setPurpose] = useState('');
  const [copies, setCopies] = useState('1');

  const issued = requests.filter(r => r.status === 'issued').length;
  const processing = requests.filter(r => r.status === 'processing' || r.status === 'requested').length;

  const handleSubmit = async () => {
    if (!docType) return;
    await requestDocument.mutateAsync({ type: docType, purpose });
    setShowRequest(false);
    setDocType('');
    setPurpose('');
    setCopies('1');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">Request and download official documents</p>
        </div>
        <Button onClick={() => setShowRequest(true)}>
          <Plus className="h-4 w-4 mr-2" />Request Document
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Issued</p>
              <p className="text-2xl font-bold">{issued}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Processing</p>
              <p className="text-2xl font-bold">{processing}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Requests</p>
              <p className="text-2xl font-bold">{requests.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request History */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Document Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
          ) : requests.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <FileText className="mx-auto mb-3 h-10 w-10 opacity-30" />
              <p>No document requests yet</p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Issued</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map(doc => (
                      <TableRow key={doc.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{doc.type}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(doc.requested_at).toLocaleDateString('en-IN')}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{doc.issued_at ? new Date(doc.issued_at).toLocaleDateString('en-IN') : '—'}</TableCell>
                        <TableCell>
                          <Badge variant={doc.status === 'issued' ? 'default' : 'secondary'} className="capitalize">{doc.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {doc.status === 'issued' && doc.file_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-3.5 w-3.5 mr-1" />Download
                              </a>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Mobile */}
              <div className="space-y-2 md:hidden">
                {requests.map(doc => (
                  <div key={doc.id} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{doc.type}</p>
                        <p className="text-xs text-muted-foreground">{new Date(doc.requested_at).toLocaleDateString('en-IN')}</p>
                      </div>
                      <Badge variant={doc.status === 'issued' ? 'default' : 'secondary'} className="text-xs capitalize">{doc.status}</Badge>
                    </div>
                    {doc.status === 'issued' && doc.file_url && (
                      <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-3.5 w-3.5 mr-1" />Download
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Request Dialog */}
      <Dialog open={showRequest} onOpenChange={setShowRequest}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Document</DialogTitle>
            <DialogDescription>Select document type and submit your request</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger><SelectValue placeholder="Select document type..." /></SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Purpose (optional)</Label>
              <Textarea placeholder="e.g. Required for job application" rows={3} value={purpose} onChange={e => setPurpose(e.target.value)} />
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={!docType || requestDocument.isPending}>
              {requestDocument.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
