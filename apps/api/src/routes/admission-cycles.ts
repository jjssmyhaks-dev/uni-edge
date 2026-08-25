import { qs, param } from '../lib/query';
import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { logAudit } from '../lib/audit';
import { authMiddleware } from '../middleware/auth';
import { requireRole, requireInstitutionAccess } from '../middleware/rbac';
import { AppError } from '../middleware/errorHandler';
import { createAdmissionCycleSchema } from '@uni-edge/types';

const router = Router();
router.use(authMiddleware);

router.get('/', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { program_id, status } = req.query;
  let query = supabase.from('admission_cycles').select('*, programs(name, code, department_id)').eq('institution_id', req.user!.institution_id!).order('academic_year', { ascending: false });
  if (program_id) query = query.eq('program_id', qs(program_id));
  if (status) query = query.eq('status', qs(status));

  const { data, error } = await query;
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

router.post('/', requireRole('institution_admin', 'exam_committee', 'super_admin'), requireInstitutionAccess, async (req: Request, res: Response) => {
  const body = createAdmissionCycleSchema.parse({ ...req.body, institution_id: req.user!.institution_id });
  const { data, error } = await supabase.from('admission_cycles').insert(body).select().single();
  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req: req as any, action: 'admission_cycle_created', entity_type: 'admission_cycle', entity_id: data.id, new_value: body as Record<string, unknown> });
  res.status(201).json({ data, error: null });
});

router.get('/:id', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('admission_cycles').select('*, programs(name, code)').eq('id', param(req.params.id)).single();
  if (error) throw new AppError(404, 'NOT_FOUND', 'Cycle not found');
  if (req.user!.role !== 'super_admin' && data.institution_id !== req.user!.institution_id) {
    throw new AppError(403, 'FORBIDDEN', 'Access denied');
  }
  res.json({ data, error: null });
});

router.patch('/:id', requireRole('institution_admin', 'exam_committee', 'super_admin'), requireInstitutionAccess, async (req: Request, res: Response) => {
  const allowedFields = ['status', 'application_start_date', 'application_end_date'];
  const updates: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const { data, error } = await supabase.from('admission_cycles').update(updates).eq('id', param(req.params.id)).select().single();
  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req: req as any, action: 'admission_cycle_updated', entity_type: 'admission_cycle', entity_id: param(req.params.id), new_value: updates });
  res.json({ data, error: null });
});

router.post('/:id/clone', requireRole('institution_admin', 'super_admin'), requireInstitutionAccess, async (req: Request, res: Response) => {
  const { data: source, error: fetchError } = await supabase.from('admission_cycles').select('*').eq('id', param(req.params.id)).single();
  if (fetchError || !source) throw new AppError(404, 'NOT_FOUND', 'Source cycle not found');

  const { id: _id, created_at: _ca, updated_at: _ua, ...cycleData } = source;
  cycleData.status = 'draft';
  cycleData.academic_year = req.body.academic_year || source.academic_year;

  const { data: newCycle, error: createError } = await supabase.from('admission_cycles').insert(cycleData).select().single();
  if (createError) throw new AppError(500, 'DB_ERROR', createError.message);

  await logAudit({ req: req as any, action: 'admission_cycle_cloned', entity_type: 'admission_cycle', entity_id: newCycle.id, new_value: { source_id: source.id } });
  res.status(201).json({ data: newCycle, error: null });
});

export default router;
