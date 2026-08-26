-- ============================================
-- PROCTOR ASSIGNMENTS (Map staff to proctor exams)
-- ============================================
CREATE TABLE IF NOT EXISTS proctor_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES entrance_exams(id) ON DELETE CASCADE,
  proctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  batch_name TEXT, -- optional: "Batch A", "All candidates", etc.
  max_candidates INTEGER DEFAULT 50,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(exam_id, proctor_id)
);

CREATE INDEX idx_proctor_assignments_exam ON proctor_assignments(exam_id);
CREATE INDEX idx_proctor_assignments_proctor ON proctor_assignments(proctor_id);
CREATE INDEX idx_proctor_assignments_institution ON proctor_assignments(institution_id);

ALTER TABLE proctor_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proctor_assignments_institution_access" ON proctor_assignments
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID);

CREATE POLICY "super_admin_proctor_assignments" ON proctor_assignments
  FOR ALL USING ((auth.jwt() ->> 'role') = 'super_admin');
