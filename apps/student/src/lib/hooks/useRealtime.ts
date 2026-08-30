'use client';

import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a lightweight Supabase client for realtime only
let supabaseRealtime: ReturnType<typeof createClient> | null = null;

function getSupabaseRealtime() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (!supabaseRealtime) {
    supabaseRealtime = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: { params: { eventsPerSecond: 2 } },
    });
  }
  return supabaseRealtime;
}

// ============================================
// Grade Updates Subscription
// ============================================

export function useRealtimeGrades(studentId: string | null) {
  const queryClient = useQueryClient();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (!studentId) return;
    const client = getSupabaseRealtime();
    if (!client) return;

    const channel = client
      .channel(`grades-${studentId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_grades', filter: `student_id=eq.${studentId}` },
        (payload) => {
          setLastUpdate(new Date());
          queryClient.invalidateQueries({ queryKey: ['student-grades'] });
          queryClient.invalidateQueries({ queryKey: ['student-courses'] });
        }
      )
      .subscribe();

    return () => { client.removeChannel(channel); };
  }, [studentId, queryClient]);

  return { lastUpdate };
}

// ============================================
// Notifications Subscription
// ============================================

export function useRealtimeNotifications(studentId: string | null) {
  const queryClient = useQueryClient();
  const [newNotification, setNewNotification] = useState<any>(null);

  useEffect(() => {
    if (!studentId) return;
    const client = getSupabaseRealtime();
    if (!client) return;

    const channel = client
      .channel(`notifications-${studentId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'student_notifications', filter: `student_id=eq.${studentId}` },
        (payload) => {
          setNewNotification(payload.new);
          queryClient.invalidateQueries({ queryKey: ['student-notifications'] });

          // Show browser notification if permitted
          if ('Notification' in window && Notification.permission === 'granted') {
            const n = payload.new as any;
            new Notification(n.title || 'Uni-Edge', { body: n.message, icon: '/favicon.ico' });
          }
        }
      )
      .subscribe();

    return () => { client.removeChannel(channel); };
  }, [studentId, queryClient]);

  return { newNotification };
}

// ============================================
// Exam Status Subscription
// ============================================

export function useRealtimeExams(studentId: string | null) {
  const queryClient = useQueryClient();
  const [examUpdate, setExamUpdate] = useState<any>(null);

  useEffect(() => {
    if (!studentId) return;
    const client = getSupabaseRealtime();
    if (!client) return;

    // Subscribe to exam_submissions changes for this student
    const channel = client
      .channel(`exams-${studentId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'exam_submissions', filter: `student_id=eq.${studentId}` },
        (payload) => {
          setExamUpdate(payload.new);
          queryClient.invalidateQueries({ queryKey: ['student-exams'] });
        }
      )
      .subscribe();

    return () => { client.removeChannel(channel); };
  }, [studentId, queryClient]);

  return { examUpdate };
}

// ============================================
// Enrollment Changes Subscription
// ============================================

export function useRealtimeEnrollments(studentId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!studentId) return;
    const client = getSupabaseRealtime();
    if (!client) return;

    const channel = client
      .channel(`enrollments-${studentId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'enrollments', filter: `student_id=eq.${studentId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['student-courses'] });
          queryClient.invalidateQueries({ queryKey: ['student-registration'] });
        }
      )
      .subscribe();

    return () => { client.removeChannel(channel); };
  }, [studentId, queryClient]);
}

// ============================================
// Grievance Updates Subscription
// ============================================

export function useRealtimeGrievances(studentId: string | null) {
  const queryClient = useQueryClient();
  const [newReply, setNewReply] = useState<any>(null);

  useEffect(() => {
    if (!studentId) return;
    const client = getSupabaseRealtime();
    if (!client) return;

    const channel = client
      .channel(`grievances-${studentId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'grievance_replies' },
        (payload) => {
          setNewReply(payload.new);
          queryClient.invalidateQueries({ queryKey: ['student-grievances'] });
        }
      )
      .subscribe();

    return () => { client.removeChannel(channel); };
  }, [studentId, queryClient]);

  return { newReply };
}

// ============================================
// Attendance Updates Subscription
// ============================================

export function useRealtimeAttendance(studentId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!studentId) return;
    const client = getSupabaseRealtime();
    if (!client) return;

    const channel = client
      .channel(`attendance-${studentId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'attendance_records', filter: `student_id=eq.${studentId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['student-attendance'] });
        }
      )
      .subscribe();

    return () => { client.removeChannel(channel); };
  }, [studentId, queryClient]);
}

// ============================================
// Combined Dashboard Realtime Hook
// ============================================

export function useDashboardRealtime(studentId: string | null) {
  const grades = useRealtimeGrades(studentId);
  const notifications = useRealtimeNotifications(studentId);
  const exams = useRealtimeExams(studentId);
  const enrollments = useRealtimeEnrollments(studentId);
  const grievances = useRealtimeGrievances(studentId);
  const attendance = useRealtimeAttendance(studentId);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (notifications.newNotification) {
      const n = notifications.newNotification as any;
      setToastMessage(`${n.title}: ${n.message}`);
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications.newNotification]);

  return {
    grades,
    notifications,
    exams,
    enrollments,
    grievances,
    attendance,
    toastMessage,
  };
}

// ============================================
// Request Browser Notification Permission
// ============================================

export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied' as NotificationPermission;
  }, []);

  return { permission, requestPermission };
}
