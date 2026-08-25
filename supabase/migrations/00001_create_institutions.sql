-- ============================================
-- INSTITUTIONS (Tenant root)
-- ============================================
CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_name TEXT,
  type TEXT NOT NULL CHECK (type IN ('government', 'private', 'deemed')),
  address TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;

-- Super admin can see all institutions
CREATE POLICY "super_admin_all_access" ON institutions
  FOR ALL TO authenticated
  USING ((SELECT auth.jwt()->>'role') = 'super_admin');

-- Institution members can read their own institution
CREATE POLICY "institution_members_read" ON institutions
  FOR SELECT TO authenticated
  USING (id = (SELECT auth.jwt()->>'institution_id'));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_institutions_updated_at
  BEFORE UPDATE ON institutions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
