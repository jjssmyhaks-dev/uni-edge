import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { logAudit } from '../lib/audit';
import { authMiddleware } from '../middleware/auth';
import { requireRole, requireInstitutionAccess } from '../middleware/rbac';
import { AppError } from '../middleware/errorHandler';
import { qs, param } from '../lib/query';

const router = Router();
router.use(authMiddleware);

// ============================================
// SEMESTERS
// ============================================

router.get('/semesters', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { program_id, status } = req.query;
  let query = supabase
    .from('semesters')
    .select('*, programs(name, code)')
    .eq('institution_id', req.user!.institution_id!)
    .order('start_date', { ascending: false });

  if (program_id) query = query.eq('program_id', qs(program_id)!);
  if (status) query = query.eq('status', qs(status)!);

  const { data, error } = await query;
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

router.get('/semesters/:id', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('semesters')
    .select('*, programs(name, code), course_offerings(*, courses(*))')
    .eq('id', param(req.params.id))
    .single();

  if (error) throw new AppError(404, 'NOT_FOUND', 'Semester not found');
  if (req.user!.role !== 'super_admin' && data.institution_id !== req.user!.institution_id) {
    throw new AppError(403, 'FORBIDDEN', 'Access denied');
  }

  res.json({ data, error: null });
});

router.post('/semesters', requireInstitutionAccess, requireRole('institution_admin', 'staff'), async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('semesters')
    .insert({ ...req.body, institution_id: req.user!.institution_id! })
    .select('*, programs(name, code)')
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  await logAudit({ req: req as any, action: 'semester_created', entity_type: 'semester', entity_id: data.id, new_value: req.body });
  res.status(201).json({ data, error: null });
});

router.patch('/semesters/:id', requireInstitutionAccess, requireRole('institution_admin', 'staff'), async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('semesters')
    .update(req.body)
    .eq('id', param(req.params.id))
    .select()
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

// ============================================
// COURSES
// ============================================

router.get('/courses', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { department_id, course_type } = req.query;
  let query = supabase
    .from('courses')
    .select('*, departments(name)')
    .eq('institution_id', req.user!.institution_id!)
    .eq('is_active', true)
    .order('course_code');

  if (department_id) query = query.eq('department_id', qs(department_id)!);
  if (course_type) query = query.eq('course_type', qs(course_type)!);

  const { data, error } = await query;
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

router.get('/courses/:id', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('courses')
    .select('*, departments(name), course_offerings(*, semesters(*), users(full_name))')
    .eq('id', param(req.params.id))
    .single();

  if (error) throw new AppError(404, 'NOT_FOUND', 'Course not found');
  if (req.user!.role !== 'super_admin' && data.institution_id !== req.user!.institution_id) {
    throw new AppError(403, 'FORBIDDEN', 'Access denied');
  }

  res.json({ data, error: null });
});

router.post('/courses', requireInstitutionAccess, requireRole('institution_admin', 'staff'), async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('courses')
    .insert({ ...req.body, institution_id: req.user!.institution_id! })
    .select('*, departments(name)')
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.status(201).json({ data, error: null });
});

router.patch('/courses/:id', requireInstitutionAccess, requireRole('institution_admin', 'staff'), async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('courses')
    .update(req.body)
    .eq('id', param(req.params.id))
    .select()
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

// ============================================
// COURSE OFFERINGS
// ============================================

router.get('/course-offerings', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { semester_id, course_id } = req.query;
  let query = supabase
    .from('course_offerings')
    .select('*, courses(*), semesters(*), users!course_offerings_instructor_id_fkey(full_name)')
    .eq('institution_id', req.user!.institution_id!)
    .eq('is_active', true);

  if (semester_id) query = query.eq('semester_id', qs(semester_id)!);
  if (course_id) query = query.eq('course_id', qs(course_id)!);

  const { data, error } = await query;
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

router.post('/course-offerings', requireInstitutionAccess, requireRole('institution_admin', 'staff'), async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('course_offerings')
    .insert({ ...req.body, institution_id: req.user!.institution_id! })
    .select('*, courses(*), semesters(*)')
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.status(201).json({ data, error: null });
});

// ============================================
// ENROLLMENTS
// ============================================

router.get('/enrollments', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { student_id, semester_id } = req.query;
  let query = supabase
    .from('enrollments')
    .select('*, course_offerings(*, courses(*), semesters(*), users!course_offerings_instructor_id_fkey(full_name)), students(enrollment_number, users(full_name))')
    .eq('institution_id', req.user!.institution_id!);

  if (student_id) query = query.eq('student_id', qs(student_id)!);
  if (semester_id) {
    query = query.eq('course_offerings.semester_id', qs(semester_id)!);
  }

  const { data, error } = await query;
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

router.post('/enrollments', requireInstitutionAccess, requireRole('institution_admin', 'staff'), async (req: Request, res: Response) => {
  const { student_id, course_offering_id } = req.body;

  // Check capacity
  const { data: offering } = await supabase
    .from('course_offerings')
    .select('capacity, enrolled_count')
    .eq('id', course_offering_id)
    .single();

  if (offering && offering.enrolled_count >= offering.capacity) {
    throw new AppError(400, 'FULL', 'Course offering has reached maximum capacity');
  }

  const { data, error } = await supabase
    .from('enrollments')
    .insert({ student_id, course_offering_id, institution_id: req.user!.institution_id! })
    .select('*, course_offerings(courses(course_name, course_code))')
    .single();

  if (error) {
    if (error.code === '23505') throw new AppError(409, 'ALREADY_ENROLLED', 'Student is already enrolled in this course');
    throw new AppError(500, 'DB_ERROR', error.message);
  }

  // Increment enrolled_count
  await supabase
    .from('course_offerings')
    .update({ enrolled_count: (offering?.enrolled_count || 0) + 1 })
    .eq('id', course_offering_id);

  res.status(201).json({ data, error: null });
});

router.delete('/enrollments/:id', requireInstitutionAccess, requireRole('institution_admin', 'staff'), async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('enrollments')
    .update({ status: 'dropped' })
    .eq('id', param(req.params.id))
    .select()
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

// ============================================
// ASSESSMENTS
// ============================================

router.get('/assessments', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { course_offering_id, assessment_type, status } = req.query;
  let query = supabase
    .from('assessments')
    .select('*, course_offerings(*, courses(course_name, course_code))')
    .eq('institution_id', req.user!.institution_id!)
    .order('due_date', { ascending: true });

  if (course_offering_id) query = query.eq('course_offering_id', qs(course_offering_id)!);
  if (assessment_type) query = query.eq('assessment_type', qs(assessment_type)!);
  if (status) query = query.eq('status', qs(status)!);

  const { data, error } = await query;
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

router.post('/assessments', requireInstitutionAccess, requireRole('institution_admin', 'faculty', 'staff'), async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('assessments')
    .insert({ ...req.body, institution_id: req.user!.institution_id! })
    .select('*, course_offerings(courses(course_name, course_code))')
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.status(201).json({ data, error: null });
});

router.patch('/assessments/:id', requireInstitutionAccess, requireRole('institution_admin', 'faculty', 'staff'), async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('assessments')
    .update(req.body)
    .eq('id', param(req.params.id))
    .select()
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

// ============================================
// ASSIGNMENT SUBMISSIONS
// ============================================

router.get('/submissions', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { assessment_id, student_id } = req.query;
  let query = supabase
    .from('assignment_submissions')
    .select('*, assessments(title, assessment_type, max_marks, course_offerings(courses(course_name, course_code))), students(enrollment_number, users(full_name))')
    .eq('institution_id', req.user!.institution_id!)
    .order('submitted_at', { ascending: false });

  if (assessment_id) query = query.eq('assessment_id', qs(assessment_id)!);
  if (student_id) query = query.eq('student_id', qs(student_id)!);

  const { data, error } = await query;
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

router.post('/submissions', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { assessment_id, student_id, file_url, file_name, file_size, content } = req.body;

  // Check if assessment allows resubmission
  const { data: assessment } = await supabase
    .from('assessments')
    .select('allow_resubmission, allow_late_submission, due_date, course_offering_id')
    .eq('id', assessment_id)
    .single();

  if (!assessment) throw new AppError(404, 'NOT_FOUND', 'Assessment not found');

  // Check for existing submission
  const { data: existing } = await supabase
    .from('assignment_submissions')
    .select('attempt_number')
    .eq('assessment_id', assessment_id)
    .eq('student_id', student_id)
    .order('attempt_number', { ascending: false })
    .limit(1);

  const attemptNumber = existing && existing.length > 0 ? existing[0].attempt_number + 1 : 1;

  if (attemptNumber > 1 && !assessment.allow_resubmission) {
    throw new AppError(400, 'NO_RESUBMISSION', 'Resubmission is not allowed for this assessment');
  }

  const isLate = assessment.due_date && new Date() > new Date(assessment.due_date);
  if (isLate && !assessment.allow_late_submission) {
    throw new AppError(400, 'LATE_NOT_ALLOWED', 'Late submission is not allowed for this assessment');
  }

  const { data, error } = await supabase
    .from('assignment_submissions')
    .insert({
      assessment_id,
      student_id,
      institution_id: req.user!.institution_id!,
      file_url,
      file_name,
      file_size,
      content,
      is_late: isLate,
      attempt_number: attemptNumber,
      status: isLate ? 'late' : 'submitted',
    })
    .select('*, assessments(title, max_marks)')
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.status(201).json({ data, error: null });
});

router.patch('/submissions/:id/grade', requireInstitutionAccess, requireRole('institution_admin', 'faculty'), async (req: Request, res: Response) => {
  const { grade, feedback } = req.body;

  const { data, error } = await supabase
    .from('assignment_submissions')
    .update({
      grade,
      feedback,
      status: 'graded',
      graded_by: req.user!.sub,
      graded_at: new Date().toISOString(),
    })
    .eq('id', param(req.params.id))
    .select()
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

// ============================================
// GRADES
// ============================================

router.get('/grades', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { student_id, semester_id } = req.query;
  let query = supabase
    .from('student_grades')
    .select('*, course_offerings(*, courses(*), semesters(*)), students(enrollment_number, users(full_name))')
    .eq('institution_id', req.user!.institution_id!)
    .order('created_at', { ascending: false });

  if (student_id) query = query.eq('student_id', qs(student_id)!);
  if (semester_id) query = query.eq('semester_id', qs(semester_id)!);

  const { data, error } = await query;
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

router.post('/grades', requireInstitutionAccess, requireRole('institution_admin', 'faculty'), async (req: Request, res: Response) => {
  const { student_id, course_offering_id, semester_id, marks_obtained, total_marks, letter_grade, grade_points, credits_earned } = req.body;
  const percentage = total_marks > 0 ? (marks_obtained / total_marks) * 100 : 0;

  const { data, error } = await supabase
    .from('student_grades')
    .upsert({
      student_id,
      course_offering_id,
      semester_id,
      institution_id: req.user!.institution_id!,
      marks_obtained,
      total_marks,
      percentage,
      letter_grade,
      grade_points,
      credits_earned,
      status: 'published',
      published_at: new Date().toISOString(),
    }, { onConflict: 'student_id,course_offering_id' })
    .select()
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.status(201).json({ data, error: null });
});

router.get('/grades/cgpa/:studentId', requireInstitutionAccess, async (req: Request, res: Response) => {
  const studentId = param(req.params.studentId);

  const { data, error } = await supabase
    .from('student_grades')
    .select('grade_points, credits_earned')
    .eq('student_id', studentId)
    .eq('institution_id', req.user!.institution_id!)
    .eq('status', 'published');

  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  let totalCredits = 0;
  let totalGradePoints = 0;

  (data || []).forEach(g => {
    const credits = g.credits_earned || 0;
    totalCredits += credits;
    totalGradePoints += (g.grade_points || 0) * credits;
  });

  const cgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00';

  res.json({
    data: {
      cgpa: parseFloat(cgpa as string),
      total_credits: totalCredits,
      total_grade_points: totalGradePoints,
    },
    error: null,
  });
});

// ============================================
// ANNOUNCEMENTS
// ============================================

router.get('/announcements', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { course_offering_id, scope } = req.query;
  let query = supabase
    .from('course_announcements')
    .select('*, course_offerings(courses(course_name, course_code)), users!course_announcements_published_by_fkey(full_name)')
    .eq('institution_id', req.user!.institution_id!)
    .order('published_at', { ascending: false });

  if (course_offering_id) query = query.eq('course_offering_id', qs(course_offering_id)!);
  if (scope) query = query.eq('scope', qs(scope)!);

  const { data, error } = await query;
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

router.post('/announcements', requireInstitutionAccess, requireRole('institution_admin', 'faculty', 'staff'), async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('course_announcements')
    .insert({ ...req.body, published_by: req.user!.sub, institution_id: req.user!.institution_id! })
    .select()
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.status(201).json({ data, error: null });
});

// ============================================
// COURSE MATERIALS
// ============================================

router.get('/course-materials', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { course_offering_id } = req.query;
  let query = supabase
    .from('course_materials')
    .select('*, users!course_materials_uploaded_by_fkey(full_name)')
    .eq('institution_id', req.user!.institution_id!)
    .eq('is_visible', true)
    .order('created_at', { ascending: false });

  if (course_offering_id) query = query.eq('course_offering_id', qs(course_offering_id)!);

  const { data, error } = await query;
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

router.post('/course-materials', requireInstitutionAccess, requireRole('institution_admin', 'faculty', 'staff'), async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('course_materials')
    .insert({ ...req.body, uploaded_by: req.user!.sub, institution_id: req.user!.institution_id! })
    .select()
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.status(201).json({ data, error: null });
});

// ============================================
// GRIEVANCES
// ============================================

router.get('/grievances', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { status, category, student_id } = req.query;
  let query = supabase
    .from('grievances')
    .select('*, students(enrollment_number, users(full_name)), users!grievances_assigned_to_fkey(full_name), grievance_replies(*, users(full_name))')
    .eq('institution_id', req.user!.institution_id!)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', qs(status)!);
  if (category) query = query.eq('category', qs(category)!);
  if (student_id) query = query.eq('student_id', qs(student_id)!);

  const { data, error } = await query;
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

router.post('/grievances', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { subject, description, category, priority } = req.body;

  // Get student ID from user
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('clerk_user_id', req.user!.sub)
    .single();

  if (!student) throw new AppError(404, 'NOT_FOUND', 'Student record not found');

  const { data, error } = await supabase
    .from('grievances')
    .insert({
      student_id: student.id,
      subject,
      description,
      category: category || 'academic',
      priority: priority || 'normal',
      institution_id: req.user!.institution_id!,
    })
    .select('*, students(enrollment_number, users(full_name))')
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req: req as any, action: 'grievance_created', entity_type: 'grievance', entity_id: data.id, new_value: { subject, category } });
  res.status(201).json({ data, error: null });
});

router.patch('/grievances/:id', requireInstitutionAccess, requireRole('institution_admin', 'staff', 'faculty'), async (req: Request, res: Response) => {
  const updates: Record<string, unknown> = { ...req.body };
  if (updates.status === 'resolved') {
    updates.resolved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('grievances')
    .update(updates)
    .eq('id', param(req.params.id))
    .select()
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);

  await logAudit({ req: req as any, action: 'grievance_updated', entity_type: 'grievance', entity_id: param(req.params.id), new_value: req.body });
  res.json({ data, error: null });
});

router.post('/grievances/:id/replies', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { message } = req.body;
  const grievanceId = param(req.params.id);

  // Determine sender role
  const senderRole = req.user!.role === 'student' ? 'student' : 'admin';

  const { data, error } = await supabase
    .from('grievance_replies')
    .insert({
      grievance_id: grievanceId,
      sender_id: req.user!.sub,
      sender_role: senderRole,
      message,
      institution_id: req.user!.institution_id!,
    })
    .select('*, users(full_name)')
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.status(201).json({ data, error: null });
});

// ============================================
// JOB POSTINGS (Career Board)
// ============================================

router.get('/job-postings', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { job_type, is_active } = req.query;
  let query = supabase
    .from('job_postings')
    .select('*, users!job_postings_posted_by_fkey(full_name)')
    .eq('institution_id', req.user!.institution_id!)
    .order('created_at', { ascending: false });

  if (job_type) query = query.eq('job_type', qs(job_type)!);
  if (is_active !== undefined) query = query.eq('is_active', is_active === 'true');

  const { data, error } = await query;
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

router.post('/job-postings', requireInstitutionAccess, requireRole('institution_admin', 'staff'), async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('job_postings')
    .insert({ ...req.body, posted_by: req.user!.sub, institution_id: req.user!.institution_id! })
    .select()
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.status(201).json({ data, error: null });
});

router.patch('/job-postings/:id', requireInstitutionAccess, requireRole('institution_admin', 'staff'), async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('job_postings')
    .update(req.body)
    .eq('id', param(req.params.id))
    .select()
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

// ============================================
// NOTIFICATIONS
// ============================================

router.get('/notifications', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { is_read, category } = req.query;

  // Get student ID
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('clerk_user_id', req.user!.sub)
    .single();

  if (!student) {
    // Admin/staff see institution-wide notifications
    const { data, error } = await supabase
      .from('student_notifications')
      .select('*')
      .eq('institution_id', req.user!.institution_id!)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw new AppError(500, 'DB_ERROR', error.message);
    return res.json({ data, error: null });
  }

  let query = supabase
    .from('student_notifications')
    .select('*')
    .eq('student_id', student.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (is_read !== undefined) query = query.eq('is_read', is_read === 'true');
  if (category) query = query.eq('category', qs(category)!);

  const { data, error } = await query;
  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

router.post('/notifications', requireInstitutionAccess, requireRole('institution_admin', 'staff'), async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('student_notifications')
    .insert({ ...req.body, institution_id: req.user!.institution_id! })
    .select()
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.status(201).json({ data, error: null });
});

router.patch('/notifications/:id/read', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('student_notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', param(req.params.id))
    .select()
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

router.post('/notifications/read-all', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('clerk_user_id', req.user!.sub)
    .single();

  if (!student) throw new AppError(404, 'NOT_FOUND', 'Student record not found');

  const { error } = await supabase
    .from('student_notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('student_id', student.id)
    .eq('is_read', false);

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data: { message: 'All notifications marked as read' }, error: null });
});

// ============================================
// INSTITUTION SETTINGS
// ============================================

router.get('/institution-settings', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('institution_settings')
    .select('*')
    .eq('institution_id', req.user!.institution_id!)
    .single();

  // If no settings exist, create default
  if (error && error.code === 'PGRST116') {
    const { data: newSettings, error: createError } = await supabase
      .from('institution_settings')
      .insert({ institution_id: req.user!.institution_id! })
      .select()
      .single();
    if (createError) throw new AppError(500, 'DB_ERROR', createError.message);
    return res.json({ data: newSettings, error: null });
  }

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

router.patch('/institution-settings', requireInstitutionAccess, requireRole('institution_admin'), async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('institution_settings')
    .update(req.body)
    .eq('institution_id', req.user!.institution_id!)
    .select()
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data, error: null });
});

// ============================================
// STUDENT DASHBOARD STATS
// ============================================

router.get('/student/dashboard', requireInstitutionAccess, async (req: Request, res: Response) => {
  // Get student ID
  const { data: student } = await supabase
    .from('students')
    .select('id, program_id, enrollment_number')
    .eq('clerk_user_id', req.user!.sub)
    .single();

  if (!student) throw new AppError(404, 'NOT_FOUND', 'Student record not found');

  const [enrollments, grades, assessments, notifications, grievances] = await Promise.all([
    supabase
      .from('enrollments')
      .select('id, status, course_offerings(courses(course_name, course_code, credits))')
      .eq('student_id', student.id)
      .eq('status', 'enrolled'),
    supabase
      .from('student_grades')
      .select('id, grade_points, credits_earned, percentage')
      .eq('student_id', student.id)
      .eq('status', 'published'),
    (async () => {
      const { data: enrolledOfferings } = await supabase
        .from('enrollments')
        .select('course_offering_id')
        .eq('student_id', student.id);
      const offeringIds = (enrolledOfferings || []).map((e: any) => e.course_offering_id);
      if (offeringIds.length === 0) return { data: [], error: null };
      return supabase
        .from('assessments')
        .select('id, title, due_date, assessment_type')
        .eq('status', 'published')
        .in('course_offering_id', offeringIds)
        .gte('due_date', new Date().toISOString())
        .order('due_date')
        .limit(5);
    })(),
    supabase
      .from('student_notifications')
      .select('id')
      .eq('student_id', student.id)
      .eq('is_read', false),
    supabase
      .from('grievances')
      .select('id, status')
      .eq('student_id', student.id)
      .in('status', ['open', 'in_review', 'awaiting_info']),
  ]);

  // Calculate CGPA
  let totalCredits = 0;
  let totalGradePoints = 0;
  (grades.data || []).forEach(g => {
    const credits = g.credits_earned || 0;
    totalCredits += credits;
    totalGradePoints += (g.grade_points || 0) * credits;
  });
  const cgpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

  res.json({
    data: {
      student_id: student.id,
      enrollment_number: student.enrollment_number,
      enrolled_courses: enrollments.data?.length || 0,
      total_credits: totalCredits,
      cgpa: parseFloat(cgpa.toFixed(2)),
      unread_notifications: notifications.data?.length || 0,
      pending_assessments: assessments.data?.length || 0,
      open_grievances: grievances.data?.length || 0,
      current_courses: enrollments.data?.map((e: any) => ({
        name: e.course_offerings?.courses?.course_name,
        code: e.course_offerings?.courses?.course_code,
        credits: e.course_offerings?.courses?.credits,
      })) || [],
      upcoming_assessments: assessments.data || [],
    },
    error: null,
  });
});

export default router;
