import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { logAudit } from '../lib/audit';
import { authMiddleware } from '../middleware/auth';
import { requireRole, requireInstitutionAccess } from '../middleware/rbac';
import { AppError } from '../middleware/errorHandler';
import { param } from '../lib/query';
import { z } from 'zod';

const router = Router();
router.use(authMiddleware);

// GET /:examId — List questions for an exam (admin sees all including answers)
router.get('/:examId', requireInstitutionAccess, async (req: Request, res: Response) => {
  const examId = param(req.params.id);

  // Admin sees everything including correct answers
  const isAdmin = ['institution_admin', 'exam_committee', 'super_admin'].includes(req.user!.role);

  let query = supabase
    .from('exam_questions')
    .select(isAdmin ? '*' : 'id, question_text, question_type, options, marks, question_order')
    .eq('exam_id', examId)
    .eq('is_active', true)
    .order('question_order');

  const { data, error } = await query;
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

// POST /:examId — Add a single question
router.post('/:examId', requireInstitutionAccess, requireRole('institution_admin', 'exam_committee'), async (req: Request, res: Response) => {
  const examId = param(req.params.id);

  const body = z.object({
    question_text: z.string().min(1),
    question_type: z.enum(['mcq', 'true_false', 'short_answer']).default('mcq'),
    options: z.array(z.string()).min(2),
    correct_answer: z.string().optional(),
    marks: z.number().positive().default(1),
    question_order: z.number().int().optional(),
  }).parse(req.body);

  // Auto-calculate question_order if not provided
  if (body.question_order === undefined) {
    const { count } = await supabase
      .from('exam_questions')
      .select('id', { count: 'exact', head: true })
      .eq('exam_id', examId);
    body.question_order = (count || 0) + 1;
  }

  const { data, error } = await supabase
    .from('exam_questions')
    .insert({ ...body, exam_id: examId, institution_id: req.user!.institution_id! })
    .select()
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  // Update question count on entrance_exams
  await updateExamTotals(examId);

  await logAudit({ req, action: 'exam_question_created', entity_type: 'exam_question', entity_id: data.id });
  res.status(201).json({ data, error: null });
});

// POST /:examId/bulk — Bulk upload questions (JSON array or CSV-parse result)
router.post('/:examId/bulk', requireInstitutionAccess, requireRole('institution_admin', 'exam_committee'), async (req: Request, res: Response) => {
  const examId = param(req.params.id);

  const body = z.object({
    questions: z.array(z.object({
      question_text: z.string().min(1),
      question_type: z.enum(['mcq', 'true_false', 'short_answer']).default('mcq'),
      options: z.array(z.string()).min(2),
      correct_answer: z.string().optional(),
      marks: z.number().positive().default(1),
    })),
  }).parse(req.body);

  const existingCount = await supabase
    .from('exam_questions')
    .select('id', { count: 'exact', head: true })
    .eq('exam_id', examId);

  const startOrder = (existingCount.count || 0) + 1;

  const records = body.questions.map((q, i) => ({
    ...q,
    exam_id: examId,
    institution_id: req.user!.institution_id!,
    question_order: startOrder + i,
    is_active: true,
  }));

  const { data, error } = await supabase
    .from('exam_questions')
    .insert(records)
    .select();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await updateExamTotals(examId);
  await logAudit({ req, action: 'exam_questions_bulk_created', entity_type: 'exam_question', new_value: { count: records.length } });
  res.status(201).json({ data: { count: data?.length || 0 }, error: null });
});

// PATCH /:examId/reorder — Reorder questions
router.patch('/:examId/reorder', requireInstitutionAccess, requireRole('institution_admin', 'exam_committee'), async (req: Request, res: Response) => {
  const examId = param(req.params.id);

  const body = z.object({
    question_ids: z.array(z.string().uuid()),
  }).parse(req.body);

  // Update each question's order
  const updates = body.question_ids.map((id, index) =>
    supabase
      .from('exam_questions')
      .update({ question_order: index + 1 })
      .eq('id', id)
      .eq('exam_id', examId)
  );

  await Promise.all(updates);
  res.json({ data: { message: 'Questions reordered' }, error: null });
});

// DELETE /:id — Remove a question
router.delete('/:id', requireInstitutionAccess, requireRole('institution_admin', 'exam_committee'), async (req: Request, res: Response) => {
  const id = param(req.params.id);
  const { data: question } = await supabase.from('exam_questions').select('exam_id').eq('id', id).single();

  const { error } = await supabase.from('exam_questions').delete().eq('id', id);
  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  if (question?.exam_id) await updateExamTotals(question.exam_id);

  res.json({ data: { message: 'Question deleted' }, error: null });
});

// Helper: Update question_count and total_marks on entrance_exams
async function updateExamTotals(examId: string) {
  const { data: questions } = await supabase
    .from('exam_questions')
    .select('marks')
    .eq('exam_id', examId)
    .eq('is_active', true);

  const count = questions?.length || 0;
  const totalMarks = questions?.reduce((sum, q) => sum + Number(q.marks), 0) || 0;

  await supabase
    .from('entrance_exams')
    .update({ question_count: count, total_marks_computed: totalMarks })
    .eq('id', examId);
}

export default router;
