import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { logAudit } from '../lib/audit';
import { authMiddleware } from '../middleware/auth';
import { requireRole, requireInstitutionAccess } from '../middleware/rbac';
import { AppError } from '../middleware/errorHandler';
import { qs, param } from '../lib/query';
import { z } from 'zod';

const router = Router();
router.use(authMiddleware);

// GET / — List applications (admin) or own applications (applicant)
router.get('/', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { cycle_id, status } = req.query;

  let query = supabase
    .from('applications')
    .select('*, admission_cycles(academic_year, programs(name, code))')
    .eq('institution_id', req.user!.institution_id!);

  // Applicants only see their own
  if (req.user!.role === 'applicant') {
    query = query.eq('clerk_user_id', req.user!.sub);
  }

  if (cycle_id) query = query.eq('cycle_id', qs(cycle_id)!);
  if (status) query = query.eq('status', qs(status)!);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

// POST / — Submit a new application (public/applicant)
router.post('/', async (req: Request, res: Response) => {
  const body = z.object({
    cycle_id: z.string().uuid(),
    applicant_name: z.string().min(1),
    applicant_email: z.string().email(),
    applicant_phone: z.string().optional(),
    form_data: z.record(z.unknown()).default({}),
  }).parse(req.body);

  // Look up the cycle to get institution_id
  const { data: cycle, error: cycleError } = await supabase
    .from('admission_cycles')
    .select('institution_id, status')
    .eq('id', body.cycle_id)
    .single();

  if (cycleError || !cycle) throw new AppError(404, 'NOT_FOUND', 'Admission cycle not found');
  if (cycle.status !== 'active') throw new AppError(400, 'CYCLE_CLOSED', 'This admission cycle is not accepting applications');

  const { data, error } = await supabase.from('applications').insert({
    ...body,
    institution_id: cycle.institution_id,
    clerk_user_id: req.user?.sub || null,
    status: 'submitted',
    submitted_at: new Date().toISOString(),
  }).select().single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req, action: 'application_submitted', entity_type: 'application', entity_id: data.id, new_value: { applicant_name: body.applicant_name } });
  res.status(201).json({ data, error: null });
});

// GET /:id — Get application details
router.get('/:id', requireInstitutionAccess, async (req: Request, res: Response) => {
  const id = param(req.params.id);
  const { data, error } = await supabase.from('applications').select('*, admission_cycles(academic_year, programs(name)), documents(*)').eq('id', id).single();
  if (error) throw new AppError(404, 'NOT_FOUND', 'Application not found');

  if (req.user!.role === 'applicant' && data.clerk_user_id !== req.user!.sub) {
    throw new AppError(403, 'FORBIDDEN', 'Access denied');
  }

  res.json({ data, error: null });
});

// PATCH /:id — Update application status (admin only)
router.patch('/:id', requireInstitutionAccess, requireRole('institution_admin', 'staff'), async (req: Request, res: Response) => {
  const id = param(req.params.id);
  const body = z.object({
    status: z.enum(['under_review', 'shortlisted', 'offer_sent', 'confirmed', 'rejected', 'waitlisted']).optional(),
    merit_rank: z.number().int().optional(),
  }).parse(req.body);

  // Fetch current for audit
  const { data: current } = await supabase.from('applications').select('status, merit_rank').eq('id', id).single();

  const { data, error } = await supabase.from('applications').update(body).eq('id', id).select().single();
  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req, action: 'application_status_changed', entity_type: 'application', entity_id: id, old_value: current, new_value: body });
  res.json({ data, error: null });
});

// POST /:id/shortlist — Bulk shortlist based on cutoff
router.post('/:id/shortlist', requireInstitutionAccess, requireRole('institution_admin'), async (req: Request, res: Response) => {
  const id = param(req.params.id);
  const body = z.object({ merit_rank_cutoff: z.number().int().positive() }).parse(req.body);

  const { error } = await supabase.from('applications').update({ status: 'shortlisted' }).eq('cycle_id', id).lte('merit_rank', body.merit_rank_cutoff).eq('status', 'submitted');
  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req, action: 'applications_bulk_shortlisted', entity_type: 'application', new_value: { cycle_id: id, cutoff: body.merit_rank_cutoff } });
  res.json({ data: { message: 'Applications shortlisted' }, error: null });
});

// POST /:id/confirm — Confirm enrollment (applicant)
router.post('/:id/confirm', requireInstitutionAccess, async (req: Request, res: Response) => {
  const id = param(req.params.id);

  const { data: app, error: fetchError } = await supabase.from('applications').select('*').eq('id', id).single();
  if (fetchError || !app) throw new AppError(404, 'NOT_FOUND', 'Application not found');

  if (app.clerk_user_id !== req.user!.sub) throw new AppError(403, 'FORBIDDEN', 'Access denied');
  if (app.status !== 'offer_sent') throw new AppError(400, 'INVALID_STATUS', 'Application must have offer_sent status');

  const { data, error } = await supabase.from('applications').update({ status: 'confirmed' }).eq('id', id).select().single();
  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  // Create student record
  const enrollmentNum = `STU-${Date.now().toString(36).toUpperCase()}`;
  const { data: _student, error: studentError } = await supabase.from('students').insert({
    institution_id: app.institution_id,
    enrollment_number: enrollmentNum,
    enrollment_status: 'active',
    admission_date: new Date().toISOString().split('T')[0],
    batch_year: new Date().getFullYear().toString(),
  }).select().single();

  if (studentError) console.error('Failed to create student record:', studentError);

  await logAudit({ req, action: 'application_confirmed', entity_type: 'application', entity_id: id });
  res.json({ data, error: null });
});

// GET /:id/documents — Get documents for an application
router.get('/:id/documents', requireInstitutionAccess, async (req: Request, res: Response) => {
  const id = param(req.params.id);
  const { data, error } = await supabase.from('documents').select('*').eq('application_id', id).order('created_at');
  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  // Applicants can only see their own
  if (req.user!.role === 'applicant') {
    const { data: app } = await supabase.from('applications').select('clerk_user_id').eq('id', id).single();
    if (app?.clerk_user_id !== req.user!.sub) throw new AppError(403, 'FORBIDDEN', 'Access denied');
  }

  res.json({ data, error: null });
});

// PATCH /:id/documents/:docId/verify — Verify or reject a document
router.patch('/:id/documents/:docId/verify', requireInstitutionAccess, requireRole('institution_admin', 'staff'), async (req: Request, res: Response) => {
  const docId = param(req.params.docId);
  const body = z.object({
    verification_status: z.enum(['verified', 'rejected', 'resubmission_required']),
    remarks: z.string().optional(),
  }).parse(req.body);

  const { data, error } = await supabase.from('documents').update({
    verification_status: body.verification_status,
    verified_by: req.user!.sub,
    verified_at: new Date().toISOString(),
  }).eq('id', docId).select().single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  await logAudit({ req, action: 'document_verified', entity_type: 'document', entity_id: docId, new_value: { status: body.verification_status } });
  res.json({ data, error: null });
});

// POST /:id/offer — Send offer letter (admin)
router.post('/:id/offer', requireInstitutionAccess, requireRole('institution_admin'), async (req: Request, res: Response) => {
  const id = param(req.params.id);
  const { data, error } = await supabase.from('applications').update({ status: 'offer_sent' }).eq('id', id).select().single();
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  await logAudit({ req, action: 'offer_sent', entity_type: 'application', entity_id: id });
  res.json({ data, error: null });
});

// POST /:id/waitlist — Move to waitlist (admin)
router.post('/:id/waitlist', requireInstitutionAccess, requireRole('institution_admin'), async (req: Request, res: Response) => {
  const id = param(req.params.id);
  const { data, error } = await supabase.from('applications').update({ status: 'waitlisted' }).eq('id', id).select().single();
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  await logAudit({ req, action: 'application_waitlisted', entity_type: 'application', entity_id: id });
  res.json({ data, error: null });
});

// POST /:id/promote — Promote from waitlist (admin)
router.post('/:id/promote', requireInstitutionAccess, requireRole('institution_admin'), async (req: Request, res: Response) => {
  const id = param(req.params.id);
  const { data: app } = await supabase.from('applications').select('status').eq('id', id).single();
  if (app?.status !== 'waitlisted') throw new AppError(400, 'NOT_WAITLISTED', 'Application is not on the waitlist');

  const { data, error } = await supabase.from('applications').update({ status: 'shortlisted' }).eq('id', id).select().single();
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  await logAudit({ req, action: 'application_promoted_from_waitlist', entity_type: 'application', entity_id: id });
  res.json({ data, error: null });
});

// GET /student/my — Get current user's applications
router.get('/student/my', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('applications')
    .select('*, admission_cycles(academic_year, programs(name, code)), documents(id, document_type, verification_status)')
    .eq('clerk_user_id', req.user!.sub)
    .order('created_at', { ascending: false });

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

export default router;
