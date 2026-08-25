import type { UserRole, InstitutionType, DegreeLevel, CycleStatus, ApplicationStatus, ExamStatus, ExamMode, RegistrationStatus, VerificationStatus, DocumentType, EnrollmentStatus, Category, NoticeAudience, AttendanceStatus, DocumentRequestStatus, DocumentRequestType, RegularExamStatus, ExamTerm, GradeLetter, ProctoringStatus, FlagType, FlagReviewStatus } from '../constants';

// ============================================
// Institution
// ============================================

export interface Institution {
  id: string;
  name: string;
  short_name: string | null;
  type: InstitutionType;
  address: string | null;
  logo_url: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateInstitutionInput {
  name: string;
  short_name?: string;
  type: InstitutionType;
  address?: string;
}

// ============================================
// Department
// ============================================

export interface Department {
  id: string;
  institution_id: string;
  name: string;
  code: string | null;
  created_at: string;
}

export interface CreateDepartmentInput {
  institution_id: string;
  name: string;
  code?: string;
}

// ============================================
// User
// ============================================

export interface User {
  id: string;
  clerk_user_id: string;
  institution_id: string | null;
  role: UserRole;
  department_id: string | null;
  email: string;
  full_name: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  clerk_user_id: string;
  institution_id?: string;
  role: UserRole;
  department_id?: string;
  email: string;
  full_name?: string;
  phone?: string;
}

// ============================================
// Program
// ============================================

export interface Program {
  id: string;
  institution_id: string;
  department_id: string | null;
  name: string;
  code: string | null;
  degree_level: DegreeLevel;
  duration_years: number | null;
  total_seats: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProgramInput {
  institution_id: string;
  department_id?: string;
  name: string;
  code?: string;
  degree_level: DegreeLevel;
  duration_years?: number;
  total_seats?: number;
}

// ============================================
// Admission Cycle
// ============================================

export interface AdmissionCycle {
  id: string;
  institution_id: string;
  program_id: string;
  academic_year: string;
  status: CycleStatus;
  application_start_date: string | null;
  application_end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAdmissionCycleInput {
  institution_id: string;
  program_id: string;
  academic_year: string;
  application_start_date?: string;
  application_end_date?: string;
}

// ============================================
// Entrance Exam
// ============================================

export interface EntranceExam {
  id: string;
  institution_id: string;
  cycle_id: string;
  name: string;
  description: string | null;
  exam_date: string | null;
  exam_time: string | null;
  duration_minutes: number | null;
  mode: ExamMode | null;
  total_marks: number | null;
  passing_marks: number | null;
  status: ExamStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateEntranceExamInput {
  institution_id: string;
  cycle_id: string;
  name: string;
  description?: string;
  exam_date?: string;
  exam_time?: string;
  duration_minutes?: number;
  mode?: ExamMode;
  total_marks?: number;
  passing_marks?: number;
}

// ============================================
// Exam Candidate
// ============================================

export interface ExamCandidate {
  id: string;
  institution_id: string;
  exam_id: string;
  candidate_name: string;
  candidate_email: string | null;
  candidate_phone: string | null;
  registration_number: string | null;
  registration_status: RegistrationStatus;
  admit_card_generated: boolean;
  created_at: string;
}

// ============================================
// Exam Result
// ============================================

export interface ExamResult {
  id: string;
  institution_id: string;
  exam_id: string;
  candidate_id: string;
  score: number | null;
  category: Category | null;
  merit_rank: number | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// Application
// ============================================

export interface Application {
  id: string;
  institution_id: string;
  cycle_id: string;
  applicant_name: string;
  applicant_email: string | null;
  applicant_phone: string | null;
  clerk_user_id: string | null;
  status: ApplicationStatus;
  form_data: Record<string, unknown>;
  merit_rank: number | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// Document
// ============================================

export interface Document {
  id: string;
  institution_id: string;
  application_id: string | null;
  student_id: string | null;
  document_type: DocumentType;
  file_url: string;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  parsed_data: Record<string, unknown> | null;
  verification_status: VerificationStatus;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
}

// ============================================
// Student
// ============================================

export interface Student {
  id: string;
  institution_id: string;
  program_id: string;
  user_id: string | null;
  enrollment_number: string | null;
  enrollment_status: EnrollmentStatus;
  batch_year: string | null;
  admission_date: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// Notice
// ============================================

export interface Notice {
  id: string;
  institution_id: string;
  title: string;
  content: string;
  target_audience: NoticeAudience;
  target_department_id: string | null;
  published: boolean;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
}

// ============================================
// Audit Log
// ============================================

export interface AuditLog {
  id: string;
  institution_id: string | null;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

// ============================================
// API Responses
// ============================================

export interface ApiResponse<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ============================================
// Module 4: Academic/Office Admin
// ============================================

// Attendance Record
export interface AttendanceRecord {
  id: string;
  institution_id: string;
  student_id: string;
  program_id: string;
  course_code: string | null;
  date: string;
  status: AttendanceStatus;
  remarks: string | null;
  marked_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAttendanceInput {
  student_id: string;
  program_id: string;
  course_code?: string;
  date: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface BulkAttendanceInput {
  records: CreateAttendanceInput[];
}

// Student Record (extended)
export interface StudentRecord {
  id: string;
  institution_id: string;
  program_id: string;
  user_id: string | null;
  enrollment_number: string | null;
  enrollment_status: EnrollmentStatus;
  batch_year: string | null;
  admission_date: string | null;
  // Extended fields from joins
  programs?: Program;
  users?: User;
  attendance_summary?: {
    total_classes: number;
    present: number;
    absent: number;
    percentage: number;
  };
  created_at: string;
  updated_at: string;
}

// Document Request
export interface DocumentRequest {
  id: string;
  institution_id: string;
  student_id: string;
  request_type: DocumentRequestType;
  custom_type: string | null;
  status: DocumentRequestStatus;
  remarks: string | null;
  processed_by: string | null;
  processed_at: string | null;
  issued_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  students?: StudentRecord;
}

export interface CreateDocumentRequestInput {
  student_id: string;
  request_type: DocumentRequestType;
  custom_type?: string;
  remarks?: string;
}

// Notice (extended)
export interface NoticeExtended extends Notice {
  target_department?: Department | null;
  creator?: User | null;
  status: string;
}

// ============================================
// Module 5: Regular Exam Process
// ============================================

// Regular Exam
export interface RegularExam {
  id: string;
  institution_id: string;
  program_id: string;
  name: string;
  course_code: string | null;
  term: ExamTerm;
  academic_year: string;
  exam_date: string | null;
  exam_time: string | null;
  duration_minutes: number | null;
  total_marks: number | null;
  passing_marks: number | null;
  status: RegularExamStatus;
  created_at: string;
  updated_at: string;
  // Joined
  programs?: Program;
}

export interface CreateRegularExamInput {
  program_id: string;
  name: string;
  course_code?: string;
  term: ExamTerm;
  academic_year: string;
  exam_date?: string;
  exam_time?: string;
  duration_minutes?: number;
  total_marks?: number;
  passing_marks?: number;
}

// Exam Room
export interface ExamRoom {
  id: string;
  institution_id: string;
  exam_id: string;
  room_name: string;
  room_number: string | null;
  building: string | null;
  capacity: number;
  floor: number | null;
  allocation_status: string;
  created_at: string;
}

// Invigilator Assignment
export interface InvigilatorAssignment {
  id: string;
  institution_id: string;
  exam_id: string;
  room_id: string;
  invigilator_id: string;
  session_date: string;
  session_time: string | null;
  created_at: string;
  // Joined
  users?: User;
  exam_rooms?: ExamRoom;
  regular_exams?: RegularExam;
}

// Hall Ticket
export interface HallTicket {
  id: string;
  institution_id: string;
  exam_id: string;
  student_id: string;
  ticket_number: string;
  room_id: string | null;
  seat_number: number | null;
  issued: boolean;
  issued_at: string | null;
  created_at: string;
  // Joined
  students?: StudentRecord;
  exam_rooms?: ExamRoom;
  regular_exams?: RegularExam;
}

// Regular Exam Result
export interface RegularExamResult {
  id: string;
  institution_id: string;
  exam_id: string;
  student_id: string;
  marks_obtained: number | null;
  grade: GradeLetter | null;
  grade_points: number | null;
  is_published: boolean;
  remarks: string | null;
  entered_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  students?: StudentRecord;
  regular_exams?: RegularExam;
}

// ============================================
// Module 6: Online Proctored Exam
// ============================================

// Proctoring Session
export interface ProctoringSession {
  id: string;
  institution_id: string;
  exam_id: string;
  candidate_id: string;
  status: ProctoringStatus;
  started_at: string | null;
  ended_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
  total_flag_count: number;
  review_status: string;
  reviewer_id: string | null;
  reviewer_notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  exam_candidates?: ExamCandidate;
  flagged_events?: FlaggedEvent[];
  entrance_exams?: EntranceExam;
}

// Flagged Event
export interface FlaggedEvent {
  id: string;
  institution_id: string;
  session_id: string;
  flag_type: FlagType;
  severity: number;
  description: string | null;
  screenshot_url: string | null;
  timestamp: string;
  review_status: FlagReviewStatus;
  reviewer_id: string | null;
  reviewer_notes: string | null;
  created_at: string;
}

export interface ReviewFlagInput {
  review_status: FlagReviewStatus;
  reviewer_notes?: string;
}

export interface ReviewSessionInput {
  review_status: string;
  reviewer_notes?: string;
}

// Proctoring Stats
export interface ProctoringStats {
  total_sessions: number;
  in_progress: number;
  completed: number;
  terminated: number;
  pending_review: number;
  total_flags: number;
  violations: number;
}
