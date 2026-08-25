-- ============================================
-- PROGRAMS
-- ============================================
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT,
  degree_level TEXT NOT NULL CHECK (degree_level IN (
    'undergraduate', 'postgraduate', 'diploma', 'phd'
  )),
  duration_years DECIMAL(3,1),
  total_seats INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- Institution isolation
CREATE POLICY "institution_isolation" ON programs
  FOR ALL TO authenticated
  USING (institution_id = (SELECT auth.jwt()->>'institution_id'));

-- Super admin bypass
CREATE POLICY "super_admin_access" ON programs
  FOR ALL TO authenticated
  USING ((SELECT auth.jwt()->>'role') = 'super_admin');

-- Students and applicants can read active programs
CREATE POLICY "students_read_active" ON programs
  FOR SELECT TO authenticated
  USING (
    is_active = true
    AND institution_id = (SELECT auth.jwt()->>'institution_id')
  );

CREATE INDEX idx_programs_institution ON programs(institution_id);
CREATE INDEX idx_programs_department ON programs(department_id);

CREATE TRIGGER set_programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
