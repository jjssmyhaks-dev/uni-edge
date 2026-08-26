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

// POST /generate — Generate merit list for a cycle
router.post('/generate', requireInstitutionAccess, requireRole('institution_admin', 'exam_committee'), async (req: Request, res: Response) => {
  const body = z.object({
    cycle_id: z.string().uuid(),
    formula: z.enum(['entrance_only', 'prior_record_only', 'weighted']).default('entrance_only'),
    entrance_weight: z.number().min(0).max(100).default(100),
  }).parse(req.body);

  // Get the cycle to find institution_id
  const { data: cycle, error: cycleError } = await supabase
    .from('admission_cycles')
    .select('institution_id')
    .eq('id', body.cycle_id)
    .single();

  if (cycleError || !cycle) throw new AppError(404, 'NOT_FOUND', 'Admission cycle not found');
  const institutionId = cycle.institution_id;

  // Get all confirmed applications for this cycle
  const { data: applications, error: appError } = await supabase
    .from('applications')
    .select('id, applicant_name, applicant_email, form_data, status')
    .eq('cycle_id', body.cycle_id)
    .in('status', ['submitted', 'under_review', 'shortlisted']);

  if (appError) throw new AppError(500, 'DB_ERROR', appError.message);
  if (!applications || applications.length === 0) {
    throw new AppError(400, 'NO_APPLICATIONS', 'No applications found for this cycle');
  }

  // Get entrance exam results for this cycle
  const { data: exams } = await supabase
    .from('entrance_exams')
    .select('id')
    .eq('cycle_id', body.cycle_id)
    .eq('institution_id', institutionId);

  const examIds = exams?.map(e => e.id) || [];

  let scores: Record<string, number> = {};

  if (examIds.length > 0 && (body.formula === 'entrance_only' || body.formula === 'weighted')) {
    // Get exam submissions (scores)
    const { data: submissions } = await supabase
      .from('exam_submissions')
      .select('candidate_id, score_percentage')
      .in('exam_id', examIds)
      .eq('status', 'submitted');

    // Also check exam_results table
    const { data: examResults } = await supabase
      .from('exam_results')
      .select('candidate_id, score')
      .in('exam_id', examIds);

    // Map scores by candidate email (since applications link via email)
    for (const sub of submissions || []) {
      if (sub.candidate_id) {
        const { data: candidate } = await supabase.from('exam_candidates').select('candidate_email').eq('id', sub.candidate_id).single();
        if (candidate?.candidate_email) {
          scores[candidate.candidate_email] = Number(sub.score_percentage);
        }
      }
    }

    for (const result of examResults || []) {
      if (result.candidate_id) {
        const { data: candidate } = await supabase.from('exam_candidates').select('candidate_email').eq('id', result.candidate_id).single();
        if (candidate?.candidate_email && !scores[candidate.candidate_email]) {
          scores[candidate.candidate_email] = Number(result.score);
        }
      }
    }
  }

  // Calculate scores and build merit list
  const meritList = applications.map((app, _index) => {
    const examScore = scores[app.applicant_email || ''] || 0;
    let finalScore = examScore;

    if (body.formula === 'weighted') {
      const priorScore = 50; // Default if no prior record
      finalScore = (examScore * body.entrance_weight + priorScore * (100 - body.entrance_weight)) / 100;
    } else if (body.formula === 'prior_record_only') {
      finalScore = 50; // Placeholder
    }

    return {
      application_id: app.id,
      applicant_name: app.applicant_name,
      applicant_email: app.applicant_email,
      score: Math.round(finalScore * 100) / 100,
      status: app.status,
      form_data: app.form_data,
    };
  });

  // Sort by score descending
  meritList.sort((a, b) => b.score - a.score);

  // Assign ranks
  const ranked = meritList.map((item, index) => ({
    ...item,
    merit_rank: index + 1,
  }));

  // Update merit_rank on applications
  for (const item of ranked) {
    await supabase
      .from('applications')
      .update({ merit_rank: item.merit_rank })
      .eq('id', item.application_id);
  }

  await logAudit({ req, action: 'merit_list_generated', entity_type: 'admission_cycle', entity_id: body.cycle_id, new_value: { count: ranked.length, formula: body.formula } });

  res.json({ data: ranked, error: null });
});

// GET /:cycleId — Get merit list for a cycle
router.get('/:cycleId', requireInstitutionAccess, async (req: Request, res: Response) => {
  const cycleId = param(req.params.id);

  const { data, error } = await supabase
    .from('applications')
    .select('id, applicant_name, applicant_email, merit_rank, status, form_data')
    .eq('cycle_id', cycleId)
    .not('merit_rank', 'is', null)
    .order('merit_rank');

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

// POST /:cycleId/publish — Publish merit list (students can now see it)
router.post('/:cycleId/publish', requireInstitutionAccess, requireRole('institution_admin'), async (req: Request, res: Response) => {
  const cycleId = param(req.params.id);

  // Update cycle status to indicate merit list published
  const { error } = await supabase
    .from('admission_cycles')
    .update({ status: 'results_published' })
    .eq('id', cycleId);

  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req, action: 'merit_list_published', entity_type: 'admission_cycle', entity_id: cycleId });
  res.json({ data: { message: 'Merit list published' }, error: null });
});

export default router;
