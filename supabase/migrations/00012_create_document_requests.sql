-- ============================================
-- Module 4: Document Requests
-- ============================================

CREATE TABLE IF NOT EXISTS document_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('transcript', 'bona_fide', 'transfer_cert', 'migration_cert', 'degree_cert', 'mark_sheet', 'other')),
  custom_type VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'processing', 'ready', 'issued', 'rejected')),
  remarks TEXT,
  processed_by UUID REFERENCES users(id),
  processed_at TIMESTAMPTZ,
  issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_doc_requests_institution ON document_requests(institution_id);
CREATE INDEX idx_doc_requests_student ON document_requests(student_id);
CREATE INDEX idx_doc_requests_status ON document_requests(institution_id, status);

ALTER TABLE document_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution isolation for document requests" ON document_requests
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID)
  WITH CHECK (institution_id = (auth.jwt() ->> 'institution_id')::UUID);

CREATE POLICY "Students can view their own document requests" ON document_requests
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

CREATE POLICY "Students can create document requests" ON document_requests
  FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

CREATE POLICY "Super admin cross-institution document requests" ON document_requests
  FOR ALL USING ((auth.jwt() ->> 'role') = 'super_admin');
