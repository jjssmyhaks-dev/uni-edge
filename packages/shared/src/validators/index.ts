import { z } from 'zod';
import {
  INSTITUTION_TYPES,
  DEGREE_LEVELS,
  CYCLE_STATUS,
  APPLICATION_STATUS,
  EXAM_STATUS,
  EXAM_MODE,
  CATEGORIES,
  ROLES,
  DOCUMENT_TYPES,
  ATTENDANCE_STATUS,
  DOCUMENT_REQUEST_STATUS,
  DOCUMENT_REQUEST_TYPES,
  NOTICE_AUDIENCE,
  NOTICE_STATUS,
  REGULAR_EXAM_STATUS,
  EXAM_TERM,
  GRADE_LETTERS,
  PROCTORING_STATUS,
  FLAG_TYPE,
  FLAG_REVIEW_STATUS,
  PROCTORING_REPORT_STATUS,
} from '../constants';

// ============================================
// Common Schemas
// ============================================

export const uuidSchema = z.string().uuid();
export const emailSchema = z.string().email();
export const phoneSchema = z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number');
export const nonEmptyString = z.string().min(1, 'Required');

// ============================================
// Institution
// ============================================

export const createInstitutionSchema = z.object({
  name: nonEmptyString,
  short_name: z.string().optional(),
  type: z.enum([
    INSTITUTION_TYPES.GOVERNMENT,
    INSTITUTION_TYPES.PRIVATE,
    INSTITUTION_TYPES.DEEMED,
  ]),
  address: z.string().optional(),
});

export const updateInstitutionSchema = createInstitutionSchema.partial();

// ============================================
// Department
// ============================================

export const createDepartmentSchema = z.object({
  institution_id: uuidSchema,
  name: nonEmptyString,
  code: z.string().max(10).optional(),
});

export const updateDepartmentSchema = createDepartmentSchema.omit({ institution_id: true }).partial();

// ============================================
// User
// ============================================

export const createUserSchema = z.object({
  clerk_user_id: nonEmptyString,
  institution_id: uuidSchema.optional(),
  role: z.enum(Object.values(ROLES) as [string, ...string[]]),
  department_id: uuidSchema.optional(),
  email: emailSchema,
  full_name: z.string().optional(),
  phone: phoneSchema.optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(Object.values(ROLES) as [string, ...string[]]),
  department_id: uuidSchema.optional(),
});

// ============================================
// Program
// ============================================

export const createProgramSchema = z.object({
  institution_id: uuidSchema,
  department_id: uuidSchema.optional(),
  name: nonEmptyString,
  code: z.string().max(20).optional(),
  degree_level: z.enum([
    DEGREE_LEVELS.UNDERGRADUATE,
    DEGREE_LEVELS.POSTGRADUATE,
    DEGREE_LEVELS.DIPLOMA,
    DEGREE_LEVELS.PHD,
  ]),
  duration_years: z.number().positive().max(10).optional(),
  total_seats: z.number().int().positive().max(10000).optional(),
});

export const updateProgramSchema = createProgramSchema.omit({ institution_id: true }).partial();

// ============================================
// Admission Cycle
// ============================================

export const createAdmissionCycleSchema = z.object({
  institution_id: uuidSchema,
  program_id: uuidSchema,
  academic_year: z.string().regex(/^\d{4}-\d{2}$/, 'Format: YYYY-YY'),
  application_start_date: z.string().optional(),
  application_end_date: z.string().optional(),
}).refine(
  (data) => {
    if (data.application_start_date && data.application_end_date) {
      return new Date(data.application_start_date) < new Date(data.application_end_date);
    }
    return true;
  },
  { message: 'Start date must be before end date' }
);

// ============================================
// Entrance Exam
// ============================================

const createEntranceExamBaseSchema = z.object({
  institution_id: uuidSchema,
  cycle_id: uuidSchema,
  name: nonEmptyString,
  description: z.string().optional(),
  exam_date: z.string().optional(),
  exam_time: z.string().optional(),
  duration_minutes: z.number().int().positive().max(480).optional(),
  mode: z.enum([EXAM_MODE.ONLINE, EXAM_MODE.OFFLINE, EXAM_MODE.HYBRID]).optional(),
  total_marks: z.number().int().positive().optional(),
  passing_marks: z.number().int().positive().optional(),
});

export const createEntranceExamSchema = createEntranceExamBaseSchema.refine(
  (data) => {
    if (data.total_marks && data.passing_marks) {
      return data.passing_marks <= data.total_marks;
    }
    return true;
  },
  { message: 'Passing marks cannot exceed total marks' }
);

export const updateEntranceExamSchema = createEntranceExamBaseSchema
  .omit({ institution_id: true, cycle_id: true })
  .partial();

// ============================================
// Application (Public Form)
// ============================================

export const submitApplicationSchema = z.object({
  cycle_id: uuidSchema,
  applicant_name: nonEmptyString,
  applicant_email: emailSchema,
  applicant_phone: phoneSchema.optional(),
  form_data: z.record(z.unknown()).default({}),
});

// ============================================
// Document
// ============================================

export const uploadDocumentSchema = z.object({
  application_id: uuidSchema.optional(),
  student_id: uuidSchema.optional(),
  document_type: z.enum(
    Object.values(DOCUMENT_TYPES) as [string, ...string[]]
  ),
}).refine(
  (data) => data.application_id || data.student_id,
  { message: 'Either application_id or student_id is required' }
);

// ============================================
// Bulk Upload
// ============================================

export const bulkScoreUploadRowSchema = z.object({
  registration_number: nonEmptyString,
  score: z.coerce.number().min(0),
  category: z.enum(Object.values(CATEGORIES) as [string, ...string[]]).optional(),
});

// ============================================
// Pagination
// ============================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('asc'),
  search: z.string().optional(),
});

// ============================================
// Module 4: Academic/Office Admin
// ============================================

// Attendance
export const createAttendanceSchema = z.object({
  student_id: uuidSchema,
  program_id: uuidSchema,
  course_code: z.string().max(20).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format: YYYY-MM-DD'),
  status: z.enum([
    ATTENDANCE_STATUS.PRESENT,
    ATTENDANCE_STATUS.ABSENT,
    ATTENDANCE_STATUS.LATE,
    ATTENDANCE_STATUS.EXCUSED,
  ]),
  remarks: z.string().max(500).optional(),
});

export const bulkAttendanceSchema = z.object({
  records: z.array(createAttendanceSchema).min(1, 'At least one record required').max(200, 'Maximum 200 records per batch'),
});

export const attendanceQuerySchema = z.object({
  program_id: uuidSchema.optional(),
  course_code: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  student_id: uuidSchema.optional(),
});

// Document Requests
export const createDocumentRequestSchema = z.object({
  student_id: uuidSchema,
  request_type: z.enum(
    Object.values(DOCUMENT_REQUEST_TYPES) as [string, ...string[]]
  ),
  custom_type: z.string().max(100).optional(),
  remarks: z.string().max(500).optional(),
});

export const updateDocumentRequestSchema = z.object({
  status: z.enum([
    DOCUMENT_REQUEST_STATUS.REQUESTED,
    DOCUMENT_REQUEST_STATUS.PROCESSING,
    DOCUMENT_REQUEST_STATUS.READY,
    DOCUMENT_REQUEST_STATUS.ISSUED,
    DOCUMENT_REQUEST_STATUS.REJECTED,
  ]),
  remarks: z.string().max(500).optional(),
});

// Notices
export const createNoticeSchema = z.object({
  title: nonEmptyString.max(200),
  content: nonEmptyString,
  target_audience: z.enum(
    Object.values(NOTICE_AUDIENCE) as [string, ...string[]]
  ),
  target_department_id: uuidSchema.optional(),
  target_batch: z.string().optional(),
  publish_immediately: z.boolean().default(false),
});

export const updateNoticeSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().optional(),
  target_audience: z.enum(
    Object.values(NOTICE_AUDIENCE) as [string, ...string[]]
  ).optional(),
  target_department_id: uuidSchema.optional(),
  status: z.enum([
    NOTICE_STATUS.DRAFT,
    NOTICE_STATUS.PUBLISHED,
    NOTICE_STATUS.ARCHIVED,
  ]).optional(),
});

// ============================================
// Module 5: Regular Exam Process
// ============================================

const createRegularExamBaseSchema = z.object({
  program_id: uuidSchema,
  name: nonEmptyString.max(200),
  course_code: z.string().max(20).optional(),
  term: z.enum(
    Object.values(EXAM_TERM) as [string, ...string[]]
  ),
  academic_year: z.string().regex(/^\d{4}-\d{2}$/, 'Format: YYYY-YY'),
  exam_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  exam_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  duration_minutes: z.number().int().positive().max(480).optional(),
  total_marks: z.number().int().positive().optional(),
  passing_marks: z.number().int().positive().optional(),
});

export const createRegularExamSchema = createRegularExamBaseSchema.refine(
  (data) => {
    if (data.total_marks && data.passing_marks) {
      return data.passing_marks <= data.total_marks;
    }
    return true;
  },
  { message: 'Passing marks cannot exceed total marks' }
);

export const updateRegularExamSchema = createRegularExamBaseSchema
  .omit({ program_id: true })
  .partial();

export const updateRegularExamStatusSchema = z.object({
  status: z.enum([
    REGULAR_EXAM_STATUS.DRAFT,
    REGULAR_EXAM_STATUS.SCHEDULED,
    REGULAR_EXAM_STATUS.IN_PROGRESS,
    REGULAR_EXAM_STATUS.COMPLETED,
    REGULAR_EXAM_STATUS.CANCELLED,
  ]),
});

// Exam Rooms
export const createExamRoomSchema = z.object({
  exam_id: uuidSchema,
  room_name: nonEmptyString.max(100),
  room_number: z.string().max(20).optional(),
  building: z.string().max(100).optional(),
  capacity: z.number().int().positive().max(1000),
  floor: z.number().int().min(0).max(50).optional(),
});

export const allocateRoomsSchema = z.object({
  room_ids: z.array(uuidSchema).min(1, 'At least one room required'),
});

// Invigilator Assignments
export const assignInvigilatorSchema = z.object({
  exam_id: uuidSchema,
  room_id: uuidSchema,
  invigilator_id: uuidSchema,
  session_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  session_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
});

export const swapInvigilatorSchema = z.object({
  assignment_id: uuidSchema,
  new_invigilator_id: uuidSchema,
});

// Hall Tickets
export const generateHallTicketsSchema = z.object({
  exam_id: uuidSchema,
  student_ids: z.array(uuidSchema).optional(), // If empty, generate for all eligible students
});

// Results
export const enterResultSchema = z.object({
  exam_id: uuidSchema,
  student_id: uuidSchema,
  marks_obtained: z.number().min(0),
  grade: z.enum(Object.values(GRADE_LETTERS) as [string, ...string[]]).optional(),
  grade_points: z.number().min(0).max(10).optional(),
  remarks: z.string().max(500).optional(),
});

export const bulkResultUploadSchema = z.object({
  exam_id: uuidSchema,
  results: z.array(z.object({
    enrollment_number: nonEmptyString,
    marks_obtained: z.number().min(0),
    grade: z.enum(Object.values(GRADE_LETTERS) as [string, ...string[]]).optional(),
    grade_points: z.number().min(0).max(10).optional(),
  })).min(1),
});

// ============================================
// Module 6: Online Proctored Exam
// ============================================

export const startProctoringSessionSchema = z.object({
  exam_id: uuidSchema,
  candidate_id: uuidSchema,
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
});

export const endProctoringSessionSchema = z.object({
  status: z.enum([
    PROCTORING_STATUS.COMPLETED,
    PROCTORING_STATUS.TERMINATED,
  ]),
  reason: z.string().optional(),
});

export const reportFlagSchema = z.object({
  session_id: uuidSchema,
  flag_type: z.enum(
    Object.values(FLAG_TYPE) as [string, ...string[]]
  ),
  severity: z.number().int().min(1).max(10),
  description: z.string().max(1000).optional(),
  screenshot_url: z.string().url().optional(),
});

export const reviewFlagSchema = z.object({
  review_status: z.enum([
    FLAG_REVIEW_STATUS.CLEARED,
    FLAG_REVIEW_STATUS.VIOLATION,
    FLAG_REVIEW_STATUS.DISMISSED,
  ]),
  reviewer_notes: z.string().max(1000).optional(),
});

export const reviewSessionSchema = z.object({
  review_status: z.enum([
    PROCTORING_REPORT_STATUS.REVIEWED,
    PROCTORING_REPORT_STATUS.CLEARED,
    PROCTORING_REPORT_STATUS.VIOLATION_REPORTED,
  ]),
  reviewer_notes: z.string().max(2000).optional(),
});
