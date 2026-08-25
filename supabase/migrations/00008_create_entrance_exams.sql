-- ============================================
-- ENTRANCE EXAMS
-- ============================================
CREATE TABLE entrance_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  cycle_id UUID NOT NULL REFERENCES admission_cycles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  exam_date DATE,
  exam_time TIME,
  duration_minutes INTEGER,
  mode TEXT CHECK (mode IN ('online', 'offline', 'hybrid')),
  total_marks INTEGER,
  passing_marks INTEGER,
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'under_review', 'locked', 'completed'
  )),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE entrance_exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "institution_isolation" ON entrance_exams
  FOR ALL TO authenticated
  USING (institution_id = (SELECT auth.jwt()->>'institution_id'));

CREATE POLICY "super_admin_access" ON entrance_exams
  FOR ALL TO authenticated
  USING ((SELECT auth.jwt()->>'role') = 'super_admin');

CREATE INDEX idx_entrance_exams_institution ON entrance_exams(institution_id);
CREATE INDEX idx_entrance_exams_cycle ON entrance_exams(cycle_id);

CREATE TRIGGER set_entrance_exams_updated_at
  BEFORE UPDATE ON entrance_exams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- EXAM CENTERS
-- ============================================
CREATE TABLE exam_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES entrance_exams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  capacity INTEGER,
  online_link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE exam_centers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "institution_isolation" ON exam_centers
  FOR ALL TO authenticated
  USING (institution_id = (SELECT auth.jwt()->>'institution_id'));

-- ============================================
-- EXAM CANDIDATES
-- ============================================
CREATE TABLE exam_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES entrance_exams(id) ON DELETE CASCADE,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT,
  candidate_phone TEXT,
  registration_number TEXT UNIQUE,
  registration_status TEXT DEFAULT 'pending' CHECK (registration_status IN (
    'pending', 'confirmed', 'cancelled'
  )),
  admit_card_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE exam_candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "institution_isolation" ON exam_candidates
  FOR ALL TO authenticated
  USING (institution_id = (SELECT auth.jwt()->>'institution_id'));

-- Candidates can read their own record
CREATE POLICY "candidates_read_own" ON exam_candidates
  FOR SELECT TO authenticated
  USING (
    candidate_email = (SELECT auth.jwt()->>'email')
    OR candidate_name = (
      SELECT full_name FROM users WHERE clerk_user_id = (SELECT auth.jwt()->>'sub')
    )
  );

CREATE INDEX idx_exam_candidates_exam ON exam_candidates(exam_id);
CREATE INDEX idx_exam_candidates_registration ON exam_candidates(registration_number);

-- ============================================
-- EXAM RESULTS
-- ============================================
CREATE TABLE exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES entrance_exams(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES exam_candidates(id) ON DELETE CASCADE,
  score DECIMAL(10,2),
  category TEXT CHECK (category IN ('General', 'OBC', 'SC', 'ST', 'EWS')),
  merit_rank INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "institution_isolation" ON exam_results
  FOR ALL TO authenticated
  USING (institution_id = (SELECT auth.jwt()->>'institution_id'));

-- Candidates can read published results
CREATE POLICY "candidates_read_published" ON exam_results
  FOR SELECT TO authenticated
  USING (
    is_published = true
    AND candidate_id IN (
      SELECT id FROM exam_candidates
      WHERE candidate_email = (SELECT auth.jwt()->>'email')
    )
  );

CREATE INDEX idx_exam_results_exam ON exam_results(exam_id);
CREATE INDEX idx_exam_results_candidate ON exam_results(candidate_id);
CREATE INDEX idx_exam_results_merit ON exam_results(merit_rank);

CREATE TRIGGER set_exam_results_updated_at
  BEFORE UPDATE ON exam_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
