import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { logAudit } from '../lib/audit';
import { authMiddleware } from '../middleware/auth';
import { requireRole, requireInstitutionAccess } from '../middleware/rbac';
import { AppError } from '../middleware/errorHandler';
import { param, qs } from '../lib/query';
import { z } from 'zod';

const router = Router();
router.use(authMiddleware);

// ============================================
// FEE CATEGORIES
// ============================================

router.get('/categories', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('fee_categories')
    .select('*')
    .eq('institution_id', req.user!.institution_id!)
    .order('name');
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

router.post('/categories', requireInstitutionAccess, requireRole('institution_admin'), async (req: Request, res: Response) => {
  const body = z.object({ name: z.string().min(1), description: z.string().optional() }).parse(req.body);
  const { data, error } = await supabase.from('fee_categories').insert({
    ...body,
    institution_id: req.user!.institution_id!,
  }).select().single();
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  await logAudit({ req, action: 'fee_category_created', entity_type: 'fee_category', entity_id: data.id, new_value: body });
  res.status(201).json({ data, error: null });
});

router.patch('/categories/:id', requireInstitutionAccess, requireRole('institution_admin'), async (req: Request, res: Response) => {
  const id = param(req.params.id);
  const body = z.object({ name: z.string().optional(), description: z.string().optional(), is_active: z.boolean().optional() }).parse(req.body);
  const { data, error } = await supabase.from('fee_categories').update(body).eq('id', id).select().single();
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

// ============================================
// FEE STRUCTURES
// ============================================

router.get('/structures', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { program_id } = req.query;
  let query = supabase
    .from('fee_structures')
    .select('*, fee_categories(name)')
    .eq('institution_id', req.user!.institution_id!);
  if (program_id) query = query.eq('program_id', qs(program_id)!);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

router.post('/structures', requireInstitutionAccess, requireRole('institution_admin'), async (req: Request, res: Response) => {
  const body = z.object({
    fee_category_id: z.string().uuid(),
    program_id: z.string().uuid().optional(),
    admission_cycle_id: z.string().uuid().optional(),
    amount: z.number().positive(),
    description: z.string().optional(),
    academic_year: z.string().optional(),
  }).parse(req.body);
  const { data, error } = await supabase.from('fee_structures').insert({
    ...body,
    institution_id: req.user!.institution_id!,
  }).select().single();
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  await logAudit({ req, action: 'fee_structure_created', entity_type: 'fee_structure', entity_id: data.id, new_value: body });
  res.status(201).json({ data, error: null });
});

// ============================================
// INVOICES
// ============================================

router.get('/invoices', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { status, student_id } = req.query;
  let query = supabase
    .from('invoices')
    .select('*, fee_structures(amount, fee_categories(name)), students(enrollment_number)')
    .eq('institution_id', req.user!.institution_id!);
  if (status) query = query.eq('status', qs(status)!);
  if (student_id) query = query.eq('student_id', qs(student_id)!);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

router.post('/invoices', requireInstitutionAccess, requireRole('institution_admin', 'staff'), async (req: Request, res: Response) => {
  const body = z.object({
    student_id: z.string().uuid().optional(),
    application_id: z.string().uuid().optional(),
    fee_structure_id: z.string().uuid(),
    amount: z.number().positive(),
    due_date: z.string().optional(),
    notes: z.string().optional(),
  }).parse(req.body);

  // Auto-generate invoice number
  const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;

  const { data, error } = await supabase.from('invoices').insert({
    ...body,
    institution_id: req.user!.institution_id!,
    invoice_number: invoiceNumber,
    status: 'pending',
  }).select().single();
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  await logAudit({ req, action: 'invoice_created', entity_type: 'invoice', entity_id: data.id, new_value: { invoice_number: invoiceNumber, amount: body.amount } });
  res.status(201).json({ data, error: null });
});

router.patch('/invoices/:id', requireInstitutionAccess, requireRole('institution_admin', 'staff'), async (req: Request, res: Response) => {
  const id = param(req.params.id);
  const body = z.object({
    status: z.enum(['pending', 'paid', 'partial', 'overdue', 'cancelled', 'waived']).optional(),
    notes: z.string().optional(),
    due_date: z.string().optional(),
  }).parse(req.body);
  const { data, error } = await supabase.from('invoices').update(body).eq('id', id).select().single();
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  await logAudit({ req, action: 'invoice_updated', entity_type: 'invoice', entity_id: id, new_value: body });
  res.json({ data, error: null });
});

// ============================================
// PAYMENTS (SBI Collect receipt upload + verification)
// ============================================

router.get('/payments', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { status, invoice_id } = req.query;
  let query = supabase
    .from('payments')
    .select('*, invoices(invoice_number, amount, students(enrollment_number))')
    .eq('institution_id', req.user!.institution_id!);
  if (status) query = query.eq('status', qs(status)!);
  if (invoice_id) query = query.eq('invoice_id', qs(invoice_id)!);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

router.post('/payments', requireInstitutionAccess, async (req: Request, res: Response) => {
  const body = z.object({
    invoice_id: z.string().uuid(),
    amount: z.number().positive(),
    payment_method: z.enum(['sbi_collect', 'online', 'cash', 'demand_draft', 'other']),
    receipt_file_url: z.string().url().optional(),
    sbi_collect_reference: z.string().optional(),
    sbi_collect_student_name: z.string().optional(),
    sbi_collect_institution_code: z.string().optional(),
    sbi_collect_payment_date: z.string().optional(),
    remarks: z.string().optional(),
  }).parse(req.body);

  const { data, error } = await supabase.from('payments').insert({
    ...body,
    institution_id: req.user!.institution_id!,
    status: 'pending',
  }).select().single();
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  await logAudit({ req, action: 'payment_submitted', entity_type: 'payment', entity_id: data.id, new_value: { amount: body.amount, method: body.payment_method } });
  res.status(201).json({ data, error: null });
});

router.patch('/payments/:id/verify', requireInstitutionAccess, requireRole('institution_admin', 'staff'), async (req: Request, res: Response) => {
  const id = param(req.params.id);
  const body = z.object({
    status: z.enum(['verified', 'rejected']),
    remarks: z.string().optional(),
  }).parse(req.body);

  const { data: payment, error: fetchError } = await supabase.from('payments').select('*, invoices(*)').eq('id', id).single();
  if (fetchError || !payment) throw new AppError(404, 'NOT_FOUND', 'Payment not found');

  // Update payment status
  const { data, error } = await supabase.from('payments').update({
    status: body.status,
    remarks: body.remarks,
    verified_by: req.user!.sub,
    verified_at: new Date().toISOString(),
  }).eq('id', id).select().single();
  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  // If verified, update invoice status
  if (body.status === 'verified' && payment.invoice_id) {
    // Calculate total verified payments for this invoice
    const { data: totalPaid } = await supabase
      .from('payments')
      .select('amount')
      .eq('invoice_id', payment.invoice_id)
      .eq('status', 'verified');

    const paid = (totalPaid || []).reduce((sum: number, p: { amount: number }) => sum + Number(p.amount), 0);
    const invoiceAmount = Number(payment.invoices.amount);
    const newStatus = paid >= invoiceAmount ? 'paid' : 'partial';

    await supabase.from('invoices').update({ status: newStatus }).eq('id', payment.invoice_id);
  }

  await logAudit({ req, action: 'payment_verified', entity_type: 'payment', entity_id: id, new_value: { status: body.status } });
  res.json({ data, error: null });
});

// ============================================
// FEE SUMMARY (Dashboard)
// ============================================

router.get('/summary', requireInstitutionAccess, requireRole('institution_admin', 'staff'), async (req: Request, res: Response) => {
  const instId = req.user!.institution_id!;

  const [invoicesResult, paymentsResult] = await Promise.all([
    supabase.from('invoices').select('id, amount, status').eq('institution_id', instId),
    supabase.from('payments').select('id, amount, status').eq('institution_id', instId),
  ]);

  const invoices = invoicesResult.data || [];
  const payments = paymentsResult.data || [];

  const totalBilled = invoices.reduce((sum: number, inv: { amount: number }) => sum + Number(inv.amount), 0);
  const totalCollected = payments.filter((p: { status: string }) => p.status === 'verified').reduce((sum: number, p: { amount: number }) => sum + Number(p.amount), 0);
  const pendingVerification = payments.filter((p: { status: string }) => p.status === 'pending').length;
  const overdueCount = invoices.filter((inv: { status: string }) => inv.status === 'overdue').length;

  res.json({
    data: {
      totalBilled,
      totalCollected,
      pendingAmount: totalBilled - totalCollected,
      pendingVerification,
      overdueCount,
      paidCount: invoices.filter((inv: { status: string }) => inv.status === 'paid').length,
      totalInvoices: invoices.length,
    },
    error: null,
  });
});

export default router;
