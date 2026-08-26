'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useInvoices, usePayments, useSubmitPayment } from '@/lib/hooks/useFees';
import { createClient } from '@supabase/supabase-js';
import {
  IndianRupee,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Upload,
  Loader2,
  ExternalLink,
  CreditCard,
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  paid: 'bg-green-500/10 text-green-700 dark:text-green-400',
  partial: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  overdue: 'bg-red-500/10 text-red-700 dark:text-red-400',
  verified: 'bg-green-500/10 text-green-700 dark:text-green-400',
  rejected: 'bg-red-500/10 text-red-700 dark:text-red-400',
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export default function StudentFeesPage() {
  const { data: invoicesData, isLoading: invoicesLoading } = useInvoices();
  const { data: paymentsData } = usePayments();
  const submitPayment = useSubmitPayment();

  const [showPaymentForm, setShowPaymentForm] = useState<string | null>(null);
  const [sbiRef, setSbiRef] = useState('');
  const [sbiName, setSbiName] = useState('');
  const [sbiDate, setSbiDate] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const invoices = invoicesData?.data || [];
  const payments = paymentsData?.data || [];
  const pendingInvoices = invoices.filter(i => i.status === 'pending' || i.status === 'overdue');
  const paidInvoices = invoices.filter(i => i.status === 'paid' || i.status === 'partial');

  const handleSubmitReceipt = async (invoiceId: string, amount: number) => {
    if (!sbiRef.trim() || !sbiName.trim()) return;

    setUploading(true);
    try {
      // Upload receipt to Supabase Storage
      let receiptUrl = '';
      if (receiptFile) {
        const supabase = createClient(supabaseUrl, supabaseAnon);
        const path = `receipts/${Date.now()}-${receiptFile.name}`;
        const { error } = await supabase.storage.from('documents').upload(path, receiptFile, { contentType: receiptFile.type });
        if (!error) {
          const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path);
          receiptUrl = urlData.publicUrl;
        }
      }

      await submitPayment.mutateAsync({
        invoice_id: invoiceId,
        amount,
        payment_method: 'sbi_collect',
        receipt_file_url: receiptUrl || undefined,
        sbi_collect_reference: sbiRef,
        sbi_collect_student_name: sbiName,
        sbi_collect_payment_date: sbiDate || undefined,
      });

      setSuccess(true);
      setShowPaymentForm(null);
      setSbiRef('');
      setSbiName('');
      setSbiDate('');
      setReceiptFile(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Payment submission failed:', err);
    } finally {
      setUploading(false);
    }
  };

  if (invoicesLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fees & Payments</h1>
        <p className="text-muted-foreground text-sm">View your invoices and upload payment receipts</p>
      </div>

      {success && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Payment receipt submitted successfully. It will be verified by the admin shortly.
        </div>
      )}

      {/* Pending Invoices */}
      {pendingInvoices.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Pending Payments ({pendingInvoices.length})
          </h2>
          {pendingInvoices.map(inv => {
            const invoicePayments = payments.filter(p => p.invoice_id === inv.id);
            const isShowingForm = showPaymentForm === inv.id;

            return (
              <Card key={inv.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium font-mono">{inv.invoice_number}</span>
                        <Badge variant="secondary" className={STATUS_COLORS[inv.status] || ''}>{inv.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {inv.fee_structures?.fee_categories?.name || 'Fee'}
                        {inv.due_date && ` • Due: ${new Date(inv.due_date).toLocaleDateString('en-IN')}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-bold">{formatCurrency(inv.amount)}</p>
                      {!isShowingForm ? (
                        <Button size="sm" onClick={() => setShowPaymentForm(inv.id)}>
                          <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                          Pay via SBI Collect
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => setShowPaymentForm(null)}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* SBI Collect Payment Form */}
                  {isShowingForm && (
                    <div className="mt-4 p-4 rounded-lg bg-muted/50 border space-y-3">
                      <div className="flex items-start gap-2 rounded bg-blue-500/5 p-2 text-xs text-blue-700 dark:text-blue-400">
                        <ExternalLink className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium">Pay via SBI Collect</p>
                          <p className="mt-0.5">
                            Visit <span className="font-mono">https://www.onlinesbi.com</span> → State Bank Collect → Pay your fee.
                            Then enter the reference number and upload the receipt below.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">SBI Reference Number <span className="text-destructive">*</span></label>
                          <Input
                            value={sbiRef}
                            onChange={e => setSbiRef(e.target.value)}
                            placeholder="e.g. SBICOL123456"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Name on Receipt <span className="text-destructive">*</span></label>
                          <Input
                            value={sbiName}
                            onChange={e => setSbiName(e.target.value)}
                            placeholder="Full name as on receipt"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Payment Date</label>
                          <Input
                            type="date"
                            value={sbiDate}
                            onChange={e => setSbiDate(e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1">Upload Receipt (Optional)</label>
                        <div className="border-2 border-dashed rounded-lg p-3 text-center hover:bg-background transition-colors">
                          <input
                            type="file" accept=".pdf,.jpg,.jpeg,.png"
                            onChange={e => setReceiptFile(e.target.files?.[0] || null)}
                            className="sr-only"
                            id="receipt-upload"
                          />
                          <label htmlFor="receipt-upload" className="cursor-pointer">
                            {receiptFile ? (
                              <div className="flex items-center justify-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm">{receiptFile.name}</span>
                              </div>
                            ) : (
                              <>
                                <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                                <p className="text-xs text-muted-foreground">Click to upload SBI Collect receipt</p>
                              </>
                            )}
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          onClick={() => handleSubmitReceipt(inv.id, inv.amount)}
                          disabled={!sbiRef.trim() || !sbiName.trim() || uploading}
                        >
                          {uploading ? (
                            <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Submitting...</>
                          ) : (
                            <><Upload className="h-3.5 w-3.5 mr-1.5" /> Submit Receipt</>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Existing payments for this invoice */}
                  {invoicePayments.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {invoicePayments.map(p => (
                        <div key={p.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary" className={`${STATUS_COLORS[p.status] || ''} text-[10px]`}>{p.status}</Badge>
                          <span>{p.payment_method === 'sbi_collect' ? 'SBI Collect' : p.payment_method}</span>
                          <span>•</span>
                          <span>{formatCurrency(p.amount)}</span>
                          {p.sbi_collect_reference && <span className="font-mono">Ref: {p.sbi_collect_reference}</span>}
                          {p.receipt_file_url && (
                            <a href={p.receipt_file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              View Receipt
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Paid Invoices */}
      {paidInvoices.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Paid Invoices ({paidInvoices.length})
          </h2>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">Invoice #</th>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">Fee Type</th>
                  <th className="text-right px-3 py-2 font-medium text-muted-foreground">Amount</th>
                  <th className="text-center px-3 py-2 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {paidInvoices.map(inv => (
                  <tr key={inv.id} className="border-b last:border-0">
                    <td className="px-3 py-2 font-mono text-xs">{inv.invoice_number}</td>
                    <td className="px-3 py-2">{inv.fee_structures?.fee_categories?.name || '—'}</td>
                    <td className="px-3 py-2 text-right font-medium">{formatCurrency(inv.amount)}</td>
                    <td className="px-3 py-2 text-center">
                      <Badge variant="secondary" className={STATUS_COLORS[inv.status] || ''}>{inv.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {invoices.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <IndianRupee className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No invoices found</p>
            <p className="text-xs text-muted-foreground mt-1">Your fee invoices will appear here once generated</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
