import { qs, param } from '../lib/query';
import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { logAudit } from '../lib/audit';
import { authMiddleware } from '../middleware/auth';
import { requireUserManagement, requireInstitutionAccess } from '../middleware/rbac';
import { AppError } from '../middleware/errorHandler';
import { updateUserRoleSchema } from '@uni-edge/types';

const router = Router();
router.use(authMiddleware);

// GET / — List users in institution
router.get('/', requireUserManagement, requireInstitutionAccess, async (req: Request, res: Response) => {
  const { role, department_id } = req.query;

  let query = supabase.from('users').select('*').eq('institution_id', req.user!.institution_id!).order('full_name');
  if (role) query = query.eq('role', qs(role));
  if (department_id) query = query.eq('department_id', qs(department_id));

  const { data, error } = await query;
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

// GET /:id — Get user details
router.get('/:id', requireUserManagement, async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('users').select('*').eq('id', param(req.params.id)).single();
  if (error) throw new AppError(404, 'NOT_FOUND', 'User not found');

  if (req.user!.role !== 'super_admin' && data.institution_id !== req.user!.institution_id) {
    throw new AppError(403, 'FORBIDDEN', 'Access denied');
  }

  res.json({ data, error: null });
});

// PATCH /:id/role — Change user role
router.patch('/:id/role', requireUserManagement, async (req: Request, res: Response) => {
  const body = updateUserRoleSchema.parse(req.body);

  const { data: currentUser, error: fetchError } = await supabase.from('users').select('*').eq('id', param(req.params.id)).single();
  if (fetchError) throw new AppError(404, 'NOT_FOUND', 'User not found');

  if (req.user!.role !== 'super_admin' && currentUser.institution_id !== req.user!.institution_id) {
    throw new AppError(403, 'FORBIDDEN', 'Access denied');
  }

  const { data, error } = await supabase.from('users').update({ role: body.role, department_id: body.department_id }).eq('id', param(req.params.id)).select().single();
  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({
    req: req as any,
    action: 'user_role_changed',
    entity_type: 'user',
    entity_id: param(req.params.id),
    old_value: { role: currentUser.role, department_id: currentUser.department_id },
    new_value: { role: body.role, department_id: body.department_id },
  });

  res.json({ data, error: null });
});

export default router;
