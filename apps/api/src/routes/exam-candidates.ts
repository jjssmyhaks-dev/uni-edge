import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { logAudit } from '../lib/audit';
import { authMiddleware } from '../middleware/auth';
import { requireExamManagement, requireInstitutionAccess } from '../middleware/rbac';
import { AppError } from '../middleware/errorHandler';
import { qs, param } from '../lib/query';
import { z } from 'zod';

const router = Router();
router.use(authMiddleware);

// GET / — List candidates for an exam
router.get('/', requireInstitutionAccess, async (req: Request, res: Response) => {
  const examId = qs(req.query.exam_id);

  let query = supabase.from('exam_candidates').select('*').eq('institution_id', req.user!.institution_id!);

  if (examId) query = query.eq('exam_id', examId);

  const { data, error } = await query.order('candidate_name');
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

// POST / — Register a single candidate
router.post('/', requireExamManagement, requireInstitutionAccess, async (req: Request, res: Response) => {
  const body = z.object({
    exam_id: z.string().uuid(),
    candidate_name: z.string().min(1),
    candidate_email: z.string().email().optional(),
    candidate_phone: z.string().optional(),
  }).parse(req.body);

  const { data: exam } = await supabase.from('entrance_exams').select('id').eq('id', body.exam_id).single();
  if (!exam) throw new AppError(404, 'NOT_FOUND', 'Exam not found');

  // Generate registration number
  const { count } = await supabase.from('exam_candidates').select('*', { count: 'exact', head: true }).eq('exam_id', body.exam_id);
  const regNum = `REG-${Date.now().toString(36).toUpperCase()}-${(count || 0) + 1}`;

  const { data, error } = await supabase.from('exam_candidates').insert({
    ...body,
    institution_id: req.user!.institution_id,
    registration_number: regNum,
    registration_status: 'confirmed',
  }).select().single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req, action: 'candidate_registered', entity_type: 'exam_candidate', entity_id: data.id, new_value: body });
  res.status(201).json({ data, error: null });
});

// POST /bulk — Bulk register candidates from JSON array
router.post('/bulk', requireExamManagement, requireInstitutionAccess, async (req: Request, res: Response) => {
  const body = z.object({
    exam_id: z.string().uuid(),
    candidates: z.array(z.object({
      candidate_name: z.string().min(1),
      candidate_email: z.string().email().optional(),
      candidate_phone: z.string().optional(),
    })),
  }).parse(req.body);

  const { count } = await supabase.from('exam_candidates').select('*', { count: 'exact', head: true }).eq('exam_id', body.exam_id);

  const insertData = body.candidates.map((c, i) => ({
    ...c,
    institution_id: req.user!.institution_id,
    exam_id: body.exam_id,
    registration_number: `REG-${Date.now().toString(36).toUpperCase()}-${(count || 0) + i + 1}`,
    registration_status: 'confirmed',
  }));

  const { data, error } = await supabase.from('exam_candidates').insert(insertData).select();
  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req, action: 'candidates_bulk_registered', entity_type: 'exam_candidate', new_value: { count: data.length, exam_id: body.exam_id } });
  res.status(201).json({ data, error: null, registered: data.length });
});

// PATCH /:id — Update candidate
router.patch('/:id', requireExamManagement, requireInstitutionAccess, async (req: Request, res: Response) => {
  const id = param(req.params.id);
  const body = z.object({
    candidate_name: z.string().min(1).optional(),
    candidate_email: z.string().email().optional(),
    candidate_phone: z.string().optional(),
    registration_status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
  }).parse(req.body);

  const { data, error } = await supabase.from('exam_candidates').update(body).eq('id', id).select().single();
  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req, action: 'candidate_updated', entity_type: 'exam_candidate', entity_id: id, new_value: body });
  res.json({ data, error: null });
});

// DELETE /:id — Cancel candidate registration
router.delete('/:id', requireExamManagement, requireInstitutionAccess, async (req: Request, res: Response) => {
  const id = param(req.params.id);
  const { error } = await supabase.from('exam_candidates').delete().eq('id', id);
  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req, action: 'candidate_deleted', entity_type: 'exam_candidate', entity_id: id });
  res.status(204).send();
});

export default router;
