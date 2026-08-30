import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { logAudit } from '../lib/audit';
import { authMiddleware } from '../middleware/auth';
import { requireRole, requireInstitutionAccess } from '../middleware/rbac';
import { AppError } from '../middleware/errorHandler';
import { qs, param } from '../lib/query';
import { sendEmail, offerLetterEmail, gradePublishedEmail, feeReminderEmail, grievanceReplyEmail } from '../lib/email';

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

  // Send email notification
  try {
    const { data: studentInfo } = await supabase
      .from('students')
      .select('users!students_user_id_fkey(full_name, email)')
      .eq('id', student_id)
      .single();
    const { data: offeringInfo } = await supabase
      .from('course_offerings')
      .select('courses!course_offerings_course_id_fkey(course_name)')
      .eq('id', course_offering_id)
      .single();
    const sInfo = studentInfo as Record<string, unknown> as { users?: { full_name: string; email: string } };
    const oInfo = offeringInfo as Record<string, unknown> as { courses?: { course_name: string } };
    if (sInfo?.users?.email && oInfo?.courses?.course_name) {
      const emailData = gradePublishedEmail(
        sInfo.users.full_name,
        oInfo.courses.course_name,
        letter_grade || '-',
        grade_points || 0
      );
      await sendEmail({ to: sInfo.users.email, ...emailData });
    }
  } catch (e) { console.error('[Email] Grade notification failed:', e); }

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

  // Send email notification to student if admin replied
  if (senderRole === 'admin') {
    try {
      const { data: grievance } = await supabase
        .from('grievances')
        .select('subject, students!grievances_student_id_fkey(id)')
        .eq('id', grievanceId)
        .single();
      const g = grievance as Record<string, unknown> as { subject: string; students?: { id: string } };
      if (g?.students?.id) {
        const { data: studentUser } = await supabase
          .from('students')
          .select('users!students_user_id_fkey(full_name, email)')
          .eq('id', g.students.id)
          .single();
        const sUser = studentUser as Record<string, unknown> as { users?: { full_name: string; email: string } };
        if (sUser?.users?.email) {
          const emailData = grievanceReplyEmail(sUser.users.full_name, g.subject, message);
          await sendEmail({ to: sUser.users.email, ...emailData });
        }
      }
    } catch (e) { console.error('[Email] Grievance reply notification failed:', e); }
  }

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

// ============================================
// STUDENT PROFILE
// ============================================

router.get('/profile', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { data: student, error } = await supabase
    .from('students')
    .select('*, programs(name, code), departments(name), users!students_user_id_fkey(full_name, email, clerk_user_id)')
    .eq('clerk_user_id', req.user!.sub)
    .single();

  if (error || !student) throw new AppError(404, 'NOT_FOUND', 'Student profile not found');
  if (req.user!.role !== 'super_admin' && student.institution_id !== req.user!.institution_id) {
    throw new AppError(403, 'FORBIDDEN', 'Access denied');
  }

  res.json({ data: student, error: null });
});

// ============================================
// STUDENT FEES
// ============================================

router.get('/fees', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('clerk_user_id', req.user!.sub)
    .single();

  if (!student) throw new AppError(404, 'NOT_FOUND', 'Student record not found');

  const { data, error } = await supabase
    .from('fee_invoices')
    .select('*')
    .eq('student_id', student.id)
    .eq('institution_id', req.user!.institution_id!)
    .order('due_date', { ascending: false });

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data: data || [], error: null });
});

router.get('/payments', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('clerk_user_id', req.user!.sub)
    .single();

  if (!student) throw new AppError(404, 'NOT_FOUND', 'Student record not found');

  const { data, error } = await supabase
    .from('fee_payments')
    .select('*')
    .eq('student_id', student.id)
    .eq('institution_id', req.user!.institution_id!)
    .order('payment_date', { ascending: false });

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data: data || [], error: null });
});

router.post('/payments', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('clerk_user_id', req.user!.sub)
    .single();

  if (!student) throw new AppError(404, 'NOT_FOUND', 'Student record not found');

  const { data, error } = await supabase
    .from('fee_payments')
    .insert({
      ...req.body,
      student_id: student.id,
      institution_id: req.user!.institution_id!,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.status(201).json({ data, error: null });
});

// ============================================
// STUDENT ATTENDANCE
// ============================================

router.get('/attendance', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('clerk_user_id', req.user!.sub)
    .single();

  if (!student) throw new AppError(404, 'NOT_FOUND', 'Student record not found');

  const { data, error } = await supabase
    .from('attendance_records')
    .select('*, course_offerings(courses(course_name, course_code))')
    .eq('student_id', student.id)
    .eq('institution_id', req.user!.institution_id!)
    .order('date', { ascending: false });

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data: data || [], error: null });
});

// ============================================
// STUDENT DOCUMENT REQUESTS
// ============================================

router.get('/document-requests', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('clerk_user_id', req.user!.sub)
    .single();

  if (!student) throw new AppError(404, 'NOT_FOUND', 'Student record not found');

  const { data, error } = await supabase
    .from('document_requests')
    .select('*')
    .eq('student_id', student.id)
    .eq('institution_id', req.user!.institution_id!)
    .order('created_at', { ascending: false });

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data: data || [], error: null });
});

router.post('/document-requests', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('clerk_user_id', req.user!.sub)
    .single();

  if (!student) throw new AppError(404, 'NOT_FOUND', 'Student record not found');

  const { data, error } = await supabase
    .from('document_requests')
    .insert({
      student_id: student.id,
      institution_id: req.user!.institution_id!,
      document_type: req.body.type,
      purpose: req.body.purpose,
      status: 'requested',
    })
    .select()
    .single();

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.status(201).json({ data, error: null });
});

// ============================================
// STUDENT CALENDAR
// ============================================

router.get('/calendar', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { data: student } = await supabase
    .from('students')
    .select('id, program_id')
    .eq('clerk_user_id', req.user!.sub)
    .single();

  if (!student) throw new AppError(404, 'NOT_FOUND', 'Student record not found');

  // Fetch semesters, exams, deadlines, notices as calendar events
  const [semesters, exams, notices] = await Promise.all([
    supabase
      .from('semesters')
      .select('id, term_label, start_date, end_date, registration_start, registration_end')
      .eq('program_id', student.program_id)
      .order('start_date'),
    supabase
      .from('entrance_exams')
      .select('id, name, exam_date, online_config')
      .eq('institution_id', req.user!.institution_id!)
      .order('exam_date'),
    supabase
      .from('notices')
      .select('id, title, notice_date, notice_type')
      .eq('institution_id', req.user!.institution_id!)
      .order('notice_date', { ascending: false })
      .limit(20),
  ]);

  const events: Array<{ id: string; title: string; date: string; type: string; description?: string }> = [];

  (semesters.data || []).forEach(s => {
    events.push({ id: `sem-start-${s.id}`, title: `${s.term_label} Begins`, date: s.start_date, type: 'event' });
    events.push({ id: `sem-end-${s.id}`, title: `${s.term_label} Ends`, date: s.end_date, type: 'event' });
    if (s.registration_start) events.push({ id: `reg-${s.id}`, title: `${s.term_label} Registration Opens`, date: s.registration_start, type: 'registration' });
    if (s.registration_end) events.push({ id: `reg-end-${s.id}`, title: `${s.term_label} Registration Closes`, date: s.registration_end, type: 'deadline' });
  });

  (exams.data || []).forEach(e => {
    events.push({ id: `exam-${e.id}`, title: e.name, date: e.exam_date, type: 'exam' });
  });

  (notices.data || []).forEach(n => {
    events.push({ id: `notice-${n.id}`, title: n.title, date: n.notice_date, type: 'event', description: n.notice_type });
  });

  events.sort((a, b) => a.date.localeCompare(b.date));
  res.json({ data: events, error: null });
});

// ============================================
// STUDENT EXAMS (Regular exams for enrolled courses)
// ============================================

router.get('/exams', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('clerk_user_id', req.user!.sub)
    .single();

  if (!student) throw new AppError(404, 'NOT_FOUND', 'Student record not found');

  // Get enrolled course offerings
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('course_offering_id')
    .eq('student_id', student.id)
    .eq('status', 'enrolled');

  const offeringIds = (enrollments || []).map((e: any) => e.course_offering_id);
  if (offeringIds.length === 0) return res.json({ data: [], error: null });

  const { data, error } = await supabase
    .from('regular_exams')
    .select('*, course_offerings!inner(id, courses(course_name, course_code), semesters(term_label))')
    .in('course_offering_id', offeringIds)
    .eq('institution_id', req.user!.institution_id!)
    .order('exam_date', { ascending: false });

  if (error) throw new AppError(500, 'DB_ERROR', error.message);
  res.json({ data: data || [], error: null });
});

// ============================================
// STUDENT REGISTRATION
// ============================================

router.get('/registration', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { data: student } = await supabase
    .from('students')
    .select('id, program_id')
    .eq('clerk_user_id', req.user!.sub)
    .single();

  if (!student) throw new AppError(404, 'NOT_FOUND', 'Student record not found');

  // Get current/upcoming semester with registration window
  const { data: semester } = await supabase
    .from('semesters')
    .select('*')
    .eq('program_id', student.program_id)
    .in('status', ['upcoming', 'registration_open'])
    .order('start_date')
    .limit(1)
    .single();

  // Get available course offerings for that semester
  let courses: any[] = [];
  if (semester) {
    const { data: offerings } = await supabase
      .from('course_offerings')
      .select('*, courses(*), users!course_offerings_instructor_id_fkey(full_name)')
      .eq('semester_id', semester.id)
      .eq('institution_id', req.user!.institution_id!)
      .eq('is_active', true);
    courses = offerings || [];
  }

  res.json({
    data: {
      window: semester ? {
        id: semester.id,
        semester: semester.term_label,
        start_date: semester.registration_start,
        end_date: semester.registration_end,
        status: semester.status === 'registration_open' ? 'open' : 'upcoming',
        min_credits: 14,
        max_credits: 22,
        flexible_mode: false,
      } : null,
      courses: courses.map((c: any) => ({
        id: c.id,
        course_code: c.courses?.course_code,
        course_name: c.courses?.course_name,
        instructor: c.users?.full_name,
        credits: c.courses?.credits,
        capacity: c.capacity,
        enrolled: c.enrolled_count || 0,
        prerequisites: [],
        department: '',
        type: c.courses?.course_type || 'core',
        is_selected: false,
      })),
    },
    error: null,
  });
});

router.post('/registration/enroll', requireInstitutionAccess, async (req: Request, res: Response) => {
  const { course_offering_id } = req.body;
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('clerk_user_id', req.user!.sub)
    .single();

  if (!student) throw new AppError(404, 'NOT_FOUND', 'Student record not found');

  // Check capacity
  const { data: offering } = await supabase
    .from('course_offerings')
    .select('capacity, enrolled_count')
    .eq('id', course_offering_id)
    .single();

  if (offering && offering.enrolled_count >= offering.capacity) {
    throw new AppError(400, 'FULL', 'Course is full');
  }

  const { data, error } = await supabase
    .from('enrollments')
    .insert({
      student_id: student.id,
      course_offering_id,
      institution_id: req.user!.institution_id!,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new AppError(409, 'ALREADY_ENROLLED', 'Already enrolled');
    throw new AppError(500, 'DB_ERROR', error.message);
  }

  await supabase
    .from('course_offerings')
    .update({ enrolled_count: (offering?.enrolled_count || 0) + 1 })
    .eq('id', course_offering_id);

  res.status(201).json({ data, error: null });
});

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
