'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { IndianRupee, Receipt, Upload, Download, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useFees, usePaymentHistory } from '@/lib/hooks/useFees';

function getFeeStatusBadge(status: string) {
  switch (status) {
    case 'paid': return <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-0">Paid</Badge>;
    case 'pending': return <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-0">Pending</Badge>;
    case 'overdue': return <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-0">Overdue</Badge>;
    case 'partial': return <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-0">Partial</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
}

function getPaymentStatusBadge(status: string) {
  switch (status) {
    case 'verified': return <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-0"><CheckCircle2 className="mr-1 h-3 w-3" />Verified</Badge>;
    case 'pending': return <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-0"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
    case 'rejected': return <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-0"><AlertCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function FeesPage() {
  const { data: fees = [] } = useFees();
  const { data: payments = [] } = usePaymentHistory();
  const [tab, setTab] = useState<'dues' | 'history'>('dues');

  const totalDues = fees.filter(f => f.status !== 'paid').reduce((s, f) => s + f.amount - (f.paid_amount || 0), 0);
  const totalPaid = fees.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fees & Payments</h1>
        <p className="text-muted-foreground">View fee dues, upload SBI Collect receipts, and track payment history</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Dues</p>
              <p className="text-2xl font-bold">₹{totalDues.toLocaleString('en-IN')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-2xl font-bold">₹{totalPaid.toLocaleString('en-IN')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Receipts</p>
              <p className="text-2xl font-bold">{payments.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Switch */}
      <div className="flex gap-2">
        <Button variant={tab === 'dues' ? 'default' : 'outline'} size="sm" onClick={() => setTab('dues')}>Fee Dues</Button>
        <Button variant={tab === 'history' ? 'default' : 'outline'} size="sm" onClick={() => setTab('history')}>Payment History</Button>
      </div>

      {tab === 'dues' ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Fee Dues — Semester 1</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fees.map(fee => (
                  <TableRow key={fee.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{fee.fee_type}</TableCell>
                    <TableCell className="font-semibold">₹{fee.amount.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fee.due_date}</TableCell>
                    <TableCell>{getFeeStatusBadge(fee.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fee.reference_number || '—'}</TableCell>
                    <TableCell className="text-right">
                      <TooltipProvider>
                        <div className="flex items-center gap-1 justify-end">
                          {fee.status !== 'paid' && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8">
                                  <Upload className="h-3.5 w-3.5 mr-1" />Upload Receipt
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Upload SBI Collect payment receipt</TooltipContent>
                            </Tooltip>
                          )}
                          {fee.receipt_url && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Download receipt</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map(p => (
                  <TableRow key={p.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">{p.receipt_number}</TableCell>
                    <TableCell className="font-medium">{p.fee_type}</TableCell>
                    <TableCell className="font-semibold">₹{p.amount.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.date}</TableCell>
                    <TableCell className="text-sm">{p.method}</TableCell>
                    <TableCell>{getPaymentStatusBadge(p.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
