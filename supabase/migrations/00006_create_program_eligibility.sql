-- ============================================
-- PROGRAM ELIGIBILITY CRITERIA
-- ============================================
CREATE TABLE program_eligibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  criteria_type TEXT NOT NULL CHECK (criteria_type IN (
    'minimum_percentage', 'subject_prerequisite', 'age_limit', 'other'
  )),
  criteria_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE program_eligibility ENABLE ROW LEVEL SECURITY;

CREATE POLICY "institution_isolation" ON program_eligibility
  FOR ALL TO authenticated
  USING (
    program_id IN (
      SELECT id FROM programs
      WHERE institution_id = (SELECT auth.jwt()->>'institution_id')
    )
  );

-- ============================================
-- CATEGORY QUOTAS (Seat reservations)
-- ============================================
CREATE TABLE category_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('General', 'OBC', 'SC', 'ST', 'EWS')),
  seats_allocated INTEGER NOT NULL CHECK (seats_allocated >= 0),
  relaxation_percentage DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE category_quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "institution_isolation" ON category_quotas
  FOR ALL TO authenticated
  USING (
    program_id IN (
      SELECT id FROM programs
      WHERE institution_id = (SELECT auth.jwt()->>'institution_id')
    )
  );
