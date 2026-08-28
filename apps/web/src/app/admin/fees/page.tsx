'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFeeSummary, useInvoices, usePayments, useVerifyPayment } from '@/lib/hooks/useFees';
import { IndianRupee, Clock, AlertTriangle, CheckCircle, XCircle, Search, Eye, Loader2, Download } from 'lucide-react';

type Tab = 'overview' | 'invoices' | 'payments';
const SC: Record<string, string> = { pending: 'bg-amber-500/15 text-amber-700 dark:text-amber-300', paid: 'bg-green-500/15 text-green-700 dark:text-green-400', overdue: 'bg-rose-500/15 text-rose-700 dark:text-rose-400', verified: 'bg-green-500/15 text-green-700 dark:text-green-400', rejected: 'bg-rose-500/15 text-rose-700 dark:text-rose-400' };
function fmt(a: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(a); }

export default function FeesPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [search, setSearch] = useState('');
  const { data: sD } = useFeeSummary(); const { data: iD } = useInvoices(); const { data: pD } = usePayments();
  const verify = useVerifyPayment();
  const sum = sD?.data; const inv = iD?.data || []; const pay = pD?.data || [];
  const pend = pay.filter((p: any) => p.status === 'pending');
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Fee Management</h1><p className="text-muted-foreground text-sm">Manage invoices, payments, and SBI Collect receipts</p></div>
      <div className="flex items-center gap-1 border-b">
        {([['overview','Overview'],['invoices','Invoices (' + inv.length + ')'],['payments','Payments (' + pend.length + ' pending)']] as [Tab,string][]).map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)} className={"px-4 py-2 text-sm font-medium border-b-2 transition-colors " + (tab === id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>{label}</button>
        ))}</div>
      {tab === 'overview' && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card><CardContent className="p-4"><div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Total Billed</p><IndianRupee className="h-4 w-4"/></div><p className="text-xl font-bold">{fmt(sum?.totalBilled||0)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Collected</p><CheckCircle className="h-4 w-4 text-green-600"/></div><p className="text-xl font-bold">{fmt(sum?.totalCollected||0)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Pending</p><Clock className="h-4 w-4 text-yellow-600"/></div><p className="text-xl font-bold">{fmt(sum?.pendingAmount||0)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">Overdue</p><AlertTriangle className="h-4 w-4 text-red-600"/></div><p className="text-xl font-bold">{sum?.overdueCount||0}</p></CardContent></Card>
        </div>
      )}
      {tab === 'invoices' && (
        <Card><CardHeader className="pb-3"><div className="flex items-center justify-between"><CardTitle className="text-base">All Invoices</CardTitle><Button size="sm" variant="outline"><Download className="h-3.5 w-3.5 mr-1.5" /> Export</Button></div></CardHeader><CardContent>
          <div className="rounded-lg border bg-card"><Table><TableHeader><TableRow className="border-b hover:bg-transparent">
            <TableHead className="h-12 px-4 font-medium">Invoice #</TableHead>
            <TableHead className="h-12 px-4 font-medium">Student</TableHead>
            <TableHead className="h-12 px-4 font-medium">Fee Type</TableHead>
            <TableHead className="h-12 px-4 font-medium text-right">Amount</TableHead>
            <TableHead className="h-12 px-4 font-medium">Status</TableHead>
            <TableHead className="h-12 px-4 font-medium">Due Date</TableHead>
          </TableRow></TableHeader><TableBody>
            {inv.map((i: any) => (
              <TableRow key={i.id} className="hover:bg-muted/50">
                <TableCell className="h-16 px-4 font-mono text-xs">{i.invoice_number}</TableCell>
                <TableCell className="h-16 px-4 text-sm">{i.students?.enrollment_number || '\u2014'}</TableCell>
                <TableCell className="h-16 px-4 text-sm">{i.fee_structures?.fee_categories?.name || '\u2014'}</TableCell>
                <TableCell className="h-16 px-4 text-right font-medium">{fmt(i.amount)}</TableCell>
                <TableCell className="h-16 px-4"><Badge variant="secondary" className={SC[i.status] || ''}>{i.status}</Badge></TableCell>
                <TableCell className="h-16 px-4 text-sm text-muted-foreground">{i.due_date || '\u2014'}</TableCell>
              </TableRow>
            ))}
          </TableBody></Table></div>
        </CardContent></Card>
      )}
      {tab === 'payments' && (
        <div className="space-y-4">
          <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search payments..." className="pl-9" /></div>
          <Card><CardContent className="p-0">
            <div className="rounded-lg border bg-card"><Table><TableHeader><TableRow className="border-b hover:bg-transparent">
              <TableHead className="h-12 px-4 font-medium">Method</TableHead>
              <TableHead className="h-12 px-4 font-medium">Reference</TableHead>
              <TableHead className="h-12 px-4 font-medium">Invoice</TableHead>
              <TableHead className="h-12 px-4 font-medium text-right">Amount</TableHead>
              <TableHead className="h-12 px-4 font-medium">Status</TableHead>
              <TableHead className="h-12 w-[120px] px-4 font-medium">Actions</TableHead>
            </TableRow></TableHeader><TableBody>
              {pay.map((p: any) => (
                <TableRow key={p.id} className="hover:bg-muted/50">
                  <TableCell className="h-16 px-4 text-sm font-medium">{p.payment_method === 'sbi_collect' ? 'SBI Collect' : p.payment_method}</TableCell>
                  <TableCell className="h-16 px-4 font-mono text-xs text-muted-foreground">{p.sbi_collect_reference || '\u2014'}</TableCell>
                  <TableCell className="h-16 px-4 text-sm">{p.invoices?.invoice_number || '\u2014'}</TableCell>
                  <TableCell className="h-16 px-4 text-right font-medium">{fmt(p.amount)}</TableCell>
                  <TableCell className="h-16 px-4"><Badge variant="secondary" className={SC[p.status] || ''}>{p.status}</Badge></TableCell>
                  <TableCell className="h-16 px-4"><TooltipProvider><div className="flex items-center gap-1">
                    <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" className="h-8 w-8"><Eye className="size-4" /></Button></TooltipTrigger><TooltipContent>View</TooltipContent></Tooltip>
                    {p.status === 'pending' && (
                      <><Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" className="h-8 w-8" onClick={() => verify.mutate({id:p.id,status:'verified'})} disabled={verify.isPending}><CheckCircle className="size-4" /></Button></TooltipTrigger><TooltipContent>Verify</TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive hover:text-white" onClick={() => verify.mutate({id:p.id,status:'rejected'})} disabled={verify.isPending}><XCircle className="size-4" /></Button></TooltipTrigger><TooltipContent>Reject</TooltipContent></Tooltip></>
                    )}
                  </div></TooltipProvider></TableCell>
                </TableRow>
              ))}
            </TableBody></Table></div>
          </CardContent></Card>
        </div>
      )}
    </div>
  );
}