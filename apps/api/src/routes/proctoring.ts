import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { logAudit } from '../lib/audit';
import { authMiddleware } from '../middleware/auth';
import { requireRole, requireInstitutionAccess } from '../middleware/rbac';
import { AppError } from '../middleware/errorHandler';
import { qs, param } from '../lib/query';
import {
  startProctoringSessionSchema,
  endProctoringSessionSchema,
  reportFlagSchema,
  reviewFlagSchema,
  reviewSessionSchema,
} from '@uni-edge/types';

const router = Router();
router.use(authMiddleware);

// ============================================
// Proctoring Sessions
// ============================================

// GET / — List proctoring sessions (admin review queue)
router.get('/', requireInstitutionAccess, requireRole('institution_admin', 'exam_committee', 'staff'), async (req: Request, res: Response) => {
  const { exam_id, status, review_status } = req.query;
  let query = supabase
    .from('proctoring_sessions')
    .select('*, exam_candidates(candidate_name, candidate_email, registration_number), entrance_exams(name, exam_date)')
    .eq('institution_id', req.user!.institution_id!)
    .order('created_at', { ascending: false });

  if (exam_id) query = query.eq('exam_id', qs(exam_id)!);
  if (status) query = query.eq('status', qs(status)!);
  if (review_status) query = query.eq('review_status', qs(review_status)!);

  const { data, error } = await query;
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

// POST / — Start a proctoring session (candidate starts exam)
router.post('/', requireInstitutionAccess, async (req: Request, res: Response) => {
  const body = startProctoringSessionSchema.parse(req.body);

  // Verify candidate belongs to this exam
  const { data: candidate } = await supabase
    .from('exam_candidates')
    .select('institution_id, exam_id')
    .eq('id', body.candidate_id)
    .single();

  if (!candidate || candidate.institution_id !== req.user!.institution_id) {
    throw new AppError(404, 'NOT_FOUND', 'Candidate not found');
  }

  const { data, error } = await supabase
    .from('proctoring_sessions')
    .insert({
      institution_id: req.user!.institution_id!,
      exam_id: body.exam_id,
      candidate_id: body.candidate_id,
      status: 'in_progress',
      started_at: new Date().toISOString(),
      ip_address: body.ip_address || req.ip,
      user_agent: body.user_agent || req.headers['user-agent'],
    })
    .select('*, exam_candidates(candidate_name)')
    .single();

  if (error) {
    if (error.code === '23505') throw new AppError(409, 'SESSION_EXISTS', 'A proctoring session already exists for this candidate');
    throw new AppError(500, 'DB_ERROR', error.message);
  }

  res.status(201).json({ data, error: null });
});

// GET /:id — Get proctoring session detail with flags
router.get('/:id', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('proctoring_sessions')
    .select('*, exam_candidates(candidate_name, candidate_email, registration_number), flagged_events(*), entrance_exams(name)')
    .eq('id', param(req.params.id))
    .single();

  if (error) throw new AppError(404, 'NOT_FOUND', 'Session not found');
  if (req.user!.role !== 'super_admin' && data.institution_id !== req.user!.institution_id) {
    throw new AppError(403, 'FORBIDDEN', 'Access denied');
  }

  res.json({ data, error: null });
});

// POST /:id/end — End a proctoring session
router.post('/:id/end', requireInstitutionAccess, async (req: Request, res: Response) => {
  const body = endProctoringSessionSchema.parse(req.body);

  const { data, error } = await supabase
    .from('proctoring_sessions')
    .update({
      status: body.status,
      ended_at: new Date().toISOString(),
    })
    .eq('id', param(req.params.id))
    .select()
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req: req as any, action: 'proctoring_session_ended', entity_type: 'proctoring_session', entity_id: param(req.params.id), new_value: { status: body.status } });
  res.json({ data, error: null });
});

// POST /:id/review — Review a proctoring session (admin)
router.post('/:id/review', requireInstitutionAccess, requireRole('institution_admin', 'exam_committee'), async (req: Request, res: Response) => {
  const body = reviewSessionSchema.parse(req.body);

  const { data, error } = await supabase
    .from('proctoring_sessions')
    .update({
      review_status: body.review_status,
      reviewer_id: req.user!.sub,
      reviewer_notes: body.reviewer_notes,
    })
    .eq('id', param(req.params.id))
    .select()
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req: req as any, action: 'proctoring_session_reviewed', entity_type: 'proctoring_session', entity_id: param(req.params.id), new_value: { review_status: body.review_status } });
  res.json({ data, error: null });
});

// ============================================
// Flagged Events
// ============================================

// POST /flags — Report a flagged event
router.post('/flags', requireInstitutionAccess, async (req: Request, res: Response) => {
  const body = reportFlagSchema.parse(req.body);

  const { data, error } = await supabase
    .from('flagged_events')
    .insert({
      institution_id: req.user!.institution_id!,
      session_id: body.session_id,
      flag_type: body.flag_type,
      severity: body.severity,
      description: body.description,
      screenshot_url: body.screenshot_url,
    })
    .select()
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.status(201).json({ data, error: null });
});

// GET /flags — List flagged events (admin review queue)
router.get('/flags', requireInstitutionAccess, requireRole('institution_admin', 'exam_committee', 'staff'), async (req: Request, res: Response) => {
  const { session_id, flag_type, review_status } = req.query;
  let query = supabase
    .from('flagged_events')
    .select('*, proctoring_sessions!inner(exam_id, candidate_id, exam_candidates(candidate_name))')
    .eq('institution_id', req.user!.institution_id!)
    .order('created_at', { ascending: false });

  if (session_id) query = query.eq('session_id', qs(session_id)!);
  if (flag_type) query = query.eq('flag_type', qs(flag_type)!);
  if (review_status) query = query.eq('review_status', qs(review_status)!);

  const { data, error } = await query;
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

// PATCH /flags/:id — Review a flagged event
router.patch('/flags/:id', requireInstitutionAccess, requireRole('institution_admin', 'exam_committee'), async (req: Request, res: Response) => {
  const flagId = param(req.params.id);
  const body = reviewFlagSchema.parse(req.body);

  const { data, error } = await supabase
    .from('flagged_events')
    .update({
      review_status: body.review_status,
      reviewer_id: req.user!.sub,
      reviewer_notes: body.reviewer_notes,
    })
    .eq('id', flagId)
    .select()
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req: req as any, action: 'flag_reviewed', entity_type: 'flagged_event', entity_id: flagId, new_value: { review_status: body.review_status } });
  res.json({ data, error: null });
});

// GET /stats — Proctoring overview stats
router.get('/stats', requireInstitutionAccess, requireRole('institution_admin', 'exam_committee'), async (req: Request, res: Response) => {
  const institutionId = req.user!.institution_id!;

  const [sessions, flags] = await Promise.all([
    supabase
      .from('proctoring_sessions')
      .select('status, review_status, total_flag_count')
      .eq('institution_id', institutionId),
    supabase
      .from('flagged_events')
      .select('flag_type, review_status, severity')
      .eq('institution_id', institutionId),
  ]);

  const allSessions = sessions.data || [];
  const allFlags = flags.data || [];

  const stats = {
    total_sessions: allSessions.length,
    in_progress: allSessions.filter(s => s.status === 'in_progress').length,
    completed: allSessions.filter(s => s.status === 'completed').length,
    terminated: allSessions.filter(s => s.status === 'terminated').length,
    pending_review: allSessions.filter(s => s.review_status === 'pending_review').length,
    total_flags: allFlags.length,
    violations: allFlags.filter(f => f.review_status === 'violation').length,
    high_severity: allFlags.filter(f => f.severity >= 7).length,
    flags_by_type: allFlags.reduce((acc, f) => {
      acc[f.flag_type] = (acc[f.flag_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  res.json({ data: stats, error: null });
});

// ============================================
// Proctor Assignments
// ============================================

// POST /assign — Assign a proctor to an exam
router.post('/assign', requireInstitutionAccess, requireRole('institution_admin', 'exam_committee'), async (req: Request, res: Response) => {
  const body = require('z').z.object({
    exam_id: require('z').z.string().uuid(),
    proctor_id: require('z').z.string().uuid(),
    batch_name: require('z').z.string().optional(),
    max_candidates: require('z').z.number().int().positive().optional(),
  }).parse(req.body);

  const { data, error } = await supabase
    .from('proctor_assignments')
    .insert({ ...body, institution_id: req.user!.institution_id! })
    .select('*, users(full_name, email)')
    .single();

  if (error) {
    if (error.code === '23505') throw new AppError(409, 'ALREADY_ASSIGNED', 'Proctor already assigned to this exam');
    throw new AppError(500, 'DB_ERROR', error.message);
  }

  await logAudit({ req, action: 'proctor_assigned', entity_type: 'proctor_assignment', entity_id: data.id });
  res.status(201).json({ data, error: null });
});

// GET /assignments/:examId — List proctors for an exam
router.get('/assignments/:examId', requireInstitutionAccess, async (req: Request, res: Response) => {
  const examId = param(req.params.examId);
  const { data, error } = await supabase
    .from('proctor_assignments')
    .select('*, users(full_name, email)')
    .eq('exam_id', examId)
    .eq('institution_id', req.user!.institution_id!);

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

// DELETE /assignments/:id — Remove a proctor assignment
router.delete('/assignments/:id', requireInstitutionAccess, requireRole('institution_admin', 'exam_committee'), async (req: Request, res: Response) => {
  const id = param(req.params.id);
  const { error } = await supabase.from('proctor_assignments').delete().eq('id', id);
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data: { message: 'Proctor unassigned' }, error: null });
});

// ============================================
// Live Monitoring
// ============================================

// GET /live — Get all in-progress sessions for live monitoring
router.get('/live', requireInstitutionAccess, requireRole('institution_admin', 'exam_committee', 'invigilator'), async (req: Request, res: Response) => {
  const { exam_id } = req.query;
  let query = supabase
    .from('proctoring_sessions')
    .select(`
      *, 
      exam_candidates(candidate_name, candidate_email, registration_number), 
      entrance_exams(name, exam_date, online_config),
      flagged_events!inner(id, flag_type, severity, review_status, created_at)
    `)
    .eq('institution_id', req.user!.institution_id!)
    .eq('status', 'in_progress')
    .order('started_at', { ascending: false });

  if (exam_id) query = query.eq('exam_id', exam_id as string);

  const { data, error } = await query;
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

// POST /:id/terminate — Proctor terminates a session
router.post('/:id/terminate', requireInstitutionAccess, requireRole('institution_admin', 'exam_committee'), async (req: Request, res: Response) => {
  const id = param(req.params.id);
  const body = require('z').z.object({ reason: require('z').z.string().optional() }).parse(req.body);

  const { data, error } = await supabase
    .from('proctoring_sessions')
    .update({
      status: 'terminated',
      ended_at: new Date().toISOString(),
      reviewer_notes: body.reason || 'Terminated by proctor',
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  // Also terminate any active submission
  if (data?.exam_id) {
    await supabase
      .from('exam_submissions')
      .update({ status: 'terminated' })
      .eq('proctoring_session_id', id)
      .eq('status', 'in_progress');
  }

  await logAudit({ req, action: 'proctoring_session_terminated', entity_type: 'proctoring_session', entity_id: id, new_value: { reason: body.reason } });
  res.json({ data, error: null });
});

export default router;
