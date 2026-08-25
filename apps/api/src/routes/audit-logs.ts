import { qs, param } from '../lib/query';
import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { authMiddleware } from '../middleware/auth';
import { requireRole, requireInstitutionAccess } from '../middleware/rbac';
import { AppError } from '../middleware/errorHandler';
import { paginationSchema } from '@uni-edge/types';

const router = Router();
router.use(authMiddleware);

router.get('/', requireRole('institution_admin', 'exam_committee', 'super_admin'), requireInstitutionAccess, async (req: Request, res: Response) => {
  const { page, per_page, sort_order, action, entity_type, user_id } = req.query;
  const pagination = paginationSchema.parse({ page: page || 1, per_page: per_page || 20, sort_order: sort_order || 'desc' });

  let query = supabase.from('audit_logs').select('*, users(full_name, email)', { count: 'exact' });

  if (req.user!.role !== 'super_admin') {
    query = query.eq('institution_id', req.user!.institution_id);
  }
  if (action) query = query.eq('action', qs(action));
  if (entity_type) query = query.eq('entity_type', qs(entity_type));
  if (user_id) query = query.eq('user_id', qs(user_id));

  const offset = (pagination.page - 1) * pagination.per_page;
  query = query.order('created_at', { ascending: pagination.sort_order === 'asc' }).range(offset, offset + pagination.per_page - 1);

  const { data, error, count } = await query;
  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  res.json({
    data: data || [],
    total: count || 0,
    page: pagination.page,
    per_page: pagination.per_page,
    total_pages: Math.ceil((count || 0) / pagination.per_page),
  });
});

export default router;
