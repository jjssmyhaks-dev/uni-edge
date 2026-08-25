import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { logAudit } from '../lib/audit';
import { authMiddleware } from '../middleware/auth';
import { requireRole, requireInstitutionAccess } from '../middleware/rbac';
import { AppError } from '../middleware/errorHandler';
import { qs, param } from '../lib/query';
import { createNoticeSchema, updateNoticeSchema } from '@uni-edge/types';

const router = Router();
router.use(authMiddleware);

// GET / — List notices
router.get('/', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { status, target_audience } = req.query;
  let query = supabase
    .from('notices')
    .select('*, users!notices_created_by_fkey(full_name)')
    .eq('institution_id', req.user!.institution_id!)
    .order('created_at', { ascending: false });

  // Students/faculty only see published notices
  if (req.user!.role === 'student' || req.user!.role === 'applicant') {
    query = query.eq('published', true);
  }

  if (status) query = query.eq('published', qs(status) === 'published');
  if (target_audience) query = query.eq('target_audience', qs(target_audience)!);

  const { data, error } = await query;
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

// POST / — Create notice
router.post('/', requireInstitutionAccess, requireRole('institution_admin', 'staff'), async (req: Request, res: Response) => {
  const body = createNoticeSchema.parse(req.body);

  const { data, error } = await supabase
    .from('notices')
    .insert({
      institution_id: req.user!.institution_id!,
      title: body.title,
      content: body.content,
      target_audience: body.target_audience,
      target_department_id: body.target_department_id || null,
      published: body.publish_immediately,
      published_at: body.publish_immediately ? new Date().toISOString() : null,
      created_by: req.user!.sub,
    })
    .select()
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({
    req: req as any,
    action: body.publish_immediately ? 'notice_published' : 'notice_created',
    entity_type: 'notice',
    entity_id: data.id,
    new_value: { title: body.title, published: body.publish_immediately },
  });

  res.status(201).json({ data, error: null });
});

// GET /:id — Get notice
router.get('/:id', requireInstitutionAccess, async (req: Request, res: Response) => {
  const id = param(req.params.id);
  const { data, error } = await supabase
    .from('notices')
    .select('*, users!notices_created_by_fkey(full_name), departments!notices_target_department_id_fkey(name)')
    .eq('id', id)
    .single();

  if (error) throw new AppError(404, 'NOT_FOUND', 'Notice not found');
  if (data.institution_id !== req.user!.institution_id && req.user!.role !== 'super_admin') {
    throw new AppError(403, 'FORBIDDEN', 'Access denied');
  }

  res.json({ data, error: null });
});

// PATCH /:id — Update notice
router.patch('/:id', requireInstitutionAccess, requireRole('institution_admin', 'staff'), async (req: Request, res: Response) => {
  const id = param(req.params.id);
  const body = updateNoticeSchema.parse(req.body);

  const { data: current } = await supabase.from('notices').select('published').eq('id', id).single();

  const updateData: Record<string, unknown> = { ...body };
  if (body.status === 'published' && !current?.published) {
    updateData.published = true;
    updateData.published_at = new Date().toISOString();
  }
  if (body.status === 'archived') {
    updateData.published = false;
  }
  delete updateData.status;

  const { data, error } = await supabase
    .from('notices')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({
    req: req as any,
    action: 'notice_updated',
    entity_type: 'notice',
    entity_id: id,
    new_value: updateData,
  });

  res.json({ data, error: null });
});

// DELETE /:id — Delete notice
router.delete('/:id', requireInstitutionAccess, requireRole('institution_admin'), async (req: Request, res: Response) => {
  const id = param(req.params.id);
  const { error } = await supabase.from('notices').delete().eq('id', id);
  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({
    req: req as any,
    action: 'notice_deleted',
    entity_type: 'notice',
    entity_id: id,
  });

  res.status(204).json({ data: null, error: null });
});

export default router;
