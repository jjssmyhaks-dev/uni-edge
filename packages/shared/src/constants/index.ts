// ============================================
// Role Definitions
// ============================================

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  INSTITUTION_ADMIN: 'institution_admin',
  EXAM_COMMITTEE: 'exam_committee',
  FACULTY: 'faculty',
  STAFF: 'staff',
  INVIGILATOR: 'invigilator',
  STUDENT: 'student',
  APPLICANT: 'applicant',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

// Roles that can access the admin portal
export const ADMIN_ROLES: UserRole[] = [
  ROLES.SUPER_ADMIN,
  ROLES.INSTITUTION_ADMIN,
  ROLES.EXAM_COMMITTEE,
  ROLES.FACULTY,
  ROLES.STAFF,
  ROLES.INVIGILATOR,
];

// Roles that can manage users
export const USER_MANAGEMENT_ROLES: UserRole[] = [
  ROLES.SUPER_ADMIN,
  ROLES.INSTITUTION_ADMIN,
];

// Roles that can manage exams
export const EXAM_MANAGEMENT_ROLES: UserRole[] = [
  ROLES.SUPER_ADMIN,
  ROLES.INSTITUTION_ADMIN,
  ROLES.EXAM_COMMITTEE,
];

// ============================================
// Institution Types
// ============================================

export const INSTITUTION_TYPES = {
  GOVERNMENT: 'government',
  PRIVATE: 'private',
  DEEMED: 'deemed',
} as const;

export type InstitutionType = (typeof INSTITUTION_TYPES)[keyof typeof INSTITUTION_TYPES];

// ============================================
// Degree Levels
// ============================================

export const DEGREE_LEVELS = {
  UNDERGRADUATE: 'undergraduate',
  POSTGRADUATE: 'postgraduate',
  DIPLOMA: 'diploma',
  PHD: 'phd',
} as const;

export type DegreeLevel = (typeof DEGREE_LEVELS)[keyof typeof DEGREE_LEVELS];

// ============================================
// Admission Cycle Status
// ============================================

export const CYCLE_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  CLOSED: 'closed',
  ARCHIVED: 'archived',
} as const;

export type CycleStatus = (typeof CYCLE_STATUS)[keyof typeof CYCLE_STATUS];

// ============================================
// Application Status
// ============================================

export const APPLICATION_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  SHORTLISTED: 'shortlisted',
  OFFER_SENT: 'offer_sent',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
  WAITLISTED: 'waitlisted',
} as const;

export type ApplicationStatus = (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS];

// ============================================
// Exam Status
// ============================================

export const EXAM_STATUS = {
  DRAFT: 'draft',
  UNDER_REVIEW: 'under_review',
  LOCKED: 'locked',
  COMPLETED: 'completed',
} as const;

export type ExamStatus = (typeof EXAM_STATUS)[keyof typeof EXAM_STATUS];

// ============================================
// Exam Mode
// ============================================

export const EXAM_MODE = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  HYBRID: 'hybrid',
} as const;

export type ExamMode = (typeof EXAM_MODE)[keyof typeof EXAM_MODE];

// ============================================
// Registration Status
// ============================================

export const REGISTRATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
} as const;

export type RegistrationStatus = (typeof REGISTRATION_STATUS)[keyof typeof REGISTRATION_STATUS];

// ============================================
// Document Verification Status
// ============================================

export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  RESUBMISSION_REQUIRED: 'resubmission_required',
} as const;

export type VerificationStatus = (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];

// ============================================
// Document Types
// ============================================

export const DOCUMENT_TYPES = {
  MARKSHEET: 'marksheet',
  ID_PROOF: 'id_proof',
  CATEGORY_CERT: 'category_cert',
  PHOTO: 'photo',
  SIGNATURE: 'signature',
  TRANSFER_CERT: 'transfer_cert',
  MIGRATION_CERT: 'migration_cert',
  PAYMENT_RECEIPT: 'payment_receipt',
} as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[keyof typeof DOCUMENT_TYPES];

// ============================================
// Student Enrollment Status
// ============================================

export const ENROLLMENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  GRADUATED: 'graduated',
  WITHDRAWN: 'withdrawn',
  EXPELLED: 'expelled',
} as const;

export type EnrollmentStatus = (typeof ENROLLMENT_STATUS)[keyof typeof ENROLLMENT_STATUS];

// ============================================
// Reservation Categories (Indian standard)
// ============================================

export const CATEGORIES = {
  GENERAL: 'General',
  OBC: 'OBC',
  SC: 'SC',
  ST: 'ST',
  EWS: 'EWS',
} as const;

export type Category = (typeof CATEGORIES)[keyof typeof CATEGORIES];

// ============================================
// Notice Target Audience
// ============================================

export const NOTICE_AUDIENCE = {
  ALL: 'all',
  STUDENTS: 'students',
  FACULTY: 'faculty',
  DEPARTMENT: 'department',
  BATCH: 'batch',
} as const;

export type NoticeAudience = (typeof NOTICE_AUDIENCE)[keyof typeof NOTICE_AUDIENCE];

// ============================================
// Sync Status (Offline)
// ============================================

export const SYNC_STATUS = {
  PENDING: 'pending',
  SYNCED: 'synced',
  CONFLICT: 'conflict',
  FAILED: 'failed',
} as const;

export type SyncStatus = (typeof SYNC_STATUS)[keyof typeof SYNC_STATUS];

// ============================================
// Module 4: Academic/Office Admin
// ============================================

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
} as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS];

// Document Request Status
export const DOCUMENT_REQUEST_STATUS = {
  REQUESTED: 'requested',
  PROCESSING: 'processing',
  READY: 'ready',
  ISSUED: 'issued',
  REJECTED: 'rejected',
} as const;

export type DocumentRequestStatus = (typeof DOCUMENT_REQUEST_STATUS)[keyof typeof DOCUMENT_REQUEST_STATUS];

// Document Request Type
export const DOCUMENT_REQUEST_TYPES = {
  TRANSCRIPT: 'transcript',
  BONA_FIDE: 'bona_fide',
  TRANSFER_CERT: 'transfer_cert',
  MIGRATION_CERT: 'migration_cert',
  DEGREE_CERT: 'degree_cert',
  MARK_SHEET: 'mark_sheet',
  OTHER: 'other',
} as const;

export type DocumentRequestType = (typeof DOCUMENT_REQUEST_TYPES)[keyof typeof DOCUMENT_REQUEST_TYPES];

// Notice Status
export const NOTICE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export type NoticeStatus = (typeof NOTICE_STATUS)[keyof typeof NOTICE_STATUS];

// ============================================
// Module 5: Regular Exam Process
// ============================================

// Regular Exam Status
export const REGULAR_EXAM_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type RegularExamStatus = (typeof REGULAR_EXAM_STATUS)[keyof typeof REGULAR_EXAM_STATUS];

// Exam Term
export const EXAM_TERM = {
  MID_SEMESTER: 'mid_semester',
  END_SEMESTER: 'end_semester',
  INTERNAL: 'internal',
  PRACTICAL: 'practical',
  BACKLOG: 'backlog',
} as const;

export type ExamTerm = (typeof EXAM_TERM)[keyof typeof EXAM_TERM];

// Room Allocation Status
export const ROOM_ALLOCATION_STATUS = {
  PENDING: 'pending',
  ALLOCATED: 'allocated',
  CONFIRMED: 'confirmed',
} as const;

export type RoomAllocationStatus = (typeof ROOM_ALLOCATION_STATUS)[keyof typeof ROOM_ALLOCATION_STATUS];

// Grade Letter
export const GRADE_LETTERS = {
  O: 'O',
  A_PLUS: 'A+',
  A: 'A',
  B_PLUS: 'B+',
  B: 'B',
  C: 'C',
  D: 'D',
  F: 'F',
  AB: 'AB',
} as const;

export type GradeLetter = (typeof GRADE_LETTERS)[keyof typeof GRADE_LETTERS];

// ============================================
// Module 6: Online Proctored Exam
// ============================================

// Proctoring Session Status
export const PROCTORING_STATUS = {
  WAITING: 'waiting',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  TERMINATED: 'terminated',
} as const;

export type ProctoringStatus = (typeof PROCTORING_STATUS)[keyof typeof PROCTORING_STATUS];

// Flag Type (anti-cheating)
export const FLAG_TYPE = {
  TAB_SWITCH: 'tab_switch',
  MULTIPLE_FACES: 'multiple_faces',
  NO_FACE: 'no_face',
  UNUSUAL_AUDIO: 'unusual_audio',
  COPY_PASTE: 'copy_paste',
  RIGHT_CLICK: 'right_click',
  FULLSCREEN_EXIT: 'fullscreen_exit',
  SUSPICIOUS_MOVEMENT: 'suspicious_movement',
  ID_MISMATCH: 'id_mismatch',
  OTHER: 'other',
} as const;

export type FlagType = (typeof FLAG_TYPE)[keyof typeof FLAG_TYPE];

// Flag Review Status
export const FLAG_REVIEW_STATUS = {
  PENDING: 'pending',
  CLEARED: 'cleared',
  VIOLATION: 'violation',
  DISMISSED: 'dismissed',
} as const;

export type FlagReviewStatus = (typeof FLAG_REVIEW_STATUS)[keyof typeof FLAG_REVIEW_STATUS];

// Proctoring Report Status
export const PROCTORING_REPORT_STATUS = {
  PENDING_REVIEW: 'pending_review',
  REVIEWED: 'reviewed',
  CLEARED: 'cleared',
  VIOLATION_REPORTED: 'violation_reported',
} as const;

export type ProctoringReportStatus = (typeof PROCTORING_REPORT_STATUS)[keyof typeof PROCTORING_REPORT_STATUS];
