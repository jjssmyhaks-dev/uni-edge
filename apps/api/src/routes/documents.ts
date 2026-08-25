import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { logAudit } from '../lib/audit';
import { authMiddleware } from '../middleware/auth';
import { requireInstitutionAccess } from '../middleware/rbac';
import { AppError } from '../middleware/errorHandler';
import { param } from '../lib/query';
import { z } from 'zod';

const router = Router();
router.use(authMiddleware);

// GET / — List documents for an application
router.get('/', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { application_id, student_id } = req.query;

  let query = supabase.from('documents').select('*').eq('institution_id', req.user!.institution_id!);

  if (application_id) query = query.eq('application_id', application_id as string);
  if (student_id) query = query.eq('student_id', student_id as string);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

// POST /upload — Record a document upload
router.post('/upload', requireInstitutionAccess, async (req: Request, res: Response) => {
  const body = z.object({
    application_id: z.string().uuid().optional(),
    student_id: z.string().uuid().optional(),
    document_type: z.enum(['marksheet', 'id_proof', 'category_cert', 'photo', 'signature', 'transfer_cert', 'migration_cert', 'payment_receipt']),
    file_url: z.string().url(),
    file_name: z.string().optional(),
    file_size: z.number().int().optional(),
    mime_type: z.string().optional(),
  }).parse(req.body);

  if (!body.application_id && !body.student_id) {
    throw new AppError(400, 'VALIDATION', 'Either application_id or student_id is required');
  }

  const { data, error } = await supabase.from('documents').insert({
    ...body,
    institution_id: req.user!.institution_id,
  }).select().single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req, action: 'document_uploaded', entity_type: 'document', entity_id: data.id, new_value: { document_type: body.document_type } });
  res.status(201).json({ data, error: null });
});

// POST /parse — Trigger document parsing via AI service
router.post('/parse', requireInstitutionAccess, async (req: Request, res: Response) => {
  const body = z.object({ document_id: z.string().uuid() }).parse(req.body);

  const { data: doc, error: fetchError } = await supabase.from('documents').select('*').eq('id', body.document_id).single();
  if (fetchError || !doc) throw new AppError(404, 'NOT_FOUND', 'Document not found');

  // Call Python AI service for parsing
  const aiServiceUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';
  try {
    const aiResponse = await fetch(`${aiServiceUrl}/parse-document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_url: doc.file_url, document_type: doc.document_type }),
    });

    const aiResult = await aiResponse.json();

    // Update document with parsed data
    const { data, error } = await supabase.from('documents').update({
      parsed_data: aiResult.extracted_data?.extracted_fields || {},
    }).eq('id', body.document_id).select().single();

    if (error) throw new AppError(500, 'DB_ERROR', error.message);

    await logAudit({ req, action: 'document_parsed', entity_type: 'document', entity_id: body.document_id });
    res.json({ data, error: null });
  } catch (aiError) {
    // AI service may not be running — still succeed, mark as needing manual review
    console.error('AI parse failed:', aiError);
    res.json({ data: doc, error: null, warning: 'AI parsing unavailable — manual review required' });
  }
});

// PATCH /:id/verify — Manual verification
router.patch('/:id/verify', requireInstitutionAccess, async (req: Request, res: Response) => {
  const id = param(req.params.id);
  const body = z.object({
    verification_status: z.enum(['verified', 'rejected', 'resubmission_required']),
  }).parse(req.body);

  const { data, error } = await supabase.from('documents').update({
    verification_status: body.verification_status,
    verified_by: req.user!.sub,
    verified_at: new Date().toISOString(),
  }).eq('id', id).select().single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req, action: 'document_verified', entity_type: 'document', entity_id: id, new_value: body });
  res.json({ data, error: null });
});

export default router;
