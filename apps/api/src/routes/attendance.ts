import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { logAudit } from '../lib/audit';
import { authMiddleware } from '../middleware/auth';
import { requireRole, requireInstitutionAccess } from '../middleware/rbac';
import { AppError } from '../middleware/errorHandler';
import { qs, param } from '../lib/query';
import { createAttendanceSchema, bulkAttendanceSchema } from '@uni-edge/types';

const router = Router();
router.use(authMiddleware);

// GET / — List attendance records (with filters)
router.get('/', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { program_id, course_code, date, date_from, date_to, student_id } = req.query;
  let query = supabase
    .from('attendance_records')
    .select('*, students(enrollment_number, users(full_name)), programs(name)')
    .eq('institution_id', req.user!.institution_id!)
    .order('date', { ascending: false });

  if (program_id) query = query.eq('program_id', qs(program_id)!);
  if (course_code) query = query.eq('course_code', qs(course_code)!);
  if (date) query = query.eq('date', qs(date)!);
  if (date_from) query = query.gte('date', qs(date_from)!);
  if (date_to) query = query.lte('date', qs(date_to)!);
  if (student_id) query = query.eq('student_id', qs(student_id)!);

  const { data, error } = await query;
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

// POST / — Single attendance mark
router.post('/', requireInstitutionAccess, requireRole('institution_admin', 'faculty', 'staff'), async (req: Request, res: Response) => {
  const body = createAttendanceSchema.parse({
    ...req.body,
  });

  // Verify student belongs to institution
  const { data: student } = await supabase
    .from('students')
    .select('institution_id')
    .eq('id', body.student_id)
    .single();

  if (!student || student.institution_id !== req.user!.institution_id) {
    throw new AppError(404, 'NOT_FOUND', 'Student not found in your institution');
  }

  const { data, error } = await supabase
    .from('attendance_records')
    .upsert({
      ...body,
      institution_id: req.user!.institution_id!,
      marked_by: req.user!.sub,
    }, { onConflict: 'student_id,program_id,course_code,date' })
    .select()
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({
    req: req as any,
    action: 'attendance_marked',
    entity_type: 'attendance_record',
    entity_id: data.id,
    new_value: body as Record<string, unknown>,
  });

  res.status(201).json({ data, error: null });
});

// POST /bulk — Bulk attendance marking
router.post('/bulk', requireInstitutionAccess, requireRole('institution_admin', 'faculty', 'staff'), async (req: Request, res: Response) => {
  const body = bulkAttendanceSchema.parse(req.body);

  const records = body.records.map(r => ({
    ...r,
    institution_id: req.user!.institution_id!,
    marked_by: req.user!.sub,
  }));

  const { data, error } = await supabase
    .from('attendance_records')
    .upsert(records, { onConflict: 'student_id,program_id,course_code,date' })
    .select();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({
    req: req as any,
    action: 'attendance_bulk_marked',
    entity_type: 'attendance_record',
    new_value: { count: records.length },
  });

  res.status(201).json({ data, error: null });
});

// GET /summary/:studentId — Student attendance summary
router.get('/summary/:studentId', requireInstitutionAccess, async (req: Request, res: Response) => {
  const studentId = param(req.params.studentId);
  const { program_id, course_code } = req.query;

  let query = supabase
    .from('attendance_records')
    .select('status, date')
    .eq('student_id', studentId)
    .eq('institution_id', req.user!.institution_id!);

  if (program_id) query = query.eq('program_id', qs(program_id)!);
  if (course_code) query = query.eq('course_code', qs(course_code)!);

  const { data, error } = await query;
  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  const total = data?.length || 0;
  const present = data?.filter(r => r.status === 'present' || r.status === 'late').length || 0;
  const absent = data?.filter(r => r.status === 'absent').length || 0;
  const excused = data?.filter(r => r.status === 'excused').length || 0;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  res.json({
    data: {
      total_classes: total,
      present,
      absent,
      excused,
      percentage,
    },
    error: null,
  });
});

export default router;
