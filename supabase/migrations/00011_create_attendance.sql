-- ============================================
-- Module 4: Attendance Records
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
  
  -- One record per student per course per date
  UNIQUE(student_id, program_id, course_code, date)
);

CREATE INDEX idx_attendance_institution ON attendance_records(institution_id);
CREATE INDEX idx_attendance_student ON attendance_records(student_id);
CREATE INDEX idx_attendance_program_date ON attendance_records(program_id, date);
CREATE INDEX idx_attendance_course ON attendance_records(program_id, course_code, date);

ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution isolation for attendance" ON attendance_records
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID)
  WITH CHECK (institution_id = (auth.jwt() ->> 'institution_id')::UUID);

CREATE POLICY "Super admin cross-institution attendance" ON attendance_records
  FOR ALL USING ((auth.jwt() ->> 'role') = 'super_admin');
