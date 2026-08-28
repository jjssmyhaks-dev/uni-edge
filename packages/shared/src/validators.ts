import { z } from 'zod';

// ============================================
// Institution Schemas
// ============================================

export const createInstitutionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  type: z.enum(['government', 'private', 'deemed', 'autonomous']),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  email: z.string().email('Invalid email address'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  logo_url: z.string().url().optional().or(z.literal('')),
});

export const updateInstitutionSchema = createInstitutionSchema.partial();

// ============================================
// Department Schemas
// ============================================

export const createDepartmentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  code: z.string().min(2, 'Code is required').max(10),
  head_name: z.string().optional(),
  description: z.string().optional(),
});

// ============================================
// Program Schemas
// ============================================

export const createProgramSchema = z.object({
  name: z.string().min(2, 'Program name is required'),
  code: z.string().min(2, 'Code is required').max(10),
  department_id: z.string().uuid('Invalid department'),
  degree_level: z.enum(['certificate', 'diploma', 'bachelor', 'master', 'phd']),
  duration_years: z.number().min(1).max(8),
  total_seats: z.number().min(1).max(10000),
  description: z.string().optional(),
});

// ============================================
// Admission Cycle Schemas
// ============================================

export const createAdmissionCycleSchema = z.object({
  program_id: z.string().uuid('Invalid program'),
  academic_year: z.string().regex(/^\d{4}-\d{4}$/, 'Format: YYYY-YYYY'),
  start_date: z.string(),
  end_date: z.string(),
  status: z.enum(['draft', 'active', 'closed', 'archived']).default('draft'),
});

// ============================================
// Entrance Exam Schemas
// ============================================

export const createEntranceExamSchema = z.object({
  name: z.string().min(3, 'Exam name is required'),
  program_id: z.string().uuid().optional(),
  exam_date: z.string(),
  start_time: z.string(),
  duration_minutes: z.number().min(30).max(360),
  mode: z.enum(['online', 'offline', 'hybrid']),
  total_marks: z.number().min(1),
  passing_marks: z.number().min(0),
  description: z.string().optional(),
});

// ============================================
// Application Schemas
// ============================================

export const createApplicationSchema = z.object({
  cycle_id: z.string().uuid('Invalid admission cycle'),
  applicant_name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  date_of_birth: z.string(),
  gender: z.enum(['male', 'female', 'other']),
  category: z.enum(['general', 'obc', 'sc', 'st', 'ews']),
  program_id: z.string().uuid('Invalid program'),
  previous_school: z.string().optional(),
  previous_percentage: z.number().min(0).max(100).optional(),
  address: z.string().optional(),
  father_name: z.string().optional(),
  mother_name: z.string().optional(),
});

// ============================================
// Student Schemas
// ============================================

export const createStudentSchema = z.object({
  enrollment_number: z.string().min(3, 'Enrollment number is required'),
  program_id: z.string().uuid('Invalid program'),
  clerk_user_id: z.string().optional(),
  batch_year: z.number().min(2020).max(2030),
  admission_date: z.string(),
  status: z.enum(['active', 'inactive', 'graduated', 'withdrawn', 'suspended']).default('active'),
});

// ============================================
// Exam Schemas
// ============================================

export const createRegularExamSchema = z.object({
  name: z.string().min(3, 'Exam name is required'),
  program_id: z.string().uuid('Invalid program'),
  term: z.string().min(1, 'Term is required'),
  academic_year: z.string(),
  exam_date: z.string(),
  start_time: z.string(),
  duration_minutes: z.number().min(30).max(360),
  total_marks: z.number().min(1),
  passing_marks: z.number().min(0),
  exam_type: z.enum(['midterm', 'final', 'internal', 'practical', 'viva']),
  description: z.string().optional(),
});

export const enterResultSchema = z.object({
  student_id: z.string().uuid('Invalid student'),
  marks_obtained: z.number().min(0),
  grade: z.string().optional(),
  grade_points: z.number().min(0).max(10).optional(),
  remarks: z.string().optional(),
});

export const bulkResultUploadSchema = z.object({
  results: z.array(z.object({
    enrollment_number: z.string(),
    marks_obtained: z.number().min(0),
    grade: z.string().optional(),
    grade_points: z.number().optional(),
  })).min(1, 'At least one result required'),
});

// ============================================
// Fee Schemas
// ============================================

export const createFeeCategorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  description: z.string().optional(),
});

export const createFeeStructureSchema = z.object({
  fee_category_id: z.string().uuid('Invalid fee category'),
  program_id: z.string().uuid().optional(),
  admission_cycle_id: z.string().uuid().optional(),
  amount: z.number().min(0, 'Amount must be positive'),
  description: z.string().optional(),
  academic_year: z.string().optional(),
});

export const createInvoiceSchema = z.object({
  student_id: z.string().uuid('Invalid student'),
  fee_structure_id: z.string().uuid('Invalid fee structure'),
  amount: z.number().min(0),
  due_date: z.string().optional(),
  notes: z.string().optional(),
});

export const verifyPaymentSchema = z.object({
  status: z.enum(['verified', 'rejected']),
  remarks: z.string().optional(),
});

// ============================================
// Attendance Schemas
// ============================================

export const createAttendanceSchema = z.object({
  student_id: z.string().uuid('Invalid student'),
  program_id: z.string().uuid('Invalid program'),
  course_code: z.string().min(1),
  date: z.string(),
  status: z.enum(['present', 'absent', 'late', 'excused']),
  remarks: z.string().optional(),
});

export const bulkAttendanceSchema = z.object({
  records: z.array(z.object({
    student_id: z.string().uuid(),
    program_id: z.string().uuid(),
    course_code: z.string(),
    date: z.string(),
    status: z.enum(['present', 'absent', 'late', 'excused']),
    remarks: z.string().optional(),
  })).min(1, 'At least one record required'),
});

// ============================================
// Grievance Schemas
// ============================================

export const createGrievanceSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.enum(['academic', 'administrative', 'fee', 'examination', 'other']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
});

export const updateGrievanceSchema = z.object({
  status: z.enum(['open', 'in_review', 'awaiting_info', 'resolved', 'closed', 'reopened']).optional(),
  assigned_to: z.string().uuid().optional(),
  resolution_notes: z.string().optional(),
});

// ============================================
// Notice Schemas
// ============================================

export const createNoticeSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  content: z.string().min(10, 'Content is required'),
  target_audience: z.enum(['all', 'students', 'faculty', 'staff', 'department']),
  department_id: z.string().uuid().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  publish_date: z.string().optional(),
  expiry_date: z.string().optional(),
});

// ============================================
// Job Posting Schemas
// ============================================

export const createJobPostingSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(20, 'Description is required'),
  company_name: z.string().optional(),
  job_type: z.enum(['full_time', 'part_time', 'internship', 'contract', 'apprenticeship']),
  location: z.string().optional(),
  is_remote: z.boolean().default(false),
  salary_range: z.string().optional(),
  required_skills: z.array(z.string()).optional(),
  application_link: z.string().url().optional().or(z.literal('')),
  application_email: z.string().email().optional().or(z.literal('')),
  eligibility: z.string().optional(),
  deadline: z.string().optional(),
});

// ============================================
// Semester Schemas
// ============================================

export const createSemesterSchema = z.object({
  program_id: z.string().uuid('Invalid program'),
  term_label: z.string().min(1, 'Term label is required'),
  academic_year: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  registration_open: z.string().optional(),
  registration_close: z.string().optional(),
  status: z.enum(['upcoming', 'active', 'completed', 'archived']).default('upcoming'),
});

// ============================================
// Course Schemas
// ============================================

export const createCourseSchema = z.object({
  course_code: z.string().min(2).max(10),
  course_name: z.string().min(3, 'Course name is required'),
  department_id: z.string().uuid().optional(),
  credits: z.number().min(0.5).max(10),
  course_type: z.enum(['core', 'elective', 'lab', 'project', 'audit']).default('core'),
  description: z.string().optional(),
  semester_number: z.number().min(1).max(12).optional(),
});

// ============================================
// Assessment Schemas
// ============================================

export const createAssessmentSchema = z.object({
  course_offering_id: z.string().uuid('Invalid offering'),
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  assessment_type: z.enum(['assignment', 'quiz', 'midterm', 'final', 'project', 'lab', 'presentation', 'participation']),
  max_marks: z.number().min(1),
  weight_percentage: z.number().min(0).max(100).optional(),
  due_date: z.string().optional(),
  allow_late_submission: z.boolean().default(false),
  late_penalty_per_day: z.number().min(0).max(100).optional(),
  allow_resubmission: z.boolean().default(false),
  status: z.enum(['draft', 'published']).default('draft'),
});

// ============================================
// Submission Schemas
// ============================================

export const createSubmissionSchema = z.object({
  assessment_id: z.string().uuid('Invalid assessment'),
  file_url: z.string().url().optional(),
  file_name: z.string().optional(),
  file_size: z.number().optional(),
  content: z.string().optional(),
});

// ============================================
// Grade Schemas
// ============================================

export const createGradeSchema = z.object({
  student_id: z.string().uuid('Invalid student'),
  course_offering_id: z.string().uuid('Invalid offering'),
  semester_id: z.string().uuid('Invalid semester'),
  marks_obtained: z.number().min(0),
  total_marks: z.number().min(1),
  letter_grade: z.string().optional(),
  grade_points: z.number().min(0).max(10).optional(),
  credits_earned: z.number().min(0),
});

// ============================================
// Auth Schemas
// ============================================

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name is required'),
});

// ============================================
// Onboarding Schemas
// ============================================

export const onboardingStep1Schema = z.object({
  institution_name: z.string().min(2, 'Institution name is required'),
  institution_type: z.enum(['government', 'private', 'deemed', 'autonomous']),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  email: z.string().email('Invalid email'),
});

export const onboardingStep2Schema = z.object({
  departments: z.array(z.object({
    name: z.string().min(2),
    code: z.string().min(2).max(10),
  })).min(1, 'At least one department is required'),
});

export const onboardingStep3Schema = z.object({
  programs: z.array(z.object({
    name: z.string().min(2),
    code: z.string().min(2).max(10),
    department_index: z.number().min(0),
    degree_level: z.enum(['certificate', 'diploma', 'bachelor', 'master', 'phd']),
    duration_years: z.number().min(1).max(8),
    total_seats: z.number().min(1).max(10000),
  })).min(1, 'At least one program is required'),
});
