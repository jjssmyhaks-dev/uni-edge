-- ============================================
-- STUDENTS
-- ============================================
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  enrollment_number TEXT UNIQUE,
  enrollment_status TEXT DEFAULT 'active' CHECK (enrollment_status IN (
    'active', 'inactive', 'graduated', 'withdrawn', 'expelled'
  )),
  batch_year TEXT,
  admission_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "institution_isolation" ON students
  FOR ALL TO authenticated
  USING (institution_id = (SELECT auth.jwt()->>'institution_id'));

-- Students can read their own record
CREATE POLICY "students_read_own" ON students
  FOR SELECT TO authenticated
  USING (user_id IN (
    SELECT id FROM users WHERE clerk_user_id = (SELECT auth.jwt()->>'sub')
  ));

CREATE INDEX idx_students_institution ON students(institution_id);
CREATE INDEX idx_students_program ON students(program_id);
CREATE INDEX idx_students_user ON students(user_id);
CREATE INDEX idx_students_enrollment ON students(enrollment_number);

CREATE TRIGGER set_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- NOTICES
-- ============================================
CREATE TABLE notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_audience TEXT CHECK (target_audience IN (
    'all', 'students', 'faculty', 'department', 'batch'
  )),
  target_department_id UUID REFERENCES departments(id),
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "institution_isolation" ON notices
  FOR ALL TO authenticated
  USING (institution_id = (SELECT auth.jwt()->>'institution_id'));

-- Everyone in the institution can read published notices
CREATE POLICY "members_read_published" ON notices
  FOR SELECT TO authenticated
  USING (
    published = true
    AND institution_id = (SELECT auth.jwt()->>'institution_id')
  );

CREATE INDEX idx_notices_institution ON notices(institution_id);

-- ============================================
-- SYNC QUEUE (Module 7 - Offline)
-- ============================================
CREATE TABLE sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  operation TEXT NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
  payload JSONB NOT NULL,
  client_timestamp TIMESTAMPTZ NOT NULL,
  server_timestamp TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'synced', 'conflict', 'failed'
  )),
  conflict_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;

-- Users can manage their own sync queue
CREATE POLICY "users_own_sync" ON sync_queue
  FOR ALL TO authenticated
  USING (user_id IN (
    SELECT id FROM users WHERE clerk_user_id = (SELECT auth.jwt()->>'sub')
  ));
