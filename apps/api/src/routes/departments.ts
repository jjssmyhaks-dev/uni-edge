import { param } from '../lib/query';
import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { logAudit } from '../lib/audit';
import { authMiddleware } from '../middleware/auth';
import { requireRole, requireInstitutionAccess } from '../middleware/rbac';
import { AppError } from '../middleware/errorHandler';
import { createDepartmentSchema, updateDepartmentSchema } from '@uni-edge/types';

const router = Router();
router.use(authMiddleware);

router.get('/', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('departments').select('*').eq('institution_id', req.user!.institution_id!).order('name');
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

router.post('/', requireRole('institution_admin', 'super_admin'), requireInstitutionAccess, async (req: Request, res: Response) => {
  const body = createDepartmentSchema.parse({ ...req.body, institution_id: req.user!.institution_id });
  const { data, error } = await supabase.from('departments').insert(body).select().single();
  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req: req as any, action: 'department_created', entity_type: 'department', entity_id: data.id, new_value: body as Record<string, unknown> });
  res.status(201).json({ data, error: null });
});

router.get('/:id', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('departments').select('*').eq('id', param(req.params.id)).single();
  if (error) throw new AppError(404, 'NOT_FOUND', 'Department not found');
  if (req.user!.role !== 'super_admin' && data.institution_id !== req.user!.institution_id) {
    throw new AppError(403, 'FORBIDDEN', 'Access denied');
  }
  res.json({ data, error: null });
});

router.patch('/:id', requireRole('institution_admin', 'super_admin'), requireInstitutionAccess, async (req: Request, res: Response) => {
  const body = updateDepartmentSchema.parse(req.body);
  const { data, error } = await supabase.from('departments').update(body).eq('id', param(req.params.id)).select().single();
  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req: req as any, action: 'department_updated', entity_type: 'department', entity_id: param(req.params.id), new_value: body as Record<string, unknown> });
  res.json({ data, error: null });
});

router.delete('/:id', requireRole('institution_admin', 'super_admin'), requireInstitutionAccess, async (req: Request, res: Response) => {
  const { error } = await supabase.from('departments').delete().eq('id', param(req.params.id));
  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req: req as any, action: 'department_deleted', entity_type: 'department', entity_id: param(req.params.id) });
  res.status(204).send();
});

export default router;
