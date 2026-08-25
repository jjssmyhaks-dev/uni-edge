import { qs, param } from '../lib/query';
import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { logAudit } from '../lib/audit';
import { authMiddleware } from '../middleware/auth';
import { requireRole, requireInstitutionAccess } from '../middleware/rbac';
import { AppError } from '../middleware/errorHandler';
import { createProgramSchema, updateProgramSchema } from '@uni-edge/types';

const router = Router();
router.use(authMiddleware);

router.get('/', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { department_id, degree_level, is_active } = req.query;
  let query = supabase.from('programs').select('*, departments(name, code)').eq('institution_id', req.user!.institution_id!).order('name');
  if (department_id) query = query.eq('department_id', qs(department_id));
  if (degree_level) query = query.eq('degree_level', qs(degree_level));
  if (is_active !== undefined) query = query.eq('is_active', is_active === 'true');

  const { data, error } = await query;
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

router.post('/', requireRole('institution_admin', 'super_admin'), requireInstitutionAccess, async (req: Request, res: Response) => {
  const body = createProgramSchema.parse({ ...req.body, institution_id: req.user!.institution_id });
  const { data, error } = await supabase.from('programs').insert(body).select().single();
  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req: req as any, action: 'program_created', entity_type: 'program', entity_id: data.id, new_value: body as Record<string, unknown> });
  res.status(201).json({ data, error: null });
});

router.get('/:id', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('programs').select('*, departments(name, code), program_eligibility(*), category_quotas(*)').eq('id', param(req.params.id)).single();
  if (error) throw new AppError(404, 'NOT_FOUND', 'Program not found');
  if (req.user!.role !== 'super_admin' && data.institution_id !== req.user!.institution_id) {
    throw new AppError(403, 'FORBIDDEN', 'Access denied');
  }
  res.json({ data, error: null });
});

router.patch('/:id', requireRole('institution_admin', 'super_admin'), requireInstitutionAccess, async (req: Request, res: Response) => {
  const body = updateProgramSchema.parse(req.body);
  const { data, error } = await supabase.from('programs').update(body).eq('id', param(req.params.id)).select().single();
  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req: req as any, action: 'program_updated', entity_type: 'program', entity_id: param(req.params.id), new_value: body as Record<string, unknown> });
  res.json({ data, error: null });
});

router.post('/:id/clone', requireRole('institution_admin', 'super_admin'), requireInstitutionAccess, async (req: Request, res: Response) => {
  const { data: source, error: fetchError } = await supabase.from('programs').select('*, program_eligibility(*), category_quotas(*)').eq('id', param(req.params.id)).single();
  if (fetchError || !source) throw new AppError(404, 'NOT_FOUND', 'Source program not found');

  const { id: _sourceId, created_at: _ca, updated_at: _ua, ...programData } = source;
  programData.name = `${source.name} (Copy)`;
  programData.is_active = false;

  const { data: newProgram, error: createError } = await supabase.from('programs').insert(programData).select().single();
  if (createError) throw new AppError(500, 'DB_ERROR', createError.message);

  if (source.program_eligibility?.length > 0) {
    const eligibilityData = source.program_eligibility.map((e: any) => {
      const { id: _eId, created_at: _eCa, ...rest } = e;
      return { ...rest, program_id: newProgram.id };
    });
    await supabase.from('program_eligibility').insert(eligibilityData);
  }

  if (source.category_quotas?.length > 0) {
    const quotaData = source.category_quotas.map((q: any) => {
      const { id: _qId, created_at: _qCa, ...rest } = q;
      return { ...rest, program_id: newProgram.id };
    });
    await supabase.from('category_quotas').insert(quotaData);
  }

  await logAudit({ req: req as any, action: 'program_cloned', entity_type: 'program', entity_id: newProgram.id, new_value: { source_id: source.id } });
  res.status(201).json({ data: newProgram, error: null });
});

export default router;
