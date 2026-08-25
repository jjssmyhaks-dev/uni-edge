-- ============================================
-- DEPARTMENTS
-- ============================================
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Institution isolation
CREATE POLICY "institution_isolation" ON departments
  FOR ALL TO authenticated
  USING (institution_id = (SELECT auth.jwt()->>'institution_id'));

-- Super admin bypass
CREATE POLICY "super_admin_access" ON departments
  FOR ALL TO authenticated
  USING ((SELECT auth.jwt()->>'role') = 'super_admin');

CREATE INDEX idx_departments_institution ON departments(institution_id);
