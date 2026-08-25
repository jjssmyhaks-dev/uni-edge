-- ============================================
-- Module 5: Regular Exam Process
-- ============================================

-- Regular Exams
CREATE TABLE IF NOT EXISTS regular_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  course_code VARCHAR(20),
  term VARCHAR(30) NOT NULL CHECK (term IN ('mid_semester', 'end_semester', 'internal', 'practical', 'backlog')),
  academic_year VARCHAR(7) NOT NULL, -- YYYY-YY format
  exam_date DATE,
  exam_time TIME,
  duration_minutes INTEGER CHECK (duration_minutes > 0 AND duration_minutes <= 480),
  total_marks INTEGER CHECK (total_marks > 0),
  passing_marks INTEGER CHECK (passing_marks > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_regular_exams_institution ON regular_exams(institution_id);
CREATE INDEX idx_regular_exams_program ON regular_exams(program_id);
CREATE INDEX idx_regular_exams_academic_year ON regular_exams(institution_id, academic_year);

-- Exam Rooms
CREATE TABLE IF NOT EXISTS exam_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES regular_exams(id) ON DELETE CASCADE,
  room_name VARCHAR(100) NOT NULL,
  room_number VARCHAR(20),
  building VARCHAR(100),
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  floor INTEGER CHECK (floor >= 0),
  allocation_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (allocation_status IN ('pending', 'allocated', 'confirmed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exam_rooms_institution ON exam_rooms(institution_id);
CREATE INDEX idx_exam_rooms_exam ON exam_rooms(exam_id);

-- Invigilator Assignments
CREATE TABLE IF NOT EXISTS invigilator_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES regular_exams(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES exam_rooms(id) ON DELETE CASCADE,
  invigilator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  session_time TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Prevent double-booking: one invigilator per exam per date
  UNIQUE(exam_id, invigilator_id, session_date)
);

CREATE INDEX idx_invigilator_assignments_institution ON invigilator_assignments(institution_id);
CREATE INDEX idx_invigilator_assignments_exam ON invigilator_assignments(exam_id);
CREATE INDEX idx_invigilator_assignments_invigilator ON invigilator_assignments(invigilator_id, session_date);

-- Hall Tickets
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

CREATE INDEX idx_hall_tickets_institution ON hall_tickets(institution_id);
CREATE INDEX idx_hall_tickets_exam ON hall_tickets(exam_id);
CREATE INDEX idx_hall_tickets_student ON hall_tickets(student_id);
CREATE INDEX idx_hall_tickets_room ON hall_tickets(room_id);

-- Regular Exam Results
CREATE TABLE IF NOT EXISTS regular_exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES regular_exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  marks_obtained NUMERIC(10,2) CHECK (marks_obtained >= 0),
  grade VARCHAR(5) CHECK (grade IN ('O', 'A+', 'A', 'B+', 'B', 'C', 'D', 'F', 'AB')),
  grade_points NUMERIC(4,2) CHECK (grade_points >= 0 AND grade_points <= 10),
  is_published BOOLEAN NOT NULL DEFAULT false,
  remarks TEXT,
  entered_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(exam_id, student_id)
);

CREATE INDEX idx_regular_results_institution ON regular_exam_results(institution_id);
CREATE INDEX idx_regular_results_exam ON regular_exam_results(exam_id);
CREATE INDEX idx_regular_results_student ON regular_exam_results(student_id);

-- ============================================
-- RLS Policies for Module 5 tables
-- ============================================

ALTER TABLE regular_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE invigilator_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hall_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE regular_exam_results ENABLE ROW LEVEL SECURITY;

-- regular_exams
CREATE POLICY "Institution isolation for regular exams" ON regular_exams
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID)
  WITH CHECK (institution_id = (auth.jwt() ->> 'institution_id')::UUID);

-- exam_rooms
CREATE POLICY "Institution isolation for exam rooms" ON exam_rooms
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID)
  WITH CHECK (institution_id = (auth.jwt() ->> 'institution_id')::UUID);

-- invigilator_assignments
CREATE POLICY "Institution isolation for invigilator assignments" ON invigilator_assignments
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID)
  WITH CHECK (institution_id = (auth.jwt() ->> 'institution_id')::UUID);

-- hall_tickets
CREATE POLICY "Institution isolation for hall tickets" ON hall_tickets
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID)
  WITH CHECK (institution_id = (auth.jwt() ->> 'institution_id')::UUID);

CREATE POLICY "Students can view their own hall tickets" ON hall_tickets
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

-- regular_exam_results
CREATE POLICY "Institution isolation for regular exam results" ON regular_exam_results
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID)
  WITH CHECK (institution_id = (auth.jwt() ->> 'institution_id')::UUID);

CREATE POLICY "Students can view their own published results" ON regular_exam_results
  FOR SELECT USING (
    is_published = true AND
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

-- Super admin policies
CREATE POLICY "Super admin cross-institution regular exams" ON regular_exams
  FOR ALL USING ((auth.jwt() ->> 'role') = 'super_admin');

CREATE POLICY "Super admin cross-institution exam rooms" ON exam_rooms
  FOR ALL USING ((auth.jwt() ->> 'role') = 'super_admin');

CREATE POLICY "Super admin cross-institution invigilator assignments" ON invigilator_assignments
  FOR ALL USING ((auth.jwt() ->> 'role') = 'super_admin');

CREATE POLICY "Super admin cross-institution hall tickets" ON hall_tickets
  FOR ALL USING ((auth.jwt() ->> 'role') = 'super_admin');

CREATE POLICY "Super admin cross-institution regular exam results" ON regular_exam_results
  FOR ALL USING ((auth.jwt() ->> 'role') = 'super_admin');
