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

// GET / — List results for an exam
router.get('/', requireInstitutionAccess, async (req: Request, res: Response) => {
  const examId = qs(req.query.exam_id);

  let query = supabase
    .from('exam_results')
    .select('*, exam_candidates(candidate_name, candidate_email, registration_number, category)')
    .eq('institution_id', req.user!.institution_id!);

  if (examId) query = query.eq('exam_id', examId);

  const { data, error } = await query.order('merit_rank', { ascending: true });
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

// POST / — Enter a single result
router.post('/', requireExamManagement, requireInstitutionAccess, async (req: Request, res: Response) => {
  const body = z.object({
    exam_id: z.string().uuid(),
    candidate_id: z.string().uuid(),
    score: z.number().min(0),
    category: z.enum(['General', 'OBC', 'SC', 'ST', 'EWS']).optional(),
  }).parse(req.body);

  // Check if result already exists for this candidate+exam
  const { data: existing } = await supabase.from('exam_results').select('id').eq('exam_id', body.exam_id).eq('candidate_id', body.candidate_id).single();
  if (existing) throw new AppError(409, 'DUPLICATE', 'Result already exists for this candidate');

  const { data, error } = await supabase.from('exam_results').insert({
    ...body,
    institution_id: req.user!.institution_id,
  }).select().single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req, action: 'result_entered', entity_type: 'exam_result', entity_id: data.id, new_value: body });
  res.status(201).json({ data, error: null });
});

// POST /bulk — Bulk upload results
router.post('/bulk', requireExamManagement, requireInstitutionAccess, async (req: Request, res: Response) => {
  const body = z.object({
    exam_id: z.string().uuid(),
    results: z.array(z.object({
      registration_number: z.string().min(1),
      score: z.number().min(0),
      category: z.enum(['General', 'OBC', 'SC', 'ST', 'EWS']).optional(),
    })),
  }).parse(req.body);

  // Look up candidate IDs by registration number
  const regNumbers = body.results.map(r => r.registration_number);
  const { data: candidates, error: candError } = await supabase
    .from('exam_candidates')
    .select('id, registration_number')
    .eq('exam_id', body.exam_id)
    .in('registration_number', regNumbers);

  if (candError) throw new AppError(500, 'DB_ERROR', candError.message);

  const candidateMap = new Map(candidates?.map(c => [c.registration_number, c.id]) || []);

  const insertData = [];
  const skipped = [];

  for (const result of body.results) {
    const candidateId = candidateMap.get(result.registration_number);
    if (!candidateId) {
      skipped.push(result.registration_number);
      continue;
    }
    insertData.push({
      exam_id: body.exam_id,
      candidate_id: candidateId,
      institution_id: req.user!.institution_id,
      score: result.score,
      category: result.category,
    });
  }

  if (insertData.length > 0) {
    const { error } = await supabase.from('exam_results').insert(insertData);
    if (error) throw new AppError(500, 'DB_ERROR', error.message);
  }

  await logAudit({ req, action: 'results_bulk_uploaded', entity_type: 'exam_result', new_value: { exam_id: body.exam_id, entered: insertData.length, skipped } });
  res.status(201).json({ data: { entered: insertData.length, skipped }, error: null });
});

// POST /generate-merit-list — Calculate and assign merit ranks
router.post('/generate-merit-list', requireExamManagement, requireInstitutionAccess, async (req: Request, res: Response) => {
  const body = z.object({
    exam_id: z.string().uuid(),
  }).parse(req.body);

  // Fetch all results for this exam, sorted by score descending
  const { data: results, error } = await supabase
    .from('exam_results')
    .select('id, score, category, exam_candidates!inner(category)')
    .eq('exam_id', body.exam_id)
    .eq('institution_id', req.user!.institution_id!)
    .order('score', { ascending: false });

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  if (!results?.length) throw new AppError(400, 'NO_RESULTS', 'No results found for this exam');

  // Assign overall merit rank
  const updates = results.map((r: any, index: number) => ({
    id: r.id,
    merit_rank: index + 1,
    // Use candidate's category if result category is not set
    category: r.category || r.exam_candidates?.category || 'General',
  }));

  // Update each result with its merit rank
  for (const update of updates) {
    await supabase.from('exam_results').update({
      merit_rank: update.merit_rank,
      category: update.category,
    }).eq('id', update.id);
  }

  await logAudit({ req, action: 'merit_list_generated', entity_type: 'entrance_exam', entity_id: body.exam_id, new_value: { total_candidates: results.length } });

  res.json({
    data: {
      exam_id: body.exam_id,
      total_candidates: results.length,
      topper: results[0] ? { score: results[0].score, rank: 1 } : null,
    },
    error: null,
  });
});

// POST /publish — Publish results for candidate viewing
router.post('/publish', requireExamManagement, requireInstitutionAccess, async (req: Request, res: Response) => {
  const body = z.object({ exam_id: z.string().uuid() }).parse(req.body);

  const { error } = await supabase.from('exam_results').update({ is_published: true }).eq('exam_id', body.exam_id).eq('is_published', false);
  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req, action: 'results_published', entity_type: 'entrance_exam', entity_id: body.exam_id });
  res.json({ data: { message: 'Results published successfully' }, error: null });
});

export default router;
