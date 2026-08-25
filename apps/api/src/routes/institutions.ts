import { Router, Request, Response } from 'express';
import { param } from '../lib/query';
import { supabase } from '../lib/supabase';
import { logAudit } from '../lib/audit';
import { authMiddleware } from '../middleware/auth';
import { requireRole, requireInstitutionAccess } from '../middleware/rbac';
import { AppError } from '../middleware/errorHandler';
import { createInstitutionSchema, updateInstitutionSchema } from '@uni-edge/types';

const router = Router();

router.use(authMiddleware);

// GET / — List institutions
router.get('/', async (req: Request, res: Response) => {
  let query = supabase.from('institutions').select('*');

  if (req.user!.role !== 'super_admin') {
    query = query.eq('id', req.user!.institution_id!);
  }

  const { data, error } = await query.order('name');
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

// POST / — Create institution (super admin only)
router.post('/', requireRole('super_admin'), async (req: Request, res: Response) => {
  const body = createInstitutionSchema.parse(req.body);
  const { data, error } = await supabase.from('institutions').insert(body).select().single();
  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({
    req: req as any,
    action: 'institution_created',
    entity_type: 'institution',
    entity_id: data.id,
    new_value: body as Record<string, unknown>,
  });

  res.status(201).json({ data, error: null });
});

// GET /:id — Get institution details
router.get('/:id', requireInstitutionAccess, async (req: Request, res: Response) => {
  const id = param(req.params.id);
  if (req.user!.role !== 'super_admin' && req.user!.institution_id !== id) {
    throw new AppError(403, 'FORBIDDEN', 'Access denied to this institution');
  }

  const { data, error } = await supabase.from('institutions').select('*').eq('id', id).single();
  if (error) throw new AppError(404, 'NOT_FOUND', 'Institution not found');
  res.json({ data, error: null });
});

// PATCH /:id — Update institution
router.patch('/:id', requireInstitutionAccess, async (req: Request, res: Response) => {
  const id = param(req.params.id);
  if (req.user!.role !== 'super_admin' && req.user!.institution_id !== id) {
    throw new AppError(403, 'FORBIDDEN', 'Access denied');
  }

  const body = updateInstitutionSchema.parse(req.body);
  const { data, error } = await supabase.from('institutions').update(body).eq('id', id).select().single();
  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({
    req: req as any,
    action: 'institution_updated',
    entity_type: 'institution',
    entity_id: id,
    new_value: body as Record<string, unknown>,
  });

  res.json({ data, error: null });
});

export default router;
