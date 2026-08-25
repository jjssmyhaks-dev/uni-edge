-- ============================================
-- USERS (Synced from Clerk via webhook)
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL UNIQUE,
  institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN (
    'super_admin',
    'institution_admin',
    'exam_committee',
    'faculty',
    'staff',
    'invigilator',
    'student',
    'applicant'
  )),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own record
CREATE POLICY "users_read_own" ON users
  FOR SELECT TO authenticated
  USING (clerk_user_id = (SELECT auth.jwt()->>'sub'));

-- Institution admins can manage users in their institution
CREATE POLICY "admin_manage_users" ON users
  FOR ALL TO authenticated
  USING (
    (SELECT auth.jwt()->>'role') IN ('institution_admin')
    AND institution_id = (SELECT auth.jwt()->>'institution_id')
  );

-- Super admin full access
CREATE POLICY "super_admin_access" ON users
  FOR ALL TO authenticated
  USING ((SELECT auth.jwt()->>'role') = 'super_admin');

CREATE INDEX idx_users_clerk_id ON users(clerk_user_id);
CREATE INDEX idx_users_institution ON users(institution_id);
CREATE INDEX idx_users_role ON users(role);

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
