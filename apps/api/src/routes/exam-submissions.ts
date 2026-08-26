import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { logAudit } from '../lib/audit';
import { authMiddleware } from '../middleware/auth';
import { requireInstitutionAccess, requireRole } from '../middleware/rbac';
import { AppError } from '../middleware/errorHandler';
import { param } from '../lib/query';
import { z } from 'zod';

const router = Router();
router.use(authMiddleware);

// POST /start — Start an exam submission
router.post('/start', requireInstitutionAccess, async (req: Request, res: Response) => {
  const body = z.object({
    exam_id: z.string().uuid(),
  }).parse(req.body);

  // Get the exam
  const { data: exam, error: examError } = await supabase
    .from('entrance_exams')
    .select('id, institution_id, duration_minutes, status, online_config')
    .eq('id', body.exam_id)
    .single();

  if (examError || !exam) throw new AppError(404, 'NOT_FOUND', 'Exam not found');
  if (exam.institution_id !== req.user!.institution_id) throw new AppError(403, 'FORBIDDEN', 'Access denied');
  if (exam.status !== 'locked' && exam.status !== 'completed') {
    throw new AppError(400, 'EXAM_NOT_AVAILABLE', 'Exam is not available for taking');
  }

  // Find the student or candidate
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('clerk_user_id', req.user!.sub)
    .single();

  const { data: candidate } = await supabase
    .from('exam_candidates')
    .select('id')
    .eq('exam_id', body.exam_id)
    .eq('candidate_email', req.user!.email)
    .single();

  if (!student && !candidate) {
    throw new AppError(403, 'NOT_REGISTERED', 'You are not registered for this exam');
  }

  // Check for existing submission
  const existingQuery = student
    ? supabase.from('exam_submissions').select('id, status').eq('exam_id', body.exam_id).eq('student_id', student.id).single()
    : supabase.from('exam_submissions').select('id, status').eq('exam_id', body.exam_id).eq('candidate_id', candidate!.id).single();

  const { data: existing } = await existingQuery;

  if (existing && (existing.status === 'submitted' || existing.status === 'timed_out')) {
    throw new AppError(400, 'ALREADY_SUBMITTED', 'You have already submitted this exam');
  }

  if (existing && existing.status === 'in_progress') {
    // Resume existing session
    const { data, error } = await supabase
      .from('exam_submissions')
      .select('*')
      .eq('id', existing.id)
      .single();
    if (error) throw new AppError(500, 'DB_ERROR', error.message);
    res.json({ data, error: null });
    return;
  }

  // Create new submission
  const { data, error } = await supabase
    .from('exam_submissions')
    .insert({
      institution_id: req.user!.institution_id!,
      exam_id: body.exam_id,
      student_id: student?.id || null,
      candidate_id: candidate?.id || null,
      status: 'in_progress',
      started_at: new Date().toISOString(),
      time_limit_minutes: exam.duration_minutes || 120,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    })
    .select()
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req, action: 'exam_submission_started', entity_type: 'exam_submission', entity_id: data.id });
  res.status(201).json({ data, error: null });
});

// GET /:id — Get submission with questions (student view, answers hidden until submitted)
router.get('/:id', requireInstitutionAccess, async (req: Request, res: Response) => {
  const id = param(req.params.id);

  const { data: submission, error } = await supabase
    .from('exam_submissions')
    .select('*, entrance_exams(name, duration_minutes, total_marks_computed, question_count)')
    .eq('id', id)
    .single();

  if (error || !submission) throw new AppError(404, 'NOT_FOUND', 'Submission not found');

  // Students can only see their own
  if (req.user!.role === 'student' && submission.student_id) {
    const { data: student } = await supabase.from('students').select('id').eq('clerk_user_id', req.user!.sub).single();
    if (student?.id !== submission.student_id) throw new AppError(403, 'FORBIDDEN', 'Access denied');
  }

  // Get questions (without correct answers unless submitted)
  const isSubmitted = submission.status === 'submitted' || submission.status === 'timed_out';
  const { data: questions } = await supabase
    .from('exam_questions')
    .select(isSubmitted ? '*' : 'id, question_text, question_type, options, marks, question_order')
    .eq('exam_id', submission.exam_id)
    .eq('is_active', true)
    .order('question_order');

  res.json({
    data: { ...submission, questions: questions || [] },
    error: null,
  });
});

// POST /:id/answer — Save an answer
router.post('/:id/answer', requireInstitutionAccess, async (req: Request, res: Response) => {
  const id = param(req.params.id);

  const body = z.object({
    question_id: z.string().uuid(),
    answer: z.string(),
  }).parse(req.body);

  const { data: submission, error: fetchError } = await supabase
    .from('exam_submissions')
    .select('id, status, answers')
    .eq('id', id)
    .single();

  if (fetchError || !submission) throw new AppError(404, 'NOT_FOUND', 'Submission not found');
  if (submission.status !== 'in_progress') throw new AppError(400, 'NOT_EDITABLE', 'Exam is no longer in progress');

  // Merge answer into existing answers JSON
  const currentAnswers = (submission.answers as Record<string, string>) || {};
  currentAnswers[body.question_id] = body.answer;

  const { error } = await supabase
    .from('exam_submissions')
    .update({ answers: currentAnswers })
    .eq('id', id);

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data: { saved: true }, error: null });
});

// POST /:id/submit — Finalize submission and calculate score
router.post('/:id/submit', requireInstitutionAccess, async (req: Request, res: Response) => {
  const id = param(req.params.id);

  const { data: submission, error: fetchError } = await supabase
    .from('exam_submissions')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !submission) throw new AppError(404, 'NOT_FOUND', 'Submission not found');
  if (submission.status !== 'in_progress') throw new AppError(400, 'ALREADY_SUBMITTED', 'Exam already submitted');

  // Get correct answers
  const { data: questions } = await supabase
    .from('exam_questions')
    .select('id, correct_answer, marks')
    .eq('exam_id', submission.exam_id)
    .eq('is_active', true);

  const answers = (submission.answers as Record<string, string>) || {};
  let marksObtained = 0;
  let totalMarks = 0;

  for (const q of questions || []) {
    totalMarks += Number(q.marks);
    if (q.correct_answer && answers[q.id] === q.correct_answer) {
      marksObtained += Number(q.marks);
    }
  }

  const scorePercentage = totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 10000) / 100 : 0;

  const { data, error } = await supabase
    .from('exam_submissions')
    .update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      total_marks: totalMarks,
      marks_obtained: marksObtained,
      score_percentage: scorePercentage,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req, action: 'exam_submission_submitted', entity_type: 'exam_submission', entity_id: id, new_value: { score: scorePercentage } });
  res.json({ data, error: null });
});

// GET /:id/result — Get result after submission
router.get('/:id/result', requireInstitutionAccess, async (req: Request, res: Response) => {
  const id = param(req.params.id);

  const { data, error } = await supabase
    .from('exam_submissions')
    .select('id, status, total_marks, marks_obtained, score_percentage, submitted_at, started_at, entrance_exams(name)')
    .eq('id', id)
    .single();

  if (error || !data) throw new AppError(404, 'NOT_FOUND', 'Submission not found');
  if (data.status === 'in_progress') throw new AppError(400, 'NOT_SUBMITTED', 'Exam not yet submitted');

  res.json({ data, error: null });
});

// GET /admin/all — Admin: list all submissions for an exam
router.get('/admin/all', requireInstitutionAccess, requireRole('institution_admin', 'exam_committee'), async (req: Request, res: Response) => {
  const { exam_id } = req.query;
  let query = supabase
    .from('exam_submissions')
    .select('*, students(enrollment_number, users(full_name)), exam_candidates(candidate_name, candidate_email)')
    .eq('institution_id', req.user!.institution_id!)
    .order('submitted_at', { ascending: false });

  if (exam_id) query = query.eq('exam_id', exam_id as string);

  const { data, error } = await query;
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

export default router;
