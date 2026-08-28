'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, Plus, Clock, CheckCircle2 } from 'lucide-react';

const DOCUMENT_REQUESTS = [
  { id: '1', type: 'Transcript', status: 'issued', requested: '2026-09-01', issued: '2026-09-05', copies: 2 },
  { id: '2', type: 'Bonafide Certificate', status: 'issued', requested: '2026-09-10', issued: '2026-09-12', copies: 1 },
  { id: '3', type: 'Migration Certificate', status: 'processing', requested: '2026-09-18', issued: null, copies: 1 },
];

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
  const [showRequest, setShowRequest] = useState(false);

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
              <p className="text-2xl font-bold">{DOCUMENT_REQUESTS.filter(d => d.status === 'issued').length}</p>
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
              <p className="text-2xl font-bold">{DOCUMENT_REQUESTS.filter(d => d.status === 'processing').length}</p>
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
              <p className="text-2xl font-bold">{DOCUMENT_REQUESTS.length}</p>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Type</TableHead>
                <TableHead>Copies</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DOCUMENT_REQUESTS.map(doc => (
                <TableRow key={doc.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{doc.type}</TableCell>
                  <TableCell className="text-center">{doc.copies}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{doc.requested}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{doc.issued || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={doc.status === 'issued' ? 'default' : 'secondary'} className="capitalize">{doc.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {doc.status === 'issued' && (
                      <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1" />Download</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
              <select className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                {DOCUMENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Number of Copies</Label>
              <Input type="number" defaultValue={1} min={1} max={5} />
            </div>
            <div className="space-y-2">
              <Label>Purpose (optional)</Label>
              <Textarea placeholder="e.g. Required for job application" rows={3} />
            </div>
            <Button className="w-full" onClick={() => setShowRequest(false)}>Submit Request</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
