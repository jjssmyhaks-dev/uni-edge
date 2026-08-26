-- ============================================
-- FEE CATEGORIES (Types of fees)
-- ============================================
CREATE TABLE fee_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE fee_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fee_categories_institution_access" ON fee_categories
  FOR ALL TO authenticated
  USING (institution_id = (SELECT auth.jwt()->>'institution_id'));

-- ============================================
-- FEE STRUCTURE (Fee amounts per program/cycle)
-- ============================================
CREATE TABLE fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  fee_category_id UUID NOT NULL REFERENCES fee_categories(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  admission_cycle_id UUID REFERENCES admission_cycles(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL,
  description TEXT,
  academic_year TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fee_structures_institution_access" ON fee_structures
  FOR ALL TO authenticated
  USING (institution_id = (SELECT auth.jwt()->>'institution_id'));

-- ============================================
-- INVOICES (Billed fees per student)
-- ============================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  fee_structure_id UUID NOT NULL REFERENCES fee_structures(id) ON DELETE RESTRICT,
  invoice_number TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'partial', 'overdue', 'cancelled', 'waived')),
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Students see their own invoices
CREATE POLICY "invoices_student_access" ON invoices
  FOR SELECT TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students WHERE clerk_user_id = (SELECT auth.jwt()->>'sub')
    )
  );

-- Admin full access within institution
CREATE POLICY "invoices_admin_access" ON invoices
  FOR ALL TO authenticated
  USING (
    institution_id = (SELECT auth.jwt()->>'institution_id')
    AND (SELECT auth.jwt()->>'role') IN ('institution_admin', 'staff', 'super_admin')
  );

CREATE INDEX idx_invoices_institution ON invoices(institution_id);
CREATE INDEX idx_invoices_student ON invoices(student_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- ============================================
-- PAYMENTS (Payment records per invoice)
-- ============================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('sbi_collect', 'online', 'cash', 'demand_draft', 'other')),
  receipt_url TEXT,
  receipt_file_url TEXT,
  sbi_collect_reference TEXT,
  sbi_collect_student_name TEXT,
  sbi_collect_institution_code TEXT,
  sbi_collect_payment_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Students see their own payments
CREATE POLICY "payments_student_access" ON payments
  FOR SELECT TO authenticated
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE student_id IN (
        SELECT id FROM students WHERE clerk_user_id = (SELECT auth.jwt()->>'sub')
      )
    )
  );

-- Students can insert their own payments
CREATE POLICY "payments_student_insert" ON payments
  FOR INSERT TO authenticated
  WITH CHECK (
    invoice_id IN (
      SELECT id FROM invoices WHERE student_id IN (
        SELECT id FROM students WHERE clerk_user_id = (SELECT auth.jwt()->>'sub')
      )
    )
  );

-- Admin full access
CREATE POLICY "payments_admin_access" ON payments
  FOR ALL TO authenticated
  USING (
    institution_id = (SELECT auth.jwt()->>'institution_id')
    AND (SELECT auth.jwt()->>'role') IN ('institution_admin', 'staff', 'super_admin')
  );

CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================
-- Triggers
-- ============================================
CREATE TRIGGER set_fee_categories_updated_at
  BEFORE UPDATE ON fee_categories FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_fee_structures_updated_at
  BEFORE UPDATE ON fee_structures FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_invoices_updated_at
  BEFORE UPDATE ON invoices FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_payments_updated_at
  BEFORE UPDATE ON payments FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
