-- ============================================
-- EXAM QUESTIONS (Question bank per exam)
-- ============================================
CREATE TABLE IF NOT EXISTS exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES entrance_exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'mcq' CHECK (question_type IN ('mcq', 'true_false', 'short_answer')),
  options JSONB NOT NULL DEFAULT '[]', -- ["Option A", "Option B", "Option C", "Option D"]
  correct_answer TEXT, -- The correct option text or answer
  marks NUMERIC(5,2) NOT NULL DEFAULT 1.0,
  question_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exam_questions_exam ON exam_questions(exam_id);
CREATE INDEX idx_exam_questions_institution ON exam_questions(institution_id);
CREATE INDEX idx_exam_questions_order ON exam_questions(exam_id, question_order);

ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exam_questions_institution_access" ON exam_questions
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID);

CREATE POLICY "super_admin_exam_questions" ON exam_questions
  FOR ALL USING ((auth.jwt() ->> 'role') = 'super_admin');

-- Students can read questions for their exam (without correct_answer)
CREATE POLICY "students_read_exam_questions" ON exam_questions
  FOR SELECT USING (
    exam_id IN (
      SELECT exam_id FROM exam_submissions WHERE id IN (
        SELECT id FROM exam_submissions WHERE student_id IN (
          SELECT id FROM students WHERE clerk_user_id = (auth.jwt() ->> 'sub')
        )
      )
    )
  );

CREATE TRIGGER set_exam_questions_updated_at
  BEFORE UPDATE ON exam_questions FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- EXAM SUBMISSIONS (Student's exam attempt)
-- ============================================
CREATE TABLE IF NOT EXISTS exam_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES entrance_exams(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES exam_candidates(id) ON DELETE SET NULL,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  proctoring_session_id UUID REFERENCES proctoring_sessions(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'submitted', 'timed_out', 'terminated')),
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  time_limit_minutes INTEGER NOT NULL DEFAULT 120,
  total_marks NUMERIC(8,2) DEFAULT 0,
  marks_obtained NUMERIC(8,2) DEFAULT 0,
  score_percentage NUMERIC(5,2) DEFAULT 0,
  answers JSONB DEFAULT '{}', -- { "question_id": "selected_option", ... }
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exam_submissions_exam ON exam_submissions(exam_id);
CREATE INDEX idx_exam_submissions_student ON exam_submissions(student_id);
CREATE INDEX idx_exam_submissions_institution ON exam_submissions(institution_id);
CREATE INDEX idx_exam_submissions_status ON exam_submissions(status);

ALTER TABLE exam_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exam_submissions_institution_access" ON exam_submissions
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID);

CREATE POLICY "super_admin_exam_submissions" ON exam_submissions
  FOR ALL USING ((auth.jwt() ->> 'role') = 'super_admin');

-- Students can read/modify their own submissions
CREATE POLICY "students_own_submissions" ON exam_submissions
  FOR ALL USING (
    student_id IN (
      SELECT id FROM students WHERE clerk_user_id = (auth.jwt() ->> 'sub')
    )
  );

CREATE TRIGGER set_exam_submissions_updated_at
  BEFORE UPDATE ON exam_submissions FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Add online config to entrance_exams
-- ============================================
ALTER TABLE entrance_exams ADD COLUMN IF NOT EXISTS online_config JSONB DEFAULT '{
  "enable_webcam": true,
  "enable_lockdown": true,
  "tab_switch_limit": 3,
  "auto_submit_on_threshold": 5,
  "shuffle_questions": true,
  "show_results_immediately": false
}';

ALTER TABLE entrance_exams ADD COLUMN IF NOT EXISTS question_count INTEGER DEFAULT 0;
ALTER TABLE entrance_exams ADD COLUMN IF NOT EXISTS total_marks_computed NUMERIC(8,2) DEFAULT 0;
