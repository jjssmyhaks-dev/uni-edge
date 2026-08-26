'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  useFeeSummary,
  useInvoices,
  usePayments,
  useVerifyPayment,
  useCreateInvoice,
} from '@/lib/hooks/useFees';
import {
  IndianRupee,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  Loader2,
  Upload,
  Download,
  Filter,
} from 'lucide-react';

type Tab = 'overview' | 'invoices' | 'payments';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  paid: 'bg-green-500/10 text-green-700 dark:text-green-400',
  partial: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  overdue: 'bg-red-500/10 text-red-700 dark:text-red-400',
  cancelled: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
  waived: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  verified: 'bg-green-500/10 text-green-700 dark:text-green-400',
  rejected: 'bg-red-500/10 text-red-700 dark:text-red-400',
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export default function FeesPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  const { data: summaryData, isLoading: summaryLoading } = useFeeSummary();
  const { data: invoicesData, isLoading: invoicesLoading } = useInvoices();
  const { data: paymentsData, isLoading: paymentsLoading } = usePayments();
  const verifyPayment = useVerifyPayment();

  const summary = summaryData?.data;
  const invoices = invoicesData?.data || [];
  const payments = paymentsData?.data || [];

  const filteredPayments = payments.filter(p => {
    if (statusFilter && p.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.sbi_collect_reference?.toLowerCase().includes(q) ||
        p.sbi_collect_student_name?.toLowerCase().includes(q) ||
        p.invoices?.invoice_number?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingPayments = payments.filter(p => p.status === 'pending');

  const handleVerify = async (paymentId: string, status: 'verified' | 'rejected') => {
    try {
      await verifyPayment.mutateAsync({ id: paymentId, status });
    } catch (err) {
      console.error('Verify failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fee Management</h1>
        <p className="text-muted-foreground text-sm">Manage invoices, payments, and SBI Collect receipts</p>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 border-b">
        {([
          { id: 'overview' as Tab, label: 'Overview' },
          { id: 'invoices' as Tab, label: `Invoices (${invoices.length})` },
          { id: 'payments' as Tab, label: `Payments (${pendingPayments.length} pending)` },
        ]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Billed"
              value={formatCurrency(summary?.totalBilled || 0)}
              icon={<IndianRupee className="h-4 w-4" />}
              loading={summaryLoading}
            />
            <StatCard
              title="Total Collected"
              value={formatCurrency(summary?.totalCollected || 0)}
              icon={<CheckCircle className="h-4 w-4 text-green-600" />}
              loading={summaryLoading}
            />
            <StatCard
              title="Pending Amount"
              value={formatCurrency(summary?.pendingAmount || 0)}
              icon={<Clock className="h-4 w-4 text-yellow-600" />}
              loading={summaryLoading}
            />
            <StatCard
              title="Overdue Invoices"
              value={String(summary?.overdueCount || 0)}
              icon={<AlertTriangle className="h-4 w-4 text-red-600" />}
              loading={summaryLoading}
            />
          </div>

          {/* Pending Payments Requiring Verification */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pending Payment Verifications</CardTitle>
              <CardDescription>SBI Collect receipts and other payments awaiting review</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingPayments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No pending payments to verify</p>
              ) : (
                <div className="space-y-3">
                  {pendingPayments.slice(0, 5).map(payment => (
                    <PaymentRow
                      key={payment.id}
                      payment={payment}
                      onVerify={handleVerify}
                      verifying={verifyPayment.isPending}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid gap-4 grid-cols-3">
            <div className="rounded-lg border p-4 text-center">
              <p className="text-2xl font-bold">{summary?.totalInvoices || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Invoices</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{summary?.paidCount || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Paid Invoices</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{summary?.pendingVerification || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Awaiting Verification</p>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {tab === 'invoices' && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">All Invoices</CardTitle>
              <Button size="sm" variant="outline">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {invoicesLoading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No invoices created yet</p>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Invoice #</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Student</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Fee Type</th>
                      <th className="text-right px-3 py-2 font-medium text-muted-foreground">Amount</th>
                      <th className="text-center px-3 py-2 font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => (
                      <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-3 py-2 font-mono text-xs">{inv.invoice_number}</td>
                        <td className="px-3 py-2">{inv.students?.enrollment_number || '—'}</td>
                        <td className="px-3 py-2">{inv.fee_structures?.fee_categories?.name || '—'}</td>
                        <td className="px-3 py-2 text-right font-medium">{formatCurrency(inv.amount)}</td>
                        <td className="px-3 py-2 text-center">
                          <Badge variant="secondary" className={STATUS_COLORS[inv.status] || ''}>{inv.status}</Badge>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{inv.due_date || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payments Tab */}
      {tab === 'payments' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by reference, name, invoice..."
                className="pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <Card>
            <CardContent className="p-0">
              {paymentsLoading ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
              ) : filteredPayments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No payments found</p>
              ) : (
                <div className="divide-y">
                  {filteredPayments.map(payment => (
                    <PaymentRow
                      key={payment.id}
                      payment={payment}
                      onVerify={handleVerify}
                      verifying={verifyPayment.isPending}
                      expanded={selectedPayment === payment.id}
                      onToggle={() => setSelectedPayment(selectedPayment === payment.id ? null : payment.id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ============================================
// Components
// ============================================

function StatCard({ title, value, icon, loading }: { title: string; value: string; icon: React.ReactNode; loading: boolean }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground">{title}</p>
          {icon}
        </div>
        {loading ? (
          <div className="h-7 w-24 bg-muted rounded animate-pulse" />
        ) : (
          <p className="text-xl font-bold">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}

function PaymentRow({
  payment,
  onVerify,
  verifying,
  expanded,
  onToggle,
}: {
  payment: import('@/lib/hooks/useFees').Payment;
  onVerify: (id: string, status: 'verified' | 'rejected') => void;
  verifying: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}) {
  const isSbi = payment.payment_method === 'sbi_collect';

  return (
    <div>
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">
              {isSbi ? 'SBI Collect' : payment.payment_method}
            </span>
            {isSbi && payment.sbi_collect_reference && (
              <span className="text-xs text-muted-foreground font-mono">Ref: {payment.sbi_collect_reference}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <span>{payment.invoices?.invoice_number || '—'}</span>
            <span>•</span>
            <span>{new Date(payment.created_at).toLocaleDateString('en-IN')}</span>
            {payment.sbi_collect_student_name && (
              <>
                <span>•</span>
                <span>{payment.sbi_collect_student_name}</span>
              </>
            )}
          </div>
        </div>
        <p className="text-sm font-bold shrink-0">{formatCurrency(payment.amount)}</p>
        <Badge variant="secondary" className={`${STATUS_COLORS[payment.status] || ''} shrink-0`}>
          {payment.status}
        </Badge>
        <div className="flex items-center gap-1 shrink-0">
          {payment.receipt_file_url && (
            <a href={payment.receipt_file_url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="h-7 px-2">
                <Eye className="h-3.5 w-3.5" />
              </Button>
            </a>
          )}
          {onToggle && (
            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={onToggle}>
              <Eye className="h-3.5 w-3.5" />
            </Button>
          )}
          {payment.status === 'pending' && (
            <>
              <Button
                variant="ghost" size="sm"
                className="h-7 px-2 text-green-600 hover:text-green-700"
                onClick={() => onVerify(payment.id, 'verified')}
                disabled={verifying}
              >
                <CheckCircle className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost" size="sm"
                className="h-7 px-2 text-red-600 hover:text-red-700"
                onClick={() => onVerify(payment.id, 'rejected')}
                disabled={verifying}
              >
                <XCircle className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Expanded Details for SBI Collect */}
      {expanded && (
        <div className="px-4 pb-3 bg-muted/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm p-3 rounded-lg bg-card">
            <div>
              <p className="text-xs text-muted-foreground">SBI Reference</p>
              <p className="font-medium font-mono text-xs">{payment.sbi_collect_reference || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Student Name</p>
              <p className="font-medium">{payment.sbi_collect_student_name || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Institution Code</p>
              <p className="font-medium font-mono text-xs">{payment.sbi_collect_institution_code || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Payment Date</p>
              <p className="font-medium">{payment.sbi_collect_payment_date || '—'}</p>
            </div>
            {payment.remarks && (
              <div className="col-span-full">
                <p className="text-xs text-muted-foreground">Remarks</p>
                <p className="font-medium">{payment.remarks}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
