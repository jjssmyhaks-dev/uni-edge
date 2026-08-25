import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { authMiddleware } from '../middleware/auth';
import { requireInstitutionAccess } from '../middleware/rbac';
import { AppError } from '../middleware/errorHandler';

const router = Router();
router.use(authMiddleware);

// GET /dashboard/stats — Aggregate stats for the admin dashboard
router.get('/', requireInstitutionAccess, async (req: Request, res: Response) => {
  const institutionId = req.user!.institution_id!;

  const [students, programs, applications, exams, notices] = await Promise.all([
    supabase
      .from('students')
      .select('id, enrollment_status, created_at')
      .eq('institution_id', institutionId),
    supabase
      .from('programs')
      .select('id, is_active')
      .eq('institution_id', institutionId),
    supabase
      .from('applications')
      .select('id, status, created_at')
      .eq('institution_id', institutionId),
    supabase
      .from('entrance_exams')
      .select('id, exam_date, name, status')
      .eq('institution_id', institutionId),
    supabase
      .from('notices')
      .select('id, created_at')
      .eq('institution_id', institutionId),
  ]);

  const allStudents = students.data || [];
  const allPrograms = programs.data || [];
  const allApplications = applications.data || [];
  const allExams = exams.data || [];
  const allNotices = notices.data || [];

  // Students this month
  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7); // YYYY-MM
  const studentsThisMonth = allStudents.filter(s => s.created_at?.startsWith(thisMonth)).length;

  // Upcoming exams (next 30 days)
  const thirtyDaysOut = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const upcomingExams = allExams.filter(e => {
    if (!e.exam_date) return false;
    const d = new Date(e.exam_date);
    return d >= now && d <= thirtyDaysOut;
  });

  // Enrollment trend (last 6 months)
  const trend: { month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    const label = d.toLocaleString('default', { month: 'short' });
    trend.push({
      month: label,
      count: allStudents.filter(s => s.created_at?.startsWith(key)).length,
    });
  }

  // Weekly attendance
  const { data: attendanceRows } = await supabase
    .from('attendance_records')
    .select('date, status')
    .eq('institution_id', institutionId)
    .gte('date', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));

  const attendanceByDay: Record<string, { total: number; present: number }> = {};
  (attendanceRows || []).forEach(r => {
    const day = r.date;
    if (!attendanceByDay[day]) attendanceByDay[day] = { total: 0, present: 0 };
    attendanceByDay[day].total++;
    if (r.status === 'present' || r.status === 'late') attendanceByDay[day].present++;
  });

  const attendanceTrend = Object.entries(attendanceByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([date, v]) => ({
      day: new Date(date).toLocaleString('default', { weekday: 'short' }),
      rate: v.total > 0 ? Math.round((v.present / v.total) * 100) : 0,
    }));

  const stats = {
    totalStudents: allStudents.length,
    activePrograms: allPrograms.filter(p => p.is_active).length,
    totalApplications: allApplications.length,
    pendingReview: allApplications.filter(a => a.status === 'submitted').length,
    upcomingExamCount: upcomingExams.length,
    upcomingExams: upcomingExams.map(e => ({
      name: e.name,
      date: e.exam_date,
      status: e.status,
    })),
    studentsThisMonth,
    enrollmentTrend: trend,
    attendanceTrend: attendanceTrend.length > 0 ? attendanceTrend : [
      { day: 'Mon', rate: 0 },
      { day: 'Tue', rate: 0 },
      { day: 'Wed', rate: 0 },
      { day: 'Thu', rate: 0 },
      { day: 'Fri', rate: 0 },
      { day: 'Sat', rate: 0 },
    ],
    recentNotices: allNotices
      .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
      .slice(0, 5)
      .map(n => ({ id: n.id, date: n.created_at })),
  };

  res.json({ data: stats, error: null });
});

export default router;
