-- ============================================
-- APPLICATIONS
-- ============================================
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  cycle_id UUID NOT NULL REFERENCES admission_cycles(id) ON DELETE CASCADE,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT,
  applicant_phone TEXT,
  clerk_user_id TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'submitted', 'under_review', 'shortlisted',
    'offer_sent', 'confirmed', 'rejected', 'waitlisted'
  )),
  form_data JSONB DEFAULT '{}',
  merit_rank INTEGER,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "institution_isolation" ON applications
  FOR ALL TO authenticated
  USING (institution_id = (SELECT auth.jwt()->>'institution_id'));

-- Applicants can read their own applications
CREATE POLICY "applicants_read_own" ON applications
  FOR SELECT TO authenticated
  USING (
    clerk_user_id = (SELECT auth.jwt()->>'sub')
    OR applicant_email = (SELECT auth.jwt()->>'email')
  );

-- Applicants can create applications
CREATE POLICY "applicants_insert_own" ON applications
  FOR INSERT TO authenticated
  WITH CHECK (
    clerk_user_id = (SELECT auth.jwt()->>'sub')
  );

CREATE INDEX idx_applications_institution ON applications(institution_id);
CREATE INDEX idx_applications_cycle ON applications(cycle_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_clerk ON applications(clerk_user_id);

CREATE TRIGGER set_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DOCUMENTS
-- ============================================
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  student_id UUID,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'marksheet', 'id_proof', 'category_cert', 'photo', 'signature',
    'transfer_cert', 'migration_cert', 'payment_receipt'
  )),
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  parsed_data JSONB,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN (
    'pending', 'verified', 'rejected', 'resubmission_required'
  )),
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "institution_isolation" ON documents
  FOR ALL TO authenticated
  USING (institution_id = (SELECT auth.jwt()->>'institution_id'));

-- Applicants can read their own documents
CREATE POLICY "applicants_read_own_docs" ON documents
  FOR SELECT TO authenticated
  USING (
    application_id IN (
      SELECT id FROM applications
      WHERE clerk_user_id = (SELECT auth.jwt()->>'sub')
    )
  );

CREATE INDEX idx_documents_application ON documents(application_id);
CREATE INDEX idx_documents_student ON documents(student_id);
CREATE INDEX idx_documents_type ON documents(document_type);
