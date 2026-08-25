-- Supabase Storage Buckets and RLS Policies
-- Run this in the Supabase SQL Editor

-- ============================================================
-- 1. Create Storage Buckets
-- ============================================================

-- Documents bucket (marksheets, ID proofs, category certificates, photos, signatures)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Hall tickets bucket (generated PDFs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hall-tickets',
  'hall-tickets',
  false,
  5242880, -- 5MB limit
  ARRAY['application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Marksheets bucket (scanned marksheets for parsing)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'marksheets',
  'marksheets',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Offer letters bucket (generated PDFs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'offer-letters',
  'offer-letters',
  false,
  5242880,
  ARRAY['application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Public assets bucket (logos, banners — institution branding)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'public-assets',
  'public-assets',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. RLS Policies for Storage
-- ============================================================

-- Helper: get current user's institution_id from public.users
CREATE OR REPLACE FUNCTION storage.get_user_institution_id()
RETURNS UUID AS $$
  SELECT institution_id FROM public.users WHERE clerk_user_id = auth.uid()::text LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if user has a specific role
CREATE OR REPLACE FUNCTION storage.user_has_role(allowed_roles TEXT[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE clerk_user_id = auth.uid()::text
    AND role = ANY(allowed_roles)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- documents bucket policies
-- ============================================================

-- Students/applicants can upload their own documents
CREATE POLICY "Students can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (
    -- Path: {institution_id}/{user_id}/...
    (storage.foldername(name))[1] = storage.get_user_institution_id()::text
    AND (storage.foldername(name))[2] = auth.uid()::text
  )
);

-- Students/applicants can read their own documents
CREATE POLICY "Students can read own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND (
    (storage.foldername(name))[1] = storage.get_user_institution_id()::text
    AND (storage.foldername(name))[2] = auth.uid()::text
  )
);

-- Admin/staff can read all documents in their institution
CREATE POLICY "Admin can read institution documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = storage.get_user_institution_id()::text
  AND storage.user_has_role(ARRAY['institution_admin', 'faculty_staff', 'exam_committee'])
);

-- Admin can delete documents in their institution
CREATE POLICY "Admin can delete institution documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = storage.get_user_institution_id()::text
  AND storage.user_has_role(ARRAY['institution_admin'])
);

-- ============================================================
-- hall-tickets bucket policies
-- ============================================================

-- Students can read their own hall tickets
CREATE POLICY "Students can read own hall tickets"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'hall-tickets'
  AND (storage.foldername(name))[1] = storage.get_user_institution_id()::text
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Admin/exam committee can upload hall tickets
CREATE POLICY "Exam committee can upload hall tickets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'hall-tickets'
  AND (storage.foldername(name))[1] = storage.get_user_institution_id()::text
  AND storage.user_has_role(ARRAY['institution_admin', 'exam_committee'])
);

-- ============================================================
-- marksheets bucket policies
-- ============================================================

-- Students can upload their own marksheets
CREATE POLICY "Students can upload own marksheets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'marksheets'
  AND (storage.foldername(name))[1] = storage.get_user_institution_id()::text
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Students can read their own marksheets
CREATE POLICY "Students can read own marksheets"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'marksheets'
  AND (storage.foldername(name))[1] = storage.get_user_institution_id()::text
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Admin can read all marksheets in their institution
CREATE POLICY "Admin can read institution marksheets"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'marksheets'
  AND (storage.foldername(name))[1] = storage.get_user_institution_id()::text
  AND storage.user_has_role(ARRAY['institution_admin', 'faculty_staff'])
);

-- ============================================================
-- offer-letters bucket policies
-- ============================================================

-- Students can read their own offer letters
CREATE POLICY "Students can read own offer letters"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'offer-letters'
  AND (storage.foldername(name))[1] = storage.get_user_institution_id()::text
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Admin can upload offer letters
CREATE POLICY "Admin can upload offer letters"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'offer-letters'
  AND (storage.foldername(name))[1] = storage.get_user_institution_id()::text
  AND storage.user_has_role(ARRAY['institution_admin', 'faculty_staff'])
);

-- ============================================================
-- public-assets bucket policies (public bucket — anyone can read)
-- ============================================================

-- Institution admin can upload their branding assets
CREATE POLICY "Admin can upload public assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'public-assets'
  AND storage.user_has_role(ARRAY['institution_admin', 'super_admin'])
);

-- Admin can update their branding assets
CREATE POLICY "Admin can update public assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'public-assets'
  AND storage.user_has_role(ARRAY['institution_admin', 'super_admin'])
);

-- Admin can delete their branding assets
CREATE POLICY "Admin can delete public assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'public-assets'
  AND storage.user_has_role(ARRAY['institution_admin', 'super_admin'])
);
