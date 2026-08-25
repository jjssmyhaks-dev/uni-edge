-- ============================================
-- Uni-Edge Development Seed Data
-- ============================================
-- Run with: supabase db seed
-- This populates the database with realistic sample data for all modules.

-- ============================================
-- Institutions
-- ============================================
INSERT INTO institutions (id, name, short_name, type, address) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Delhi Technical University', 'DTU', 'government', 'Bawana Road, Delhi 110042'),
  ('a1000000-0000-0000-0000-000000000002', 'Mumbai University', 'MU', 'government', 'M.G. Road, Fort, Mumbai 400032'),
  ('a1000000-0000-0000-0000-000000000003', 'Bangalore Institute of Technology', 'BIT', 'private', 'K.R. Road, V.V. Puram, Bangalore 560004')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Departments
-- ============================================
INSERT INTO departments (id, institution_id, name, code) VALUES
  -- DTU
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Computer Science & Engineering', 'CSE'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Electronics & Communication', 'ECE'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Mechanical Engineering', 'ME'),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Civil Engineering', 'CE'),
  -- MU
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'Science', 'SCI'),
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 'Commerce', 'COM'),
  -- BIT
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000003', 'Information Technology', 'IT')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Programs
-- ============================================
INSERT INTO programs (id, institution_id, department_id, name, code, degree_level, duration_years, total_seats) VALUES
  -- DTU
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'B.Tech Computer Science', 'CSE-BTech', 'undergraduate', 4, 180),
  ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'B.Tech Electronics', 'ECE-BTech', 'undergraduate', 4, 120),
  ('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'M.Tech Computer Science', 'CSE-MTech', 'postgraduate', 2, 60),
  ('c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'B.Tech Mechanical', 'ME-BTech', 'undergraduate', 4, 100),
  -- MU
  ('c1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000005', 'B.Sc Computer Science', 'CS-BSc', 'undergraduate', 3, 200),
  ('c1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000006', 'B.Com', 'COM-BCom', 'undergraduate', 3, 250),
  -- BIT
  ('c1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000007', 'B.Tech Information Technology', 'IT-BTech', 'undergraduate', 4, 120)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Program Eligibility Criteria
-- ============================================
INSERT INTO program_eligibility (program_id, criteria, category_relaxations) VALUES
  ('c1000000-0000-0000-0000-000000000001', '{"min_percentage": 75, "subjects": ["physics", "chemistry", "mathematics"], "max_age": 25}', '{"SC": 10, "ST": 10, "OBC": 5, "EWS": 5}'),
  ('c1000000-0000-0000-0000-000000000002', '{"min_percentage": 70, "subjects": ["physics", "chemistry", "mathematics"], "max_age": 25}', '{"SC": 10, "ST": 10, "OBC": 5}'),
  ('c1000000-0000-0000-0000-000000000003', '{"min_percentage": 60, "field": "computer_science"}', '{"SC": 5, "ST": 5}')
ON CONFLICT (program_id) DO NOTHING;

-- ============================================
-- Category Quotas (seat reservations per program)
-- ============================================
INSERT INTO category_quotas (program_id, category, seats) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'General', 63),
  ('c1000000-0000-0000-0000-000000000001', 'OBC', 49),
  ('c1000000-0000-0000-0000-000000000001', 'SC', 27),
  ('c1000000-0000-0000-0000-000000000001', 'ST', 14),
  ('c1000000-0000-0000-0000-000000000001', 'EWS', 27),
  ('c1000000-0000-0000-0000-000000000002', 'General', 42),
  ('c1000000-0000-0000-0000-000000000002', 'OBC', 33),
  ('c1000000-0000-0000-0000-000000000002', 'SC', 18),
  ('c1000000-0000-0000-0000-000000000002', 'ST', 9),
  ('c1000000-0000-0000-0000-000000000002', 'EWS', 18)
ON CONFLICT DO NOTHING;

-- ============================================
-- Admission Cycles
-- ============================================
INSERT INTO admission_cycles (id, institution_id, program_id, academic_year, status, application_start_date, application_end_date) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', '2025-26', 'active', '2025-04-01', '2025-06-30'),
  ('d1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', '2025-26', 'active', '2025-04-01', '2025-06-30'),
  ('d1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000005', '2025-26', 'active', '2025-05-01', '2025-07-15')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Entrance Exams
-- ============================================
INSERT INTO entrance_exams (id, institution_id, cycle_id, name, description, exam_date, exam_time, duration_minutes, mode, total_marks, passing_marks, status) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'DTU CSE Entrance 2025', 'Entrance exam for B.Tech CSE admission', '2025-07-15', '10:00:00', 180, 'offline', 300, 120, 'under_review'),
  ('e1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', 'DTU ECE Entrance 2025', 'Entrance exam for B.Tech ECE admission', '2025-07-16', '10:00:00', 180, 'online', 300, 100, 'draft')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Exam Centers
-- ============================================
INSERT INTO exam_centers (exam_id, name, location, capacity) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'DTU Main Hall', 'DTU Campus, Block A', 200),
  ('e1000000-0000-0000-0000-000000000001', 'DTU Seminar Hall', 'DTU Campus, Block B', 150),
  ('e1000000-0000-0000-0000-000000000002', 'Online Center', 'Virtual (browser-based)', 500)
ON CONFLICT DO NOTHING;

-- ============================================
-- Exam Candidates
-- ============================================
INSERT INTO exam_candidates (id, institution_id, exam_id, candidate_name, candidate_email, candidate_phone, registration_number, registration_status) VALUES
  ('f1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'Priya Sharma', 'priya.sharma@email.com', '+919876543210', 'DTU2025001', 'confirmed'),
  ('f1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'Rahul Kumar', 'rahul.kumar@email.com', '+919876543211', 'DTU2025002', 'confirmed'),
  ('f1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'Anjali Patel', 'anjali.patel@email.com', '+919876543212', 'DTU2025003', 'confirmed'),
  ('f1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'Vikram Singh', 'vikram.singh@email.com', '+919876543213', 'DTU2025004', 'pending'),
  ('f1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'Meera Reddy', 'meera.reddy@email.com', '+919876543214', 'DTU2025005', 'confirmed')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Exam Results
-- ============================================
INSERT INTO exam_results (id, institution_id, exam_id, candidate_id, score, category, merit_rank, is_published) VALUES
  ('g1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 267, 'General', 1, false),
  ('g1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000003', 245, 'OBC', 2, false),
  ('g1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000002', 223, 'SC', 3, false),
  ('g1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000005', 198, 'General', 4, false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Students (enrolled)
-- ============================================
INSERT INTO students (id, institution_id, program_id, enrollment_number, enrollment_status, batch_year, admission_date) VALUES
  ('s1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'DTU-CSE-2024-001', 'active', '2024', '2024-08-01'),
  ('s1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'DTU-CSE-2024-002', 'active', '2024', '2024-08-01'),
  ('s1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'DTU-ECE-2024-001', 'active', '2024', '2024-08-01'),
  ('s1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000005', 'MU-CS-2024-001', 'active', '2024', '2024-07-15'),
  ('s1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000007', 'BIT-IT-2024-001', 'active', '2024', '2024-08-01')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Module 5: Regular Exams (seed data)
-- ============================================
INSERT INTO regular_exams (id, institution_id, program_id, name, course_code, term, academic_year, exam_date, exam_time, duration_minutes, total_marks, passing_marks, status) VALUES
  ('r1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'CSE Sem 3 End-Term', 'CS301', 'end_semester', '2025-26', '2025-12-10', '09:00:00', 180, 100, 40, 'draft'),
  ('r1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'CSE Sem 3 Mid-Term', 'CS302', 'mid_semester', '2025-26', '2025-10-15', '10:00:00', 90, 50, 20, 'scheduled')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Module 5: Exam Rooms
-- ============================================
INSERT INTO exam_rooms (id, institution_id, exam_id, room_name, room_number, building, capacity, floor, allocation_status) VALUES
  ('rm1000000-0000-0000-0000-00000000001', 'a1000000-0000-0000-0000-000000000001', 'r1000000-0000-0000-0000-000000000001', 'Room 101', '101', 'Block A', 60, 1, 'allocated'),
  ('rm1000000-0000-0000-0000-00000000002', 'a1000000-0000-0000-0000-000000000001', 'r1000000-0000-0000-0000-000000000001', 'Room 102', '102', 'Block A', 60, 1, 'allocated'),
  ('rm1000000-0000-0000-0000-00000000003', 'a1000000-0000-0000-0000-000000000001', 'r1000000-0000-0000-0000-000000000001', 'Lecture Hall A', 'LHA', 'Main Building', 120, 0, 'pending')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Module 5: Hall Tickets
-- ============================================
INSERT INTO hall_tickets (id, institution_id, exam_id, student_id, ticket_number, room_id, seat_number, issued) VALUES
  ('ht1000000-0000-0000-0000-00000000001', 'a1000000-0000-0000-0000-000000000001', 'r1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', 'CSES3-00001', 'rm1000000-0000-0000-0000-00000000001', 1, true),
  ('ht1000000-0000-0000-0000-00000000002', 'a1000000-0000-0000-0000-000000000001', 'r1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000002', 'CSES3-00002', 'rm1000000-0000-0000-0000-00000000002', 15, false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Module 5: Regular Exam Results (sample)
-- ============================================
INSERT INTO regular_exam_results (id, institution_id, exam_id, student_id, marks_obtained, grade, grade_points, is_published, entered_by) VALUES
  ('rr1000000-0000-0000-0000-0000000001', 'a1000000-0000-0000-0000-000000000001', 'r1000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000001', 42, 'A', 8.5, true, NULL),
  ('rr1000000-0000-0000-0000-0000000002', 'a1000000-0000-0000-0000-000000000001', 'r1000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000002', 35, 'B+', 7.5, true, NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Module 4: Attendance Records (sample)
-- ============================================
INSERT INTO attendance_records (institution_id, student_id, program_id, course_code, date, status, remarks) VALUES
  ('a1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'CS301', '2025-08-20', 'present', NULL),
  ('a1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'CS301', '2025-08-21', 'present', NULL),
  ('a1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'CS301', '2025-08-22', 'absent', 'Medical leave'),
  ('a1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'CS301', '2025-08-20', 'present', NULL),
  ('a1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'CS301', '2025-08-21', 'late', 'Arrived 15 min late'),
  ('a1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'CS301', '2025-08-22', 'present', NULL),
  ('a1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', 'EC201', '2025-08-20', 'present', NULL),
  ('a1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', 'EC201', '2025-08-21', 'excused', 'Official college event')
ON CONFLICT DO NOTHING;

-- ============================================
-- Module 4: Notices (sample)
-- ============================================
INSERT INTO notices (institution_id, title, content, target_audience, published, published_at) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Mid-Semester Exam Schedule Released', 'The mid-semester examination schedule for Odd Semester 2025 has been published. Please check the exam portal for your individual timetable.', 'all', true, '2025-08-20T10:00:00Z'),
  ('a1000000-0000-0000-0000-000000000001', 'Library Hours Extended During Exams', 'The central library will remain open until 10 PM during the examination period (Oct 10 - Oct 25).', 'students', true, '2025-08-19T14:00:00Z'),
  ('a1000000-0000-0000-0000-000000000001', 'Faculty Meeting — Exam Preparation', 'All faculty members are requested to attend a meeting regarding exam preparation and room allocation.', 'faculty', false, NULL)
ON CONFLICT DO NOTHING;

-- ============================================
-- Module 4: Document Requests (sample)
-- ============================================
INSERT INTO document_requests (institution_id, student_id, request_type, status, remarks) VALUES
  ('a1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', 'transcript', 'requested', 'Need for higher studies application'),
  ('a1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000002', 'bona_fide', 'processing', NULL)
ON CONFLICT DO NOTHING;

-- ============================================
-- Applications (sample)
-- ============================================
INSERT INTO applications (id, institution_id, cycle_id, applicant_name, applicant_email, applicant_phone, status, form_data, submitted_at) VALUES
  ('app100000-0000-0000-0000-00000000001', 'a1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Aarav Mehta', 'aarav@email.com', '+919800000001', 'submitted', '{"10th_marks": 92, "12th_marks": 88, "category": "General"}', '2025-06-01T10:00:00Z'),
  ('app100000-0000-0000-0000-00000000002', 'a1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Sneha Gupta', 'sneha@email.com', '+919800000002', 'shortlisted', '{"10th_marks": 89, "12th_marks": 91, "category": "OBC"}', '2025-06-02T11:30:00Z'),
  ('app100000-0000-0000-0000-00000000003', 'a1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Karan Bose', 'karan@email.com', '+919800000003', 'under_review', '{"10th_marks": 78, "12th_marks": 82, "category": "SC"}', '2025-06-03T09:00:00Z'),
  ('app100000-0000-0000-0000-00000000004', 'a1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000003', 'Nisha Verma', 'nisha@email.com', '+919800000004', 'submitted', '{"10th_marks": 85, "12th_marks": 80}', '2025-06-05T14:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Audit Logs (sample)
-- ============================================
INSERT INTO audit_logs (institution_id, action, entity_type, entity_id, new_value) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'entrance_exam_created', 'entrance_exam', 'e1000000-0000-0000-0000-000000000001', '{"name": "DTU CSE Entrance 2025"}'),
  ('a1000000-0000-0000-0000-000000000001', 'application_submitted', 'application', 'app100000-0000-0000-0000-00000000001', '{"applicant_name": "Aarav Mehta"}'),
  ('a1000000-0000-0000-0000-000000000001', 'application_status_changed', 'application', 'app100000-0000-0000-0000-00000000002', '{"old_status": "submitted", "new_status": "shortlisted"}'),
  ('a1000000-0000-0000-0000-000000000001', 'regular_exam_created', 'regular_exam', 'r1000000-0000-0000-0000-000000000001', '{"name": "CSE Sem 3 End-Term"}')
ON CONFLICT DO NOTHING;
