import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { logAudit } from '../lib/audit';
import { authMiddleware } from '../middleware/auth';
import { requireRole, requireInstitutionAccess } from '../middleware/rbac';
import { AppError } from '../middleware/errorHandler';
import { qs, param } from '../lib/query';
import {
  createRegularExamSchema,
  updateRegularExamSchema,
  updateRegularExamStatusSchema,
  createExamRoomSchema,
  allocateRoomsSchema,
  assignInvigilatorSchema,
  swapInvigilatorSchema,
  enterResultSchema,
  bulkResultUploadSchema,
} from '@uni-edge/types';

const router = Router();
router.use(authMiddleware);

// ============================================
// Regular Exams CRUD
// ============================================

router.get('/', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { program_id, term, academic_year, status } = req.query;
  let query = supabase
    .from('regular_exams')
    .select('*, programs(name, code)')
    .eq('institution_id', req.user!.institution_id!)
    .order('exam_date', { ascending: false });

  if (program_id) query = query.eq('program_id', qs(program_id)!);
  if (term) query = query.eq('term', qs(term)!);
  if (academic_year) query = query.eq('academic_year', qs(academic_year)!);
  if (status) query = query.eq('status', qs(status)!);

  const { data, error } = await query;
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

router.post('/', requireInstitutionAccess, requireRole('institution_admin', 'exam_committee', 'staff'), async (req: Request, res: Response) => {
  const body = createRegularExamSchema.parse({ ...req.body });
  const { data, error } = await supabase
    .from('regular_exams')
    .insert({ ...body, institution_id: req.user!.institution_id! })
    .select('*, programs(name, code)')
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req: req as any, action: 'regular_exam_created', entity_type: 'regular_exam', entity_id: data.id, new_value: body as Record<string, unknown> });
  res.status(201).json({ data, error: null });
});

router.get('/:id', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('regular_exams')
    .select('*, programs(name, code), exam_rooms(*), hall_tickets(id, student_id, ticket_number, seat_number, issued)')
    .eq('id', param(req.params.id))
    .single();

  if (error) throw new AppError(404, 'NOT_FOUND', 'Exam not found');
  if (req.user!.role !== 'super_admin' && data.institution_id !== req.user!.institution_id) {
    throw new AppError(403, 'FORBIDDEN', 'Access denied');
  }

  res.json({ data, error: null });
});

router.patch('/:id', requireInstitutionAccess, requireRole('institution_admin', 'exam_committee', 'staff'), async (req: Request, res: Response) => {
  const body = updateRegularExamSchema.parse(req.body);
  const { data, error } = await supabase
    .from('regular_exams')
    .update(body)
    .eq('id', param(req.params.id))
    .select('*, programs(name, code)')
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req: req as any, action: 'regular_exam_updated', entity_type: 'regular_exam', entity_id: param(req.params.id), new_value: body as Record<string, unknown> });
  res.json({ data, error: null });
});

router.post('/:id/status', requireInstitutionAccess, requireRole('institution_admin', 'exam_committee'), async (req: Request, res: Response) => {
  const body = updateRegularExamStatusSchema.parse(req.body);
  const { data, error } = await supabase
    .from('regular_exams')
    .update({ status: body.status })
    .eq('id', param(req.params.id))
    .select()
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req: req as any, action: 'regular_exam_status_changed', entity_type: 'regular_exam', entity_id: param(req.params.id), new_value: { status: body.status } });
  res.json({ data, error: null });
});

// ============================================
// Exam Rooms
// ============================================

router.post('/:id/rooms', requireInstitutionAccess, requireRole('institution_admin', 'exam_committee'), async (req: Request, res: Response) => {
  const examId = param(req.params.id);
  const body = createExamRoomSchema.parse({ ...req.body, exam_id: examId });

  const { data, error } = await supabase
    .from('exam_rooms')
    .insert({ ...body, institution_id: req.user!.institution_id! })
    .select()
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.status(201).json({ data, error: null });
});

router.post('/:id/rooms/allocate', requireInstitutionAccess, requireRole('institution_admin', 'exam_committee'), async (req: Request, res: Response) => {
  const examId = param(req.params.id);
  const body = allocateRoomsSchema.parse(req.body);

  const { error } = await supabase
    .from('exam_rooms')
    .update({ allocation_status: 'allocated' })
    .in('id', body.room_ids)
    .eq('exam_id', examId);

  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req: req as any, action: 'exam_rooms_allocated', entity_type: 'regular_exam', entity_id: examId, new_value: { room_ids: body.room_ids } });
  res.json({ data: { message: 'Rooms allocated' }, error: null });
});

// ============================================
// Invigilator Assignments
// ============================================

router.post('/:id/invigilators', requireInstitutionAccess, requireRole('institution_admin', 'exam_committee'), async (req: Request, res: Response) => {
  const examId = param(req.params.id);
  const body = assignInvigilatorSchema.parse({ ...req.body, exam_id: examId });

  const { data, error } = await supabase
    .from('invigilator_assignments')
    .insert({ ...body, institution_id: req.user!.institution_id! })
    .select('*, users(full_name, email), exam_rooms(room_name)')
    .single();

  if (error) {
    if (error.code === '23505') throw new AppError(409, 'DOUBLE_BOOKED', 'Invigilator is already assigned to an exam on this date');
    throw new AppError(500, 'DB_ERROR', error.message);
  }

  res.status(201).json({ data, error: null });
});

router.post('/invigilators/swap', requireInstitutionAccess, requireRole('institution_admin', 'exam_committee'), async (req: Request, res: Response) => {
  const body = swapInvigilatorSchema.parse(req.body);

  // Fetch current assignment
  const { data: current } = await supabase
    .from('invigilator_assignments')
    .select('*')
    .eq('id', body.assignment_id)
    .single();

  if (!current) throw new AppError(404, 'NOT_FOUND', 'Assignment not found');

  // Check new invigilator isn't double-booked
  const { data: conflict } = await supabase
    .from('invigilator_assignments')
    .select('id')
    .eq('invigilator_id', body.new_invigilator_id)
    .eq('session_date', current.session_date)
    .neq('id', body.assignment_id)
    .limit(1);

  if (conflict && conflict.length > 0) {
    throw new AppError(409, 'DOUBLE_BOOKED', 'New invigilator is already assigned on this date');
  }

  const { data, error } = await supabase
    .from('invigilator_assignments')
    .update({ invigilator_id: body.new_invigilator_id })
    .eq('id', body.assignment_id)
    .select('*, users(full_name, email), exam_rooms(room_name)')
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req: req as any, action: 'invigilator_swapped', entity_type: 'invigilator_assignment', entity_id: body.assignment_id, new_value: { old: current.invigilator_id, new: body.new_invigilator_id } });
  res.json({ data, error: null });
});

// ============================================
// Hall Tickets
// ============================================

router.post('/:id/hall-tickets', requireInstitutionAccess, requireRole('institution_admin', 'exam_committee'), async (req: Request, res: Response) => {
  const examId = param(req.params.id);

  // Get enrolled students for this exam's program
  const { data: exam } = await supabase.from('regular_exams').select('program_id, institution_id, name').eq('id', examId).single();
  if (!exam) throw new AppError(404, 'NOT_FOUND', 'Exam not found');

  const { data: students } = await supabase
    .from('students')
    .select('id')
    .eq('program_id', exam.program_id)
    .eq('institution_id', exam.institution_id)
    .eq('enrollment_status', 'active');

  if (!students || students.length === 0) {
    throw new AppError(400, 'NO_STUDENTS', 'No enrolled students found for this program');
  }

  // Generate hall tickets
  const tickets = students.map((s, i) => ({
    institution_id: exam.institution_id,
    exam_id: examId,
    student_id: s.id,
    ticket_number: `${exam.name.replace(/\s+/g, '').substring(0, 8).toUpperCase()}-${String(i + 1).padStart(5, '0')}`,
  }));

  const { data, error } = await supabase
    .from('hall_tickets')
    .upsert(tickets, { onConflict: 'exam_id,student_id' })
    .select();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req: req as any, action: 'hall_tickets_generated', entity_type: 'regular_exam', entity_id: examId, new_value: { count: tickets.length } });
  res.status(201).json({ data: { count: data?.length || 0, tickets: data }, error: null });
});

router.post('/hall-tickets/:ticketId/issue', requireInstitutionAccess, requireRole('institution_admin', 'staff'), async (req: Request, res: Response) => {
  const ticketId = param(req.params.ticketId);
  const { data, error } = await supabase
    .from('hall_tickets')
    .update({ issued: true, issued_at: new Date().toISOString() })
    .eq('id', ticketId)
    .select()
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

// ============================================
// Results
// ============================================

router.get('/:id/results', requireInstitutionAccess, async (req: Request, res: Response) => {
  const examId = param(req.params.id);
  const { data, error } = await supabase
    .from('regular_exam_results')
    .select('*, students(enrollment_number, users(full_name))')
    .eq('exam_id', examId)
    .eq('institution_id', req.user!.institution_id!)
    .order('marks_obtained', { ascending: false });

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

router.post('/:id/results', requireInstitutionAccess, requireRole('institution_admin', 'exam_committee', 'faculty'), async (req: Request, res: Response) => {
  const examId = param(req.params.id);
  const body = enterResultSchema.parse({ ...req.body, exam_id: examId });

  const { data, error } = await supabase
    .from('regular_exam_results')
    .upsert({
      ...body,
      institution_id: req.user!.institution_id!,
      entered_by: req.user!.sub,
    }, { onConflict: 'exam_id,student_id' })
    .select('*, students(enrollment_number, users(full_name))')
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.status(201).json({ data, error: null });
});

router.post('/:id/results/bulk', requireInstitutionAccess, requireRole('institution_admin', 'exam_committee'), async (req: Request, res: Response) => {
  const examId = param(req.params.id);
  const body = bulkResultUploadSchema.parse({ ...req.body, exam_id: examId });

  // Look up students by enrollment number
  const enrollNums = body.results.map(r => r.enrollment_number);
  const { data: students } = await supabase
    .from('students')
    .select('id, enrollment_number')
    .eq('institution_id', req.user!.institution_id!)
    .in('enrollment_number', enrollNums);

  const studentMap = new Map(students?.map(s => [s.enrollment_number, s.id]) || []);

  const records = body.results
    .filter(r => studentMap.has(r.enrollment_number))
    .map(r => ({
      institution_id: req.user!.institution_id!,
      exam_id: examId,
      student_id: studentMap.get(r.enrollment_number)!,
      marks_obtained: r.marks_obtained,
      grade: r.grade || null,
      grade_points: r.grade_points || null,
      entered_by: req.user!.sub,
    }));

  const { data, error } = await supabase
    .from('regular_exam_results')
    .upsert(records, { onConflict: 'exam_id,student_id' })
    .select();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req: req as any, action: 'results_bulk_uploaded', entity_type: 'regular_exam', entity_id: examId, new_value: { count: records.length } });
  res.status(201).json({ data: { count: data?.length || 0 }, error: null });
});

router.post('/:id/results/publish', requireInstitutionAccess, requireRole('institution_admin', 'exam_committee'), async (req: Request, res: Response) => {
  const examId = param(req.params.id);
  const { error } = await supabase
    .from('regular_exam_results')
    .update({ is_published: true })
    .eq('exam_id', examId)
    .eq('is_published', false);

  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req: req as any, action: 'results_published', entity_type: 'regular_exam', entity_id: examId });
  res.json({ data: { message: 'Results published' }, error: null });
});

export default router;
