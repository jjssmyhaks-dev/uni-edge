-- ============================================
-- ADMISSION CYCLES
-- ============================================
CREATE TABLE admission_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'active', 'closed', 'archived'
  )),
  application_start_date DATE,
  application_end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE admission_cycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "institution_isolation" ON admission_cycles
  FOR ALL TO authenticated
  USING (institution_id = (SELECT auth.jwt()->>'institution_id'));

CREATE POLICY "super_admin_access" ON admission_cycles
  FOR ALL TO authenticated
  USING ((SELECT auth.jwt()->>'role') = 'super_admin');

-- Students/applicants can read active cycles
CREATE POLICY "applicants_read_active" ON admission_cycles
  FOR SELECT TO authenticated
  USING (
    status = 'active'
    AND institution_id = (SELECT auth.jwt()->>'institution_id')
  );

CREATE INDEX idx_admission_cycles_institution ON admission_cycles(institution_id);
CREATE INDEX idx_admission_cycles_program ON admission_cycles(program_id);

CREATE TRIGGER set_admission_cycles_updated_at
  BEFORE UPDATE ON admission_cycles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
