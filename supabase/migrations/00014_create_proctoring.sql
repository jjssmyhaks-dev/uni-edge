-- ============================================
-- Module 6: Online Proctored Exam
-- ============================================

-- Proctoring Sessions
CREATE TABLE IF NOT EXISTS proctoring_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES entrance_exams(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES exam_candidates(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'completed', 'terminated')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  total_flag_count INTEGER NOT NULL DEFAULT 0,
  review_status VARCHAR(30) NOT NULL DEFAULT 'pending_review' CHECK (review_status IN ('pending_review', 'reviewed', 'cleared', 'violation_reported')),
  reviewer_id UUID REFERENCES users(id),
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(exam_id, candidate_id)
);

CREATE INDEX idx_proctoring_sessions_institution ON proctoring_sessions(institution_id);
CREATE INDEX idx_proctoring_sessions_exam ON proctoring_sessions(exam_id);
CREATE INDEX idx_proctoring_sessions_candidate ON proctoring_sessions(candidate_id);
CREATE INDEX idx_proctoring_sessions_status ON proctoring_sessions(institution_id, status);
CREATE INDEX idx_proctoring_sessions_review ON proctoring_sessions(institution_id, review_status);

-- Flagged Events
CREATE TABLE IF NOT EXISTS flagged_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES proctoring_sessions(id) ON DELETE CASCADE,
  flag_type VARCHAR(50) NOT NULL CHECK (flag_type IN ('tab_switch', 'multiple_faces', 'no_face', 'unusual_audio', 'copy_paste', 'right_click', 'fullscreen_exit', 'suspicious_movement', 'id_mismatch', 'other')),
  severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 10),
  description TEXT,
  screenshot_url TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  review_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'cleared', 'violation', 'dismissed')),
  reviewer_id UUID REFERENCES users(id),
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_flagged_events_institution ON flagged_events(institution_id);
CREATE INDEX idx_flagged_events_session ON flagged_events(session_id);
CREATE INDEX idx_flagged_events_review ON flagged_events(institution_id, review_status);
CREATE INDEX idx_flagged_events_type ON flagged_events(flag_type);

-- ============================================
-- RLS Policies for Module 6 tables
-- ============================================

ALTER TABLE proctoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flagged_events ENABLE ROW LEVEL SECURITY;

-- proctoring_sessions
CREATE POLICY "Institution isolation for proctoring sessions" ON proctoring_sessions
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID)
  WITH CHECK (institution_id = (auth.jwt() ->> 'institution_id')::UUID);

-- flagged_events
CREATE POLICY "Institution isolation for flagged events" ON flagged_events
  FOR ALL USING (institution_id = (auth.jwt() ->> 'institution_id')::UUID)
  WITH CHECK (institution_id = (auth.jwt() ->> 'institution_id')::UUID);

-- Super admin policies
CREATE POLICY "Super admin cross-institution proctoring sessions" ON proctoring_sessions
  FOR ALL USING ((auth.jwt() ->> 'role') = 'super_admin');

CREATE POLICY "Super admin cross-institution flagged events" ON flagged_events
  FOR ALL USING ((auth.jwt() ->> 'role') = 'super_admin');

-- Auto-update total_flag_count on proctoring_sessions
CREATE OR REPLACE FUNCTION update_proctoring_flag_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE proctoring_sessions
  SET total_flag_count = (
    SELECT COUNT(*) FROM flagged_events WHERE session_id = NEW.session_id
  ),
  updated_at = NOW()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_flag_count
  AFTER INSERT ON flagged_events
  FOR EACH ROW
  EXECUTE FUNCTION update_proctoring_flag_count();
