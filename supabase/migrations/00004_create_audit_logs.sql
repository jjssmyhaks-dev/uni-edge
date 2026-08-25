-- ============================================
-- AUDIT LOGS
-- ============================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Institution admins can read audit logs for their institution
CREATE POLICY "admin_read_audit" ON audit_logs
  FOR SELECT TO authenticated
  USING (
    (SELECT auth.jwt()->>'role') IN ('institution_admin', 'exam_committee')
    AND institution_id = (SELECT auth.jwt()->>'institution_id')
  );

-- Super admin can read all audit logs
CREATE POLICY "super_admin_read_audit" ON audit_logs
  FOR SELECT TO authenticated
  USING ((SELECT auth.jwt()->>'role') = 'super_admin');

-- Insert policy: any authenticated user can insert (system writes)
CREATE POLICY "authenticated_insert_audit" ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE INDEX idx_audit_logs_institution ON audit_logs(institution_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
