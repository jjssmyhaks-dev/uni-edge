'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Camera, CameraOff, Clock, AlertTriangle, Shield,
  ChevronLeft, ChevronRight, Send, Lock, Flag, CheckCircle,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

// ============================================
// Types
// ============================================

interface Question {
  id: string;
  question_text: string;
  question_type: 'mcq' | 'true_false' | 'short_answer' | 'long_answer';
  options?: string[];
  marks: number;
  question_order: number;
}

interface ExamInfo {
  name: string;
  duration_minutes: number;
  total_marks_computed: number;
  question_count: number;
}

interface Submission {
  id: string;
  exam_id: string;
  status: string;
  started_at: string;
  time_limit_minutes: number;
  answers: Record<string, string>;
  questions: Question[];
  entrance_exams: ExamInfo;
}

// ============================================
// Browser Lockdown Hook
// ============================================

function useBrowserLockdown(isActive: boolean, onViolation: (type: string) => void) {
  useEffect(() => {
    if (!isActive) return;

    const handlers: Array<[string, EventListenerOrEventListenerObject, EventTarget]> = [];

    const handleVisibilityChange = () => { if (document.hidden) onViolation('tab_switch'); };
    const handleBlur = () => onViolation('window_blur');
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a', 'u', 's', 'p', 'j'].includes(e.key.toLowerCase()) ||
        e.key === 'F12' || (e.altKey && e.key === 'Tab')
      ) { e.preventDefault(); onViolation('blocked_shortcut'); }
    };
    const handleContextMenu = (e: MouseEvent) => { e.preventDefault(); onViolation('right_click'); };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isActive, onViolation]);
}

// ============================================
// Webcam Component
// ============================================

function WebcamFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240, facingMode: 'user' }, audio: false });
        if (videoRef.current) { videoRef.current.srcObject = stream; setIsActive(true); }
      } catch { setError('Camera access denied'); }
    };
    startCamera();
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-lg border bg-black">
      <video ref={videoRef} autoPlay muted playsInline className="h-[120px] w-[160px] object-cover" style={{ transform: 'scaleX(-1)' }} />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-950/80">
          <div className="text-center text-red-400"><CameraOff className="mx-auto mb-1 h-6 w-6" /><p className="text-[10px]">{error}</p></div>
        </div>
      )}
      <div className="absolute bottom-1 left-1 flex items-center gap-1">
        <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
        <span className="text-[9px] text-white drop-shadow">{isActive ? 'REC' : 'OFF'}</span>
      </div>
    </div>
  );
}

// ============================================
// Timer
// ============================================

function ExamTimer({ totalMinutes, onTimeUp }: { totalMinutes: number; onTimeUp: () => void }) {
  const [remaining, setRemaining] = useState(totalMinutes * 60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setRemaining(prev => { if (prev <= 1) { clearInterval(timerRef.current!); onTimeUp(); return 0; } return prev - 1; });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [onTimeUp]);

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const isCritical = remaining < 60;
  const isUrgent = remaining < 300 && !isCritical;

  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 ${isCritical ? 'border-red-500 bg-red-50 dark:bg-red-950' : isUrgent ? 'border-amber-500 bg-amber-50 dark:bg-amber-950' : ''}`}>
      <Clock className={`h-4 w-4 ${isCritical ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-muted-foreground'}`} />
      <span className={`font-mono text-lg font-bold ${isCritical ? 'text-red-600' : isUrgent ? 'text-amber-600' : ''}`}>
        {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
      </span>
      {isCritical && <span className="text-[10px] font-medium text-red-600 animate-pulse">SUBMITTING SOON</span>}
    </div>
  );
}

// ============================================
// Main Page
// ============================================

export default function ExamTakePage() {
  const searchParams = useSearchParams();
  const examId = searchParams.get('examId');
  const router = useRouter();
  const { user } = useUser();

  const [phase, setPhase] = useState<'instructions' | 'identity' | 'loading' | 'exam' | 'submitting' | 'submitted'>('instructions');
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [violations, setViolations] = useState<Array<{ type: string; timestamp: string }>>([]);
  const [flagWarning, setFlagWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<{ total: number; obtained: number; pct: number } | null>(null);
  const flagTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleViolation = useCallback((type: string) => {
    setViolations(prev => [...prev, { type, timestamp: new Date().toISOString() }]);
    const msgs: Record<string, string> = {
      tab_switch: '⚠️ Tab switch detected! This has been recorded.',
      window_blur: '⚠️ Window focus lost!',
      blocked_shortcut: '⚠️ Keyboard shortcut blocked.',
      right_click: '⚠️ Right-click disabled during exam.',
    };
    setFlagWarning(msgs[type] || '⚠️ Suspicious activity detected.');
    if (flagTimeoutRef.current) clearTimeout(flagTimeoutRef.current);
    flagTimeoutRef.current = setTimeout(() => setFlagWarning(null), 4000);

    // Report flag
    if (submission?.id) {
      fetch(`${API_BASE}/api/v1/proctoring/flags`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: submission.id, flag_type: type, severity: type === 'tab_switch' ? 7 : 4, description: `Auto: ${type}` }),
      }).catch(() => {});
    }
  }, [submission?.id]);

  useBrowserLockdown(phase === 'exam', handleViolation);

  // Start exam
  const startExam = async () => {
    if (!examId) { setError('No exam ID provided'); return; }
    setPhase('loading');
    try {
      const res = await apiClient.post<{ data: Submission }>('/api/v1/exam-submissions/start', { exam_id: examId });
      const sub = res.data;
      setSubmission(sub);
      setAnswers(sub.answers || {});
      setPhase('exam');
    } catch (e: any) {
      setError(e.message || 'Failed to start exam');
      setPhase('instructions');
    }
  };

  // Auto-save answers every 30s
  useEffect(() => {
    if (phase !== 'exam' || !submission) return;
    saveTimerRef.current = setInterval(() => {
      Object.entries(answers).forEach(([qId, ans]) => {
        apiClient.post(`/api/v1/exam-submissions/${submission.id}/answer`, { question_id: qId, answer: ans }).catch(() => {});
      });
    }, 30000);
    return () => { if (saveTimerRef.current) clearInterval(saveTimerRef.current); };
  }, [phase, submission, answers]);

  // Save single answer
  const saveAnswer = async (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    if (submission) {
      apiClient.post(`/api/v1/exam-submissions/${submission.id}/answer`, { question_id: questionId, answer: value }).catch(() => {});
    }
  };

  // Submit exam
  const handleSubmit = async () => {
    if (!submission) return;
    setPhase('submitting');
    try {
      const res = await apiClient.post<{ data: any }>(`/api/v1/exam-submissions/${submission.id}/submit`);
      setScore(res.data);
      setPhase('submitted');
    } catch (e: any) {
      setError(e.message);
      setPhase('exam');
    }
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) { await document.documentElement.requestFullscreen(); }
  };

  const exam = submission?.entrance_exams;
  const questions = submission?.questions || [];
  const question = questions[currentQ];
  const answeredCount = Object.keys(answers).length;

  // ============================================
  // ERROR
  // ============================================
  if (error && phase !== 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================
  // INSTRUCTIONS
  // ============================================
  if (phase === 'instructions') {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <Card>
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"><Shield className="h-6 w-6 text-primary" /></div>
                <div>
                  <h1 className="text-xl font-bold">Online Proctored Examination</h1>
                  <p className="text-sm text-muted-foreground">Read instructions carefully before starting</p>
                </div>
              </div>

              <div className="rounded-lg border border-amber-500/30 bg-amber-50 dark:bg-amber-950 p-4 mb-6">
                <div className="flex items-start gap-2">
                  <Lock className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-amber-700 dark:text-amber-400">Browser Lockdown Active</p>
                    <p className="text-amber-600 dark:text-amber-500 mt-1">Tab switching, copy/paste, right-click, and keyboard shortcuts will be blocked. All activity is logged.</p>
                  </div>
                </div>
              </div>

              <ol className="space-y-2 mb-6">
                {[
                  'This exam is proctored via webcam and browser monitoring.',
                  'Do not switch tabs or windows during the exam.',
                  'Keep your face visible in the webcam at all times.',
                  'Do not use any external devices or materials.',
                  'Your answers are auto-saved. Submit when done or timer expires.',
                  'Any suspicious activity will be flagged for review.',
                ].map((inst, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="font-mono text-xs text-primary mt-0.5">{i + 1}.</span>{inst}
                  </li>
                ))}
              </ol>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => router.back()}>Exit</Button>
                <Button className="flex-1" onClick={() => setPhase('identity')}>
                  <Camera className="mr-2 h-4 w-4" />Verify Identity & Start
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ============================================
  // IDENTITY VERIFICATION
  // ============================================
  if (phase === 'identity') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"><Camera className="h-8 w-8 text-primary" /></div>
            <h2 className="text-lg font-bold mb-2">Identity Verification</h2>
            <p className="text-sm text-muted-foreground mb-4">Position your face in the center of the frame.</p>
            <div className="mx-auto mb-4 w-[240px] h-[180px] overflow-hidden rounded-lg border-2 border-dashed border-primary/30 bg-black flex items-center justify-center">
              <WebcamFeed />
            </div>
            <div className="space-y-2 text-sm text-muted-foreground mb-6">
              <p>✓ Ensure good lighting</p><p>✓ Face clearly visible</p><p>✓ No other persons in frame</p>
            </div>
            <Button className="w-full" onClick={async () => { await toggleFullscreen(); await startExam(); }}>
              <CheckCircle className="mr-2 h-4 w-4" />I Confirm — Start Exam
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================
  // LOADING
  // ============================================
  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-lg font-semibold">Loading exam...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // SUBMITTING
  // ============================================
  if (phase === 'submitting') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-lg font-semibold">Submitting your answers...</p>
          <p className="text-sm text-muted-foreground">Please do not close this page.</p>
        </div>
      </div>
    );
  }

  // ============================================
  // SUBMITTED
  // ============================================
  if (phase === 'submitted') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950"><CheckCircle className="h-8 w-8 text-emerald-600" /></div>
            <h2 className="text-xl font-bold mb-2">Exam Submitted Successfully</h2>
            <p className="text-sm text-muted-foreground mb-4">{answeredCount} of {questions.length} questions answered.</p>
            {score && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Score</p><p className="text-xl font-bold">{score.obtained}/{score.total}</p></div>
                <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Percentage</p><p className="text-xl font-bold">{score.pct}%</p></div>
                <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Flags</p><p className="text-xl font-bold">{violations.length}</p></div>
              </div>
            )}
            <Button className="w-full" onClick={() => router.push('/dashboard/exams')}>Back to Exams</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================
  // EXAM
  // ============================================
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {flagWarning && <div className="bg-red-600 text-white px-4 py-2 text-center text-sm font-medium animate-pulse z-50">{flagWarning}</div>}

      {/* Top Bar */}
      <header className="flex items-center justify-between border-b bg-card px-3 md:px-4 py-2 shrink-0">
        <div className="flex items-center gap-3">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold hidden sm:inline">{exam?.name || 'Exam'}</span>
          <Badge variant="outline" className="text-xs">Q {currentQ + 1}/{questions.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <ExamTimer totalMinutes={submission?.time_limit_minutes || 120} onTimeUp={handleSubmit} />
          <WebcamFeed />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Question Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {question && (
            <div className="mx-auto max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold text-primary">Q{currentQ + 1}</span>
                  <Badge variant="outline">{question.marks} marks</Badge>
                </div>
                {violations.length > 0 && (
                  <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-0 text-xs"><Flag className="mr-1 h-3 w-3" /> {violations.length} flag(s)</Badge>
                )}
              </div>

              <p className="text-base md:text-lg mb-6 whitespace-pre-wrap">{question.question_text}</p>

              {question.question_type === 'mcq' && question.options && (
                <RadioGroup value={answers[question.id] || ''} onValueChange={(val) => saveAnswer(question.id, val)} className="space-y-3">
                  {question.options.map((opt, i) => (
                    <Label key={i} className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${answers[question.id] === opt ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                      <RadioGroupItem value={opt} /><span className="text-sm">{opt}</span>
                    </Label>
                  ))}
                </RadioGroup>
              )}

              {question.question_type === 'true_false' && (
                <RadioGroup value={answers[question.id] || ''} onValueChange={(val) => saveAnswer(question.id, val)} className="space-y-3">
                  {['True', 'False'].map(opt => (
                    <Label key={opt} className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${answers[question.id] === opt ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                      <RadioGroupItem value={opt} /><span className="text-sm">{opt}</span>
                    </Label>
                  ))}
                </RadioGroup>
              )}

              {(question.question_type === 'short_answer' || question.question_type === 'long_answer') && (
                <Textarea
                  placeholder="Type your answer here..."
                  value={answers[question.id] || ''}
                  onChange={(e) => saveAnswer(question.id, e.target.value)}
                  rows={question.question_type === 'long_answer' ? 8 : 4}
                  className="resize-none text-sm"
                />
              )}
            </div>
          )}
        </div>

        {/* Question Navigator */}
        <div className="hidden md:flex w-[200px] border-l bg-card flex-col">
          <div className="p-3 border-b"><p className="text-xs font-semibold text-muted-foreground uppercase">Questions</p></div>
          <div className="flex-1 overflow-y-auto p-2">
            <div className="grid grid-cols-5 gap-1">
              {questions.map((q, i) => (
                <button key={q.id} onClick={() => setCurrentQ(i)} className={`flex h-8 w-8 items-center justify-center rounded text-xs font-medium transition-colors ${i === currentQ ? 'bg-primary text-primary-foreground' : answers[q.id] ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
          <div className="p-3 border-t space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Answered</span>
              <span className="font-medium">{answeredCount}/{questions.length}</span>
            </div>
            <Button variant="destructive" className="w-full" size="sm" onClick={handleSubmit}>
              <Send className="mr-1 h-3.5 w-3.5" />Submit Exam
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <footer className="flex items-center justify-between border-t bg-card px-3 md:px-4 py-2 shrink-0">
        <Button variant="outline" size="sm" disabled={currentQ === 0} onClick={() => setCurrentQ(prev => prev - 1)}>
          <ChevronLeft className="h-4 w-4 mr-1" />Previous
        </Button>
        <div className="flex md:hidden items-center gap-1">
          {questions.map((q, i) => (
            <button key={q.id} onClick={() => setCurrentQ(i)} className={`h-2 w-2 rounded-full transition-colors ${i === currentQ ? 'bg-primary' : answers[q.id] ? 'bg-emerald-500' : 'bg-muted'}`} />
          ))}
        </div>
        {currentQ === questions.length - 1 ? (
          <Button size="sm" onClick={handleSubmit}>Submit Exam <Send className="h-4 w-4 ml-1" /></Button>
        ) : (
          <Button size="sm" onClick={() => setCurrentQ(prev => prev + 1)}>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
        )}
      </footer>
    </div>
  );
}
