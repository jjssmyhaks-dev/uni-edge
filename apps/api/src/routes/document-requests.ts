import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { logAudit } from '../lib/audit';
import { authMiddleware } from '../middleware/auth';
import { requireRole, requireInstitutionAccess } from '../middleware/rbac';
import { AppError } from '../middleware/errorHandler';
import { qs, param } from '../lib/query';
import { createDocumentRequestSchema, updateDocumentRequestSchema } from '@uni-edge/types';

const router = Router();
router.use(authMiddleware);

// GET / — List document requests
router.get('/', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { status, student_id } = req.query;
  let query = supabase
    .from('document_requests')
    .select('*, students(enrollment_number, users(full_name))')
    .eq('institution_id', req.user!.institution_id!)
    .order('created_at', { ascending: false });

  // Students only see their own
  if (req.user!.role === 'student') {
    query = query.eq('student_id', student_id || '');
  }

  if (status) query = query.eq('status', qs(status)!);
  if (student_id && req.user!.role !== 'student') query = query.eq('student_id', qs(student_id)!);

  const { data, error } = await query;
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

// POST / — Create document request
router.post('/', requireInstitutionAccess, async (req: Request, res: Response) => {
  const body = createDocumentRequestSchema.parse(req.body);

  // Verify student belongs to institution
  const { data: student } = await supabase
    .from('students')
    .select('institution_id')
    .eq('id', body.student_id)
    .single();

  if (!student || student.institution_id !== req.user!.institution_id) {
    throw new AppError(404, 'NOT_FOUND', 'Student not found in your institution');
  }

  // Students can only request for themselves
  if (req.user!.role === 'student') {
    const { data: ownStudent } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', req.user!.sub)
      .single();
    if (ownStudent?.id !== body.student_id) {
      throw new AppError(403, 'FORBIDDEN', 'You can only create requests for yourself');
    }
  }

  const { data, error } = await supabase
    .from('document_requests')
    .insert({
      institution_id: req.user!.institution_id!,
      ...body,
    })
    .select('*, students(enrollment_number, users(full_name))')
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({
    req: req as any,
    action: 'document_request_created',
    entity_type: 'document_request',
    entity_id: data.id,
    new_value: { request_type: body.request_type },
  });

  res.status(201).json({ data, error: null });
});

// GET /:id — Get document request
router.get('/:id', requireInstitutionAccess, async (req: Request, res: Response) => {
  const id = param(req.params.id);
  const { data, error } = await supabase
    .from('document_requests')
    .select('*, students(enrollment_number, users(full_name))')
    .eq('id', id)
    .single();

  if (error) throw new AppError(404, 'NOT_FOUND', 'Document request not found');
  if (data.institution_id !== req.user!.institution_id && req.user!.role !== 'super_admin') {
    throw new AppError(403, 'FORBIDDEN', 'Access denied');
  }

  res.json({ data, error: null });
});

// PATCH /:id — Update document request status
router.patch('/:id', requireInstitutionAccess, requireRole('institution_admin', 'staff'), async (req: Request, res: Response) => {
  const id = param(req.params.id);
  const body = updateDocumentRequestSchema.parse(req.body);

  const updateData: Record<string, unknown> = { ...body, processed_by: req.user!.sub, processed_at: new Date().toISOString() };
  if (body.status === 'issued') {
    updateData.issued_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('document_requests')
    .update(updateData)
    .eq('id', id)
    .select('*, students(enrollment_number, users(full_name))')
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({
    req: req as any,
    action: 'document_request_status_changed',
    entity_type: 'document_request',
    entity_id: id,
    new_value: { status: body.status },
  });

  res.json({ data, error: null });
});

export default router;
