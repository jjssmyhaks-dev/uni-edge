import { z } from 'zod';

// ============================================================
// Institution
// ============================================================
export const institutionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  type: z.enum(['government', 'private', 'deemed'], { required_error: 'Select institution type' }),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid 6-digit pincode'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid 10-digit phone number'),
  email: z.string().email('Invalid email address'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export type InstitutionInput = z.infer<typeof institutionSchema>;

// ============================================================
// Department
// ============================================================
export const departmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  code: z.string().min(2, 'Code is required').max(10),
  head_name: z.string().optional(),
  head_email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone').optional().or(z.literal('')),
});

export type DepartmentInput = z.infer<typeof departmentSchema>;

// ============================================================
// Program
// ============================================================
export const programSchema = z.object({
  name: z.string().min(2, 'Name is required').max(200),
  code: z.string().min(2, 'Code is required').max(20),
  department_id: z.string().uuid('Select a department'),
  degree_level: z.enum(['certificate', 'diploma', 'bachelors', 'masters', 'doctoral'], {
    required_error: 'Select degree level',
  }),
  duration_years: z.number().min(1, 'Duration must be at least 1 year').max(8),
  total_seats: z.number().min(1, 'Seats must be at least 1').max(1000),
  description: z.string().optional(),
  eligibility: z.string().optional(),
});

export type ProgramInput = z.infer<typeof programSchema>;

// ============================================================
// Entrance Exam
// ============================================================
export const entranceExamSchema = z.object({
  name: z.string().min(3, 'Exam name is required').max(200),
  cycle_id: z.string().uuid('Select an admission cycle'),
  description: z.string().optional(),
  exam_date: z.string().min(1, 'Exam date is required'),
  exam_time: z.string().optional(),
  duration_minutes: z.number().min(30, 'Minimum 30 minutes').max(360),
  mode: z.enum(['online', 'offline', 'hybrid'], { required_error: 'Select exam mode' }),
  total_marks: z.number().min(1, 'Total marks required').max(1000),
  passing_marks: z.number().min(1, 'Passing marks required').max(1000),
}).refine(data => data.passing_marks <= data.total_marks, {
  message: 'Passing marks cannot exceed total marks',
  path: ['passing_marks'],
});

export type EntranceExamInput = z.infer<typeof entranceExamSchema>;

// ============================================================
// Regular Exam
// ============================================================
export const regularExamSchema = z.object({
  name: z.string().min(3, 'Exam name is required').max(200),
  program_id: z.string().uuid('Select a program'),
  course_code: z.string().min(2, 'Course code is required').max(20),
  term: z.string().min(1, 'Term is required'),
  academic_year: z.string().regex(/^\d{4}-\d{4}$/, 'Format: YYYY-YYYY'),
  exam_date: z.string().min(1, 'Exam date is required'),
  exam_time: z.string().optional(),
  duration_minutes: z.number().min(30).max(360),
  total_marks: z.number().min(1).max(1000),
  passing_marks: z.number().min(1).max(1000),
}).refine(data => data.passing_marks <= data.total_marks, {
  message: 'Passing marks cannot exceed total marks',
  path: ['passing_marks'],
});

export type RegularExamInput = z.infer<typeof regularExamSchema>;

// ============================================================
// Application (Public Form)
// ============================================================
export const applicationSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Select gender' }),
  address: z.string().min(5, 'Address is required').max(500),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid 6-digit pincode'),
  category: z.enum(['general', 'obc', 'sc', 'st', 'ews']),
  aadhaarNumber: z.string().regex(/^\d{4}\s?\d{4}\s?\d{4}$/, 'Invalid Aadhaar number').optional().or(z.literal('')),
  programId: z.string().min(1, 'Select a program'),
  agreeToTerms: z.literal(true, { errorMap: () => ({ message: 'You must agree to the terms' }) }),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

// ============================================================
// Student
// ============================================================
export const studentSchema = z.object({
  enrollment_number: z.string().min(1, 'Enrollment number is required').max(50),
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone').optional().or(z.literal('')),
  program_id: z.string().uuid('Select a program'),
  department_id: z.string().uuid('Select a department'),
  admission_date: z.string().min(1, 'Admission date is required'),
  batch: z.string().regex(/^\d{4}-\d{4}$/, 'Format: YYYY-YYYY'),
  status: z.enum(['active', 'inactive', 'graduated', 'expelled']),
});

export type StudentInput = z.infer<typeof studentSchema>;

// ============================================================
// Attendance
// ============================================================
export const attendanceRecordSchema = z.object({
  student_id: z.string().uuid('Select a student'),
  program_id: z.string().uuid('Select a program'),
  course_code: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  status: z.enum(['present', 'absent', 'late'], { required_error: 'Select status' }),
  remarks: z.string().max(500).optional(),
});

export type AttendanceRecordInput = z.infer<typeof attendanceRecordSchema>;

export const bulkAttendanceSchema = z.object({
  records: z.array(attendanceRecordSchema).min(1, 'At least one record required'),
});

export type BulkAttendanceInput = z.infer<typeof bulkAttendanceSchema>;

// ============================================================
// Notice
// ============================================================
export const noticeSchema = z.object({
  title: z.string().min(3, 'Title is required').max(200),
  content: z.string().min(10, 'Content must be at least 10 characters').max(5000),
  target_audience: z.enum(['all', 'students', 'faculty', 'staff', 'applicants'], {
    required_error: 'Select target audience',
  }),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  category: z.string().optional(),
  publish_immediately: z.boolean().optional(),
});

export type NoticeInput = z.infer<typeof noticeSchema>;

// ============================================================
// Document Request
// ============================================================
export const documentRequestSchema = z.object({
  student_id: z.string().uuid('Select a student'),
  request_type: z.enum([
    'transcript',
    'bonafide',
    'migration',
    'character',
    'degree',
    'marksheet',
    'provisional',
    'recommendation',
    'other',
  ], { required_error: 'Select document type' }),
  custom_type: z.string().max(200).optional(),
  remarks: z.string().max(500).optional(),
});

export type DocumentRequestInput = z.infer<typeof documentRequestSchema>;

// ============================================================
// Score Upload
// ============================================================
export const scoreEntrySchema = z.object({
  enrollment_number: z.string().min(1, 'Enrollment number is required'),
  marks_obtained: z.number().min(0, 'Marks cannot be negative'),
  max_marks: z.number().min(1, 'Max marks required'),
}).refine(data => data.marks_obtained <= data.max_marks, {
  message: 'Marks obtained cannot exceed max marks',
  path: ['marks_obtained'],
});

export const bulkScoreUploadSchema = z.object({
  exam_id: z.string().uuid(),
  results: z.array(scoreEntrySchema).min(1, 'At least one result required'),
});

export type ScoreEntryInput = z.infer<typeof scoreEntrySchema>;
export type BulkScoreUploadInput = z.infer<typeof bulkScoreUploadSchema>;

// ============================================================
// Clerk Webhook User Sync
// ============================================================
export const clerkWebhookSchema = z.object({
  type: z.enum(['user.created', 'user.updated', 'user.deleted']),
  data: z.object({
    id: z.string(),
    email_addresses: z.array(z.object({
      email_address: z.string().email(),
    })).optional(),
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    phone_numbers: z.array(z.object({
      phone_number: z.string(),
    })).optional(),
  }),
});

export type ClerkWebhookInput = z.infer<typeof clerkWebhookSchema>;

// ============================================================
// Merit List Formula
// ============================================================
export const meritFormulaSchema = z.object({
  entrance_weight: z.number().min(0).max(100),
  prior_record_weight: z.number().min(0).max(100),
}).refine(data => data.entrance_weight + data.prior_record_weight === 100, {
  message: 'Weights must sum to 100%',
});

export type MeritFormulaInput = z.infer<typeof meritFormulaSchema>;
