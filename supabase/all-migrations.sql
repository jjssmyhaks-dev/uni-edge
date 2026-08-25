-- ============================================
-- Uni-Edge — All Database Migrations (Combined)
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- ============================================
-- 00001: Institutions
-- ============================================
CREATE TABLE IF NOT EXISTS institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(50),
  type VARCHAR(20) NOT NULL CHECK (type IN ('government', 'private', 'deemed')),
  address TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read institutions" ON institutions FOR SELECT USING (true);
CREATE POLICY "Super admin manage institutions" ON institutions FOR ALL USING ((auth.jwt() ->> 'role') = 'super_admin');

-- ============================================
-- 00002: Departments
-- ============================================
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_departments_institution ON departments(institution_id);
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Institution isolation for departments" ON departments
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID)
  WITH CHECK (institution_id = (auth.jwt() ->> 'institution_id')::UUID);
CREATE POLICY "Super admin cross-institution departments" ON departments
  FOR ALL USING ((auth.jwt() ->> 'role') = 'super_admin');

-- ============================================
-- 00003: Users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255) NOT NULL UNIQUE,
  institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'applicant',
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_institution ON users(institution_id);
CREATE INDEX idx_users_clerk ON users(clerk_user_id);
CREATE INDEX idx_users_role ON users(role);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Institution isolation for users" ON users
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID)
  WITH CHECK (institution_id = (auth.jwt() ->> 'institution_id')::UUID);
CREATE POLICY "Super admin cross-institution users" ON users
  FOR ALL USING ((auth.jwt() ->> 'role') = 'super_admin');

-- ============================================
-- 00004: Audit Logs
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_institution ON audit_logs(institution_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Institution isolation for audit_logs" ON audit_logs
  FOR SELECT USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID);
CREATE POLICY "Super admin cross-institution audit_logs" ON audit_logs
  FOR ALL USING ((auth.jwt() ->> 'role') = 'super_admin');

-- ============================================
-- 00005: Programs
-- ============================================
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(20),
  degree_level VARCHAR(20) NOT NULL CHECK (degree_level IN ('undergraduate', 'postgraduate', 'diploma', 'phd')),
  duration_years INTEGER CHECK (duration_years > 0 AND duration_years <= 10),
  total_seats INTEGER CHECK (total_seats > 0 AND total_seats <= 10000),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_programs_institution ON programs(institution_id);
CREATE INDEX idx_programs_department ON programs(department_id);
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Institution isolation for programs" ON programs
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID)
  WITH CHECK (institution_id = (auth.jwt() ->> 'institution_id')::UUID);
CREATE POLICY "Super admin cross-institution programs" ON programs
  FOR ALL USING ((auth.jwt() ->> 'role') = 'super_admin');

-- ============================================
-- 00006: Program Eligibility & Category Quotas
-- ============================================
CREATE TABLE IF NOT EXISTS program_eligibility (
  program_id UUID PRIMARY KEY REFERENCES programs(id) ON DELETE CASCADE,
  criteria JSONB NOT NULL DEFAULT '{}',
  category_relaxations JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS category_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  category VARCHAR(20) NOT NULL,
  seats INTEGER NOT NULL CHECK (seats >= 0),
  UNIQUE(program_id, category)
);

-- ============================================
-- 00007: Admission Cycles
-- ============================================
CREATE TABLE IF NOT EXISTS admission_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  academic_year VARCHAR(7) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'archived')),
  application_start_date DATE,
  application_end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admission_cycles_institution ON admission_cycles(institution_id);
ALTER TABLE admission_cycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Institution isolation for admission_cycles" ON admission_cycles
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID)
  WITH CHECK (institution_id = (auth.jwt() ->> 'institution_id')::UUID);
CREATE POLICY "Super admin cross-institution admission_cycles" ON admission_cycles
  FOR ALL USING ((auth.jwt() ->> 'role') = 'super_admin');

-- ============================================
-- 00008: Entrance Exams
-- ============================================
CREATE TABLE IF NOT EXISTS entrance_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  cycle_id UUID NOT NULL REFERENCES admission_cycles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  exam_date DATE,
  exam_time TIME,
  duration_minutes INTEGER CHECK (duration_minutes > 0 AND duration_minutes <= 480),
  mode VARCHAR(20) CHECK (mode IN ('online', 'offline', 'hybrid')),
  total_marks INTEGER CHECK (total_marks > 0),
  passing_marks INTEGER CHECK (passing_marks > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'under_review', 'locked', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES entrance_exams(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  location TEXT,
  capacity INTEGER CHECK (capacity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES entrance_exams(id) ON DELETE CASCADE,
  candidate_name VARCHAR(255) NOT NULL,
  candidate_email VARCHAR(255),
  candidate_phone VARCHAR(20),
  registration_number VARCHAR(50),
  registration_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (registration_status IN ('pending', 'confirmed', 'cancelled')),
  admit_card_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES entrance_exams(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES exam_candidates(id) ON DELETE CASCADE,
  score NUMERIC(10,2),
  category VARCHAR(20),
  merit_rank INTEGER,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(exam_id, candidate_id)
);

ALTER TABLE entrance_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Institution isolation for entrance_exams" ON entrance_exams
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID)
  WITH CHECK (institution_id = (auth.jwt() ->> 'institution_id')::UUID);
CREATE POLICY "Super admin cross-institution entrance_exams" ON entrance_exams
  FOR ALL USING ((auth.jwt() ->> 'role') = 'super_admin');

-- ============================================
-- 00009: Applications
-- ============================================
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  cycle_id UUID NOT NULL REFERENCES admission_cycles(id) ON DELETE CASCADE,
  applicant_name VARCHAR(255) NOT NULL,
  applicant_email VARCHAR(255),
  applicant_phone VARCHAR(20),
  clerk_user_id VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'shortlisted', 'offer_sent', 'confirmed', 'rejected', 'waitlisted')),
  form_data JSONB DEFAULT '{}',
  merit_rank INTEGER,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  student_id UUID,
  document_type VARCHAR(50) NOT NULL,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(100),
  parsed_data JSONB,
  verification_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Institution isolation for applications" ON applications
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID)
  WITH CHECK (institution_id = (auth.jwt() ->> 'institution_id')::UUID);

-- ============================================
-- 00010: Students
-- ============================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  enrollment_number VARCHAR(50),
  enrollment_status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (enrollment_status IN ('active', 'inactive', 'graduated', 'withdrawn', 'expelled')),
  batch_year VARCHAR(10),
  admission_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Institution isolation for students" ON students
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID)
  WITH CHECK (institution_id = (auth.jwt() ->> 'institution_id')::UUID);
CREATE POLICY "Students can view own record" ON students
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Super admin cross-institution students" ON students
  FOR ALL USING ((auth.jwt() ->> 'role') = 'super_admin');

-- ============================================
-- 00011: Attendance Records (Module 4)
-- ============================================
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  course_code VARCHAR(20),
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  remarks TEXT,
  marked_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, program_id, course_code, date)
);

CREATE INDEX idx_attendance_institution ON attendance_records(institution_id);
CREATE INDEX idx_attendance_student ON attendance_records(student_id);
CREATE INDEX idx_attendance_program_date ON attendance_records(program_id, date);
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Institution isolation for attendance" ON attendance_records
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID)
  WITH CHECK (institution_id = (auth.jwt() ->> 'institution_id')::UUID);
CREATE POLICY "Super admin cross-institution attendance" ON attendance_records
  FOR ALL USING ((auth.jwt() ->> 'role') = 'super_admin');

-- ============================================
-- 00012: Document Requests (Module 4)
-- ============================================
CREATE TABLE IF NOT EXISTS document_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  request_type VARCHAR(50) NOT NULL,
  custom_type VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'requested',
  remarks TEXT,
  processed_by UUID REFERENCES users(id),
  processed_at TIMESTAMPTZ,
  issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE document_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Institution isolation for document_requests" ON document_requests
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID)
  WITH CHECK (institution_id = (auth.jwt() ->> 'institution_id')::UUID);
CREATE POLICY "Students can view their own document_requests" ON document_requests
  FOR SELECT USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));
CREATE POLICY "Students can create document_requests" ON document_requests
  FOR INSERT WITH CHECK (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));
CREATE POLICY "Super admin cross-institution document_requests" ON document_requests
  FOR ALL USING ((auth.jwt() ->> 'role') = 'super_admin');

-- ============================================
-- 00013: Regular Exams (Module 5)
-- ============================================
CREATE TABLE IF NOT EXISTS regular_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  course_code VARCHAR(20),
  term VARCHAR(30) NOT NULL,
  academic_year VARCHAR(7) NOT NULL,
  exam_date DATE,
  exam_time TIME,
  duration_minutes INTEGER CHECK (duration_minutes > 0 AND duration_minutes <= 480),
  total_marks INTEGER CHECK (total_marks > 0),
  passing_marks INTEGER CHECK (passing_marks > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES regular_exams(id) ON DELETE CASCADE,
  room_name VARCHAR(100) NOT NULL,
  room_number VARCHAR(20),
  building VARCHAR(100),
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  floor INTEGER CHECK (floor >= 0),
  allocation_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invigilator_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES regular_exams(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES exam_rooms(id) ON DELETE CASCADE,
  invigilator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  session_time TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(exam_id, invigilator_id, session_date)
);

CREATE TABLE IF NOT EXISTS hall_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES regular_exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  ticket_number VARCHAR(50) NOT NULL UNIQUE,
  room_id UUID REFERENCES exam_rooms(id),
  seat_number INTEGER,
  issued BOOLEAN NOT NULL DEFAULT false,
  issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(exam_id, student_id)
);

CREATE TABLE IF NOT EXISTS regular_exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES regular_exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  marks_obtained NUMERIC(10,2) CHECK (marks_obtained >= 0),
  grade VARCHAR(5),
  grade_points NUMERIC(4,2) CHECK (grade_points >= 0 AND grade_points <= 10),
  is_published BOOLEAN NOT NULL DEFAULT false,
  remarks TEXT,
  entered_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(exam_id, student_id)
);

ALTER TABLE regular_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE invigilator_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hall_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE regular_exam_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Institution isolation for regular_exams" ON regular_exams
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID)
  WITH CHECK (institution_id = (auth.jwt() ->> 'institution_id')::UUID);
CREATE POLICY "Institution isolation for exam_rooms" ON exam_rooms
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID)
  WITH CHECK (institution_id = (auth.jwt() ->> 'institution_id')::UUID);
CREATE POLICY "Institution isolation for hall_tickets" ON hall_tickets
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID)
  WITH CHECK (institution_id = (auth.jwt() ->> 'institution_id')::UUID);
CREATE POLICY "Students can view their own hall_tickets" ON hall_tickets
  FOR SELECT USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));
CREATE POLICY "Institution isolation for regular_exam_results" ON regular_exam_results
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID)
  WITH CHECK (institution_id = (auth.jwt() ->> 'institution_id')::UUID);
CREATE POLICY "Students can view their own published results" ON regular_exam_results
  FOR SELECT USING (is_published = true AND student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

-- ============================================
-- 00014: Proctoring (Module 6)
-- ============================================
CREATE TABLE IF NOT EXISTS proctoring_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES entrance_exams(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES exam_candidates(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  total_flag_count INTEGER NOT NULL DEFAULT 0,
  review_status VARCHAR(30) NOT NULL DEFAULT 'pending_review',
  reviewer_id UUID REFERENCES users(id),
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(exam_id, candidate_id)
);

CREATE TABLE IF NOT EXISTS flagged_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES proctoring_sessions(id) ON DELETE CASCADE,
  flag_type VARCHAR(50) NOT NULL,
  severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 10),
  description TEXT,
  screenshot_url TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  review_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  reviewer_id UUID REFERENCES users(id),
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_proctoring_sessions_institution ON proctoring_sessions(institution_id);
CREATE INDEX idx_flagged_events_session ON flagged_events(session_id);
ALTER TABLE proctoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flagged_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Institution isolation for proctoring_sessions" ON proctoring_sessions
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID)
  WITH CHECK (institution_id = (auth.jwt() ->> 'institution_id')::UUID);
CREATE POLICY "Institution isolation for flagged_events" ON flagged_events
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID)
  WITH CHECK (institution_id = (auth.jwt() ->> 'institution_id')::UUID);

-- Auto-update flag count
CREATE OR REPLACE FUNCTION update_proctoring_flag_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE proctoring_sessions
  SET total_flag_count = (SELECT COUNT(*) FROM flagged_events WHERE session_id = NEW.session_id),
      updated_at = NOW()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_flag_count ON flagged_events;
CREATE TRIGGER trg_update_flag_count
  AFTER INSERT ON flagged_events
  FOR EACH ROW
  EXECUTE FUNCTION update_proctoring_flag_count();

-- ============================================
-- Notices (Module 4)
-- ============================================
CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  target_audience VARCHAR(20) NOT NULL DEFAULT 'all',
  target_department_id UUID REFERENCES departments(id),
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Institution isolation for notices" ON notices
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID)
  WITH CHECK (institution_id = (auth.jwt() ->> 'institution_id')::UUID);

-- ============================================
-- Sync Queue (Module 7 — offline support)
-- ============================================
CREATE TABLE IF NOT EXISTS sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  operation VARCHAR(10) NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
  payload JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'synced', 'conflict', 'failed')),
  client_timestamp TIMESTAMPTZ NOT NULL,
  synced_at TIMESTAMPTZ,
  conflict_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Institution isolation for sync_queue" ON sync_queue
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID)
  WITH CHECK (institution_id = (auth.jwt() ->> 'institution_id')::UUID);

-- ============================================
-- Done! All tables created.
-- ============================================
