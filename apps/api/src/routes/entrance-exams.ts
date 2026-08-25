import { qs, param } from '../lib/query';
import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { logAudit } from '../lib/audit';
import { authMiddleware } from '../middleware/auth';
import { requireExamManagement, requireInstitutionAccess } from '../middleware/rbac';
import { AppError } from '../middleware/errorHandler';
import { createEntranceExamSchema, updateEntranceExamSchema } from '@uni-edge/types';

const router = Router();
router.use(authMiddleware);

router.get('/', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { cycle_id, status } = req.query;
  let query = supabase.from('entrance_exams').select('*, admission_cycles(academic_year, programs(name))').eq('institution_id', req.user!.institution_id!).order('exam_date', { ascending: false });
  if (cycle_id) query = query.eq('cycle_id', qs(cycle_id));
  if (status) query = query.eq('status', qs(status));

  const { data, error } = await query;
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

router.post('/', requireExamManagement, requireInstitutionAccess, async (req: Request, res: Response) => {
  const body = createEntranceExamSchema.parse({ ...req.body, institution_id: req.user!.institution_id });
  const { data, error } = await supabase.from('entrance_exams').insert(body).select().single();
  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req: req as any, action: 'entrance_exam_created', entity_type: 'entrance_exam', entity_id: data.id, new_value: body as Record<string, unknown> });
  res.status(201).json({ data, error: null });
});

router.get('/:id', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('entrance_exams').select('*, exam_centers(*), admission_cycles(programs(name, code))').eq('id', param(req.params.id)).single();
  if (error) throw new AppError(404, 'NOT_FOUND', 'Exam not found');
  if (req.user!.role !== 'super_admin' && data.institution_id !== req.user!.institution_id) {
    throw new AppError(403, 'FORBIDDEN', 'Access denied');
  }
  res.json({ data, error: null });
});

router.patch('/:id', requireExamManagement, requireInstitutionAccess, async (req: Request, res: Response) => {
  const body = updateEntranceExamSchema.parse(req.body);
  const { data, error } = await supabase.from('entrance_exams').update(body).eq('id', param(req.params.id)).select().single();
  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req: req as any, action: 'entrance_exam_updated', entity_type: 'entrance_exam', entity_id: param(req.params.id), new_value: body as Record<string, unknown> });
  res.json({ data, error: null });
});

router.post('/:id/lock', requireExamManagement, requireInstitutionAccess, async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('entrance_exams').update({ status: 'locked' }).eq('id', param(req.params.id)).eq('status', 'under_review').select().single();
  if (error || !data) throw new AppError(400, 'INVALID_TRANSITION', 'Exam must be in under_review status to lock');

  await logAudit({ req: req as any, action: 'entrance_exam_locked', entity_type: 'entrance_exam', entity_id: param(req.params.id) });
  res.json({ data, error: null });
});

router.post('/:id/publish-results', requireExamManagement, requireInstitutionAccess, async (req: Request, res: Response) => {
  const { error } = await supabase.from('exam_results').update({ is_published: true }).eq('exam_id', param(req.params.id)).eq('is_published', false);
  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req: req as any, action: 'exam_results_published', entity_type: 'entrance_exam', entity_id: param(req.params.id) });
  res.json({ data: { message: 'Results published successfully' }, error: null });
});

export default router;
