-- ============================================
-- SEMESTERS
-- ============================================
CREATE TABLE IF NOT EXISTS semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  term_label TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  registration_open TIMESTAMPTZ,
  registration_close TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_semesters_institution ON semesters(institution_id);
CREATE INDEX idx_semesters_program ON semesters(program_id);
CREATE INDEX idx_semesters_status ON semesters(status);

ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "semesters_institution_access" ON semesters
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID);

CREATE POLICY "students_read_semesters" ON semesters
  FOR SELECT USING (
    institution_id IN (
      SELECT institution_id FROM students WHERE clerk_user_id = (auth.jwt() ->> 'sub')
    )
  );

CREATE TRIGGER set_semesters_updated_at
  BEFORE UPDATE ON semesters FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COURSES
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  course_code TEXT NOT NULL,
  course_name TEXT NOT NULL,
  description TEXT,
  credits NUMERIC(3,1) NOT NULL DEFAULT 3.0,
  course_type TEXT NOT NULL DEFAULT 'core' CHECK (course_type IN ('core', 'elective', 'lab', 'project', 'audit')),
  semester_number INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(institution_id, course_code)
);

CREATE INDEX idx_courses_institution ON courses(institution_id);
CREATE INDEX idx_courses_department ON courses(department_id);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "courses_institution_access" ON courses
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID);

CREATE POLICY "students_read_courses" ON courses
  FOR SELECT USING (
    institution_id IN (
      SELECT institution_id FROM students WHERE clerk_user_id = (auth.jwt() ->> 'sub')
    )
  );

CREATE TRIGGER set_courses_updated_at
  BEFORE UPDATE ON courses FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COURSE OFFERINGS (A specific course in a specific semester)
-- ============================================
CREATE TABLE IF NOT EXISTS course_offerings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  section TEXT DEFAULT 'A',
  capacity INTEGER DEFAULT 60,
  enrolled_count INTEGER DEFAULT 0,
  schedule JSONB DEFAULT '{}',
  room TEXT,
  prerequisites UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_course_offerings_institution ON course_offerings(institution_id);
CREATE INDEX idx_course_offerings_semester ON course_offerings(semester_id);
CREATE INDEX idx_course_offerings_course ON course_offerings(course_id);

ALTER TABLE course_offerings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "course_offerings_institution_access" ON course_offerings
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID);

CREATE POLICY "students_read_offerings" ON course_offerings
  FOR SELECT USING (
    institution_id IN (
      SELECT institution_id FROM students WHERE clerk_user_id = (auth.jwt() ->> 'sub')
    )
  );

CREATE TRIGGER set_course_offerings_updated_at
  BEFORE UPDATE ON course_offerings FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ENROLLMENTS (Student enrolled in a course offering)
-- ============================================
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_offering_id UUID NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'dropped', 'completed', 'withdrawn')),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, course_offering_id)
);

CREATE INDEX idx_enrollments_institution ON enrollments(institution_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_offering ON enrollments(course_offering_id);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "enrollments_student_access" ON enrollments
  FOR ALL USING (
    student_id IN (
      SELECT id FROM students WHERE clerk_user_id = (auth.jwt() ->> 'sub')
    )
  );

CREATE POLICY "enrollments_admin_access" ON enrollments
  FOR ALL USING (
    institution_id = (auth.jwt() ->> 'institution_id')::UUID
    AND (auth.jwt() ->> 'role') IN ('institution_admin', 'staff', 'super_admin')
  );

CREATE TRIGGER set_enrollments_updated_at
  BEFORE UPDATE ON enrollments FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ASSESSMENTS (Assignments, quizzes, exams per course offering)
-- ============================================
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  course_offering_id UUID NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assessment_type TEXT NOT NULL DEFAULT 'assignment' CHECK (assessment_type IN ('assignment', 'quiz', 'midterm', 'final', 'project', 'lab', 'presentation', 'participation')),
  max_marks NUMERIC(6,2) NOT NULL DEFAULT 100,
  weight_percentage NUMERIC(5,2) DEFAULT 0,
  due_date TIMESTAMPTZ,
  allow_late_submission BOOLEAN DEFAULT false,
  late_penalty_per_day NUMERIC(5,2) DEFAULT 0,
  allow_resubmission BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'grading', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assessments_institution ON assessments(institution_id);
CREATE INDEX idx_assessments_offering ON assessments(course_offering_id);
CREATE INDEX idx_assessments_status ON assessments(status);

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assessments_institution_access" ON assessments
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID);

CREATE POLICY "students_read_published_assessments" ON assessments
  FOR SELECT USING (
    status = 'published'
    AND course_offering_id IN (
      SELECT co.id FROM course_offerings co
      JOIN enrollments e ON e.course_offering_id = co.id
      WHERE e.student_id IN (
        SELECT id FROM students WHERE clerk_user_id = (auth.jwt() ->> 'sub')
      )
    )
  );

CREATE TRIGGER set_assessments_updated_at
  BEFORE UPDATE ON assessments FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ASSIGNMENT SUBMISSIONS (Student submissions for assignments)
-- ============================================
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  content TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_late BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'late', 'graded', 'returned', 'resubmitted')),
  grade NUMERIC(6,2),
  feedback TEXT,
  graded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  graded_at TIMESTAMPTZ,
  attempt_number INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(assessment_id, student_id, attempt_number)
);

CREATE INDEX idx_assignment_submissions_institution ON assignment_submissions(institution_id);
CREATE INDEX idx_assignment_submissions_assessment ON assignment_submissions(assessment_id);
CREATE INDEX idx_assignment_submissions_student ON assignment_submissions(student_id);

ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "submissions_student_access" ON assignment_submissions
  FOR ALL USING (
    student_id IN (
      SELECT id FROM students WHERE clerk_user_id = (auth.jwt() ->> 'sub')
    )
  );

CREATE POLICY "submissions_admin_access" ON assignment_submissions
  FOR ALL USING (
    institution_id = (auth.jwt() ->> 'institution_id')::UUID
    AND (auth.jwt() ->> 'role') IN ('institution_admin', 'staff', 'faculty', 'super_admin')
  );

CREATE TRIGGER set_assignment_submissions_updated_at
  BEFORE UPDATE ON assignment_submissions FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- GRADES (Final grades per course per student)
-- ============================================
CREATE TABLE IF NOT EXISTS student_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_offering_id UUID NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  total_marks NUMERIC(6,2) DEFAULT 0,
  marks_obtained NUMERIC(6,2) DEFAULT 0,
  percentage NUMERIC(5,2) DEFAULT 0,
  letter_grade TEXT,
  grade_points NUMERIC(3,2),
  credits_earned NUMERIC(3,1) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'finalized')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, course_offering_id)
);

CREATE INDEX idx_student_grades_institution ON student_grades(institution_id);
CREATE INDEX idx_student_grades_student ON student_grades(student_id);
CREATE INDEX idx_student_grades_semester ON student_grades(semester_id);

ALTER TABLE student_grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "grades_student_access" ON student_grades
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM students WHERE clerk_user_id = (auth.jwt() ->> 'sub')
    )
  );

CREATE POLICY "grades_admin_access" ON student_grades
  FOR ALL USING (
    institution_id = (auth.jwt() ->> 'institution_id')::UUID
    AND (auth.jwt() ->> 'role') IN ('institution_admin', 'staff', 'faculty', 'super_admin')
  );

CREATE TRIGGER set_student_grades_updated_at
  BEFORE UPDATE ON student_grades FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ANNOUNCEMENTS (Institution-wide or course-specific)
-- ============================================
CREATE TABLE IF NOT EXISTS course_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  course_offering_id UUID REFERENCES course_offerings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'course' CHECK (scope IN ('institution', 'course')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  published_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_pinned BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_course_announcements_institution ON course_announcements(institution_id);
CREATE INDEX idx_course_announcements_offering ON course_announcements(course_offering_id);
CREATE INDEX idx_course_announcements_published ON course_announcements(published_at DESC);

ALTER TABLE course_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "announcements_institution_access" ON course_announcements
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID);

CREATE POLICY "students_read_announcements" ON course_announcements
  FOR SELECT USING (
    institution_id IN (
      SELECT institution_id FROM students WHERE clerk_user_id = (auth.jwt() ->> 'sub')
    )
  );

CREATE TRIGGER set_course_announcements_updated_at
  BEFORE UPDATE ON course_announcements FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COURSE MATERIALS
-- ============================================
CREATE TABLE IF NOT EXISTS course_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  course_offering_id UUID NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  material_type TEXT NOT NULL DEFAULT 'document' CHECK (material_type IN ('document', 'video', 'link', 'slides', 'code', 'other')),
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_course_materials_institution ON course_materials(institution_id);
CREATE INDEX idx_course_materials_offering ON course_materials(course_offering_id);

ALTER TABLE course_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "materials_institution_access" ON course_materials
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID);

CREATE POLICY "students_read_materials" ON course_materials
  FOR SELECT USING (
    is_visible = true
    AND course_offering_id IN (
      SELECT co.id FROM course_offerings co
      JOIN enrollments e ON e.course_offering_id = co.id
      WHERE e.student_id IN (
        SELECT id FROM students WHERE clerk_user_id = (auth.jwt() ->> 'sub')
      )
    )
  );

CREATE TRIGGER set_course_materials_updated_at
  BEFORE UPDATE ON course_materials FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- JOB POSTINGS (Career/Placement board)
-- ============================================
CREATE TABLE IF NOT EXISTS job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  company_name TEXT,
  company_logo_url TEXT,
  job_type TEXT NOT NULL DEFAULT 'full_time' CHECK (job_type IN ('full_time', 'part_time', 'internship', 'contract', 'apprenticeship')),
  location TEXT,
  is_remote BOOLEAN DEFAULT false,
  salary_range TEXT,
  required_skills TEXT[] DEFAULT '{}',
  application_link TEXT,
  application_email TEXT,
  eligibility TEXT,
  posted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  deadline DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_job_postings_institution ON job_postings(institution_id);
CREATE INDEX idx_job_postings_active ON job_postings(is_active, deadline);

ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_postings_institution_access" ON job_postings
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID);

CREATE POLICY "students_read_job_postings" ON job_postings
  FOR SELECT USING (
    is_active = true
    AND institution_id IN (
      SELECT institution_id FROM students WHERE clerk_user_id = (auth.jwt() ->> 'sub')
    )
  );

CREATE TRIGGER set_job_postings_updated_at
  BEFORE UPDATE ON job_postings FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- GRIEVANCES (Student query/grievance system)
-- ============================================
CREATE TABLE IF NOT EXISTS grievances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'academic' CHECK (category IN ('academic', 'administrative', 'fee', 'examination', 'other')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'awaiting_info', 'resolved', 'closed', 'reopened')),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_grievances_institution ON grievances(institution_id);
CREATE INDEX idx_grievances_student ON grievances(student_id);
CREATE INDEX idx_grievances_status ON grievances(status);

ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "grievances_student_access" ON grievances
  FOR ALL USING (
    student_id IN (
      SELECT id FROM students WHERE clerk_user_id = (auth.jwt() ->> 'sub')
    )
  );

CREATE POLICY "grievances_admin_access" ON grievances
  FOR ALL USING (
    institution_id = (auth.jwt() ->> 'institution_id')::UUID
    AND (auth.jwt() ->> 'role') IN ('institution_admin', 'staff', 'faculty', 'super_admin')
  );

CREATE TRIGGER set_grievances_updated_at
  BEFORE UPDATE ON grievances FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- GRIEVANCE REPLIES
-- ============================================
CREATE TABLE IF NOT EXISTS grievance_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('student', 'admin', 'faculty', 'staff')),
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_grievance_replies_grievance ON grievance_replies(grievance_id);

ALTER TABLE grievance_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "grievance_replies_student_access" ON grievance_replies
  FOR SELECT USING (
    grievance_id IN (
      SELECT id FROM grievances WHERE student_id IN (
        SELECT id FROM students WHERE clerk_user_id = (auth.jwt() ->> 'sub')
      )
    )
  );

CREATE POLICY "grievance_replies_admin_access" ON grievance_replies
  FOR ALL USING (
    institution_id = (auth.jwt() ->> 'institution_id')::UUID
    AND (auth.jwt() ->> 'role') IN ('institution_admin', 'staff', 'faculty', 'super_admin')
  );

-- ============================================
-- INSTITUTION SETTINGS (Feature flags)
-- ============================================
CREATE TABLE IF NOT EXISTS institution_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE UNIQUE,
  placement_board_enabled BOOLEAN DEFAULT false,
  peer_visibility_enabled BOOLEAN DEFAULT false,
  multi_level_exit_enabled BOOLEAN DEFAULT false,
  flexible_registration_enabled BOOLEAN DEFAULT false,
  online_exam_enabled BOOLEAN DEFAULT false,
  attendance_required_percentage NUMERIC(5,2) DEFAULT 75.0,
  grading_scale JSONB DEFAULT '{"A+": [90, 100], "A": [80, 89], "B+": [70, 79], "B": [60, 69], "C": [50, 59], "D": [40, 49], "F": [0, 39]}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE institution_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "institution_settings_access" ON institution_settings
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID);

CREATE TRIGGER set_institution_settings_updated_at
  BEFORE UPDATE ON institution_settings FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- NOTIFICATION PREFERENCES
-- ============================================
CREATE TABLE IF NOT EXISTS student_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'info' CHECK (notification_type IN ('info', 'warning', 'success', 'error')),
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'academic', 'exam', 'fee', 'announcement', 'assignment', 'grievance')),
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_student_notifications_student ON student_notifications(student_id);
CREATE INDEX idx_student_notifications_read ON student_notifications(is_read);
CREATE INDEX idx_student_notifications_created ON student_notifications(created_at DESC);

ALTER TABLE student_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_student_access" ON student_notifications
  FOR ALL USING (
    student_id IN (
      SELECT id FROM students WHERE clerk_user_id = (auth.jwt() ->> 'sub')
    )
  );

CREATE POLICY "notifications_admin_insert" ON student_notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    institution_id = (auth.jwt() ->> 'institution_id')::UUID
  );
