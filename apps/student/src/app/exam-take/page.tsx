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
  Camera, CameraOff, Clock, AlertTriangle, Shield, Eye,
  ChevronLeft, ChevronRight, Send, Maximize, Minimize,
  MonitorOff, Lock, Flag, CheckCircle,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

// ============================================
// Mock exam data (will be replaced with API)
// ============================================

interface Question {
  id: string;
  question_number: number;
  question_text: string;
  question_type: 'mcq' | 'true_false' | 'short_answer' | 'long_answer';
  options?: string[];
  marks: number;
}

interface ExamData {
  id: string;
  exam_name: string;
  duration_minutes: number;
  total_marks: number;
  total_questions: number;
  instructions: string[];
  questions: Question[];
}

const MOCK_EXAM: ExamData = {
  id: 'exam-1',
  exam_name: 'Mid-Term Examination — CS101',
  duration_minutes: 120,
  total_marks: 100,
  total_questions: 10,
  instructions: [
    'This exam is proctored via webcam and browser monitoring.',
    'Do not switch tabs or windows during the exam.',
    'Keep your face visible in the webcam at all times.',
    'Do not use any external devices or materials.',
    'Auto-submit occurs when the timer reaches zero.',
    'Any suspicious activity will be flagged for review.',
  ],
  questions: [
    { id: 'q1', question_number: 1, question_text: 'What is the time complexity of binary search?', question_type: 'mcq', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], marks: 5 },
    { id: 'q2', question_number: 2, question_text: 'A stack follows LIFO (Last In First Out) principle.', question_type: 'true_false', marks: 3 },
    { id: 'q3', question_number: 3, question_text: 'Explain the difference between a stack and a queue with examples.', question_type: 'long_answer', marks: 10 },
    { id: 'q4', question_number: 4, question_text: 'Which data structure is used in BFS traversal?', question_type: 'mcq', options: ['Stack', 'Queue', 'Tree', 'Graph'], marks: 5 },
    { id: 'q5', question_number: 5, question_text: 'What is the worst-case time complexity of QuickSort?', question_type: 'mcq', options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'], marks: 5 },
    { id: 'q6', question_number: 6, question_text: 'Define Big-O notation and provide two examples.', question_type: 'short_answer', marks: 8 },
    { id: 'q7', question_number: 7, question_text: 'A binary tree has at most 2^h nodes at level h.', question_type: 'true_false', marks: 3 },
    { id: 'q8', question_number: 8, question_text: 'Explain the concept of recursion. Write a recursive function to calculate factorial.', question_type: 'long_answer', marks: 15 },
    { id: 'q9', question_number: 9, question_text: 'What is the difference between DFS and BFS?', question_type: 'short_answer', marks: 10 },
    { id: 'q10', question_number: 10, question_text: 'Which sorting algorithm has the best average-case performance?', question_type: 'mcq', options: ['Bubble Sort', 'Selection Sort', 'Merge Sort', 'Insertion Sort'], marks: 5 },
  ],
};

// ============================================
// Browser Lockdown Hook
// ============================================

function useBrowserLockdown(isActive: boolean, onViolation: (type: string) => void) {
  useEffect(() => {
    if (!isActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        onViolation('tab_switch');
      }
    };

    const handleBlur = () => {
      onViolation('window_blur');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent common shortcuts
      if (
        (e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a', 'u', 's', 'p', 'j'].includes(e.key.toLowerCase()) ||
        e.key === 'F12' ||
        (e.altKey && e.key === 'Tab') ||
        (e.altKey && e.key === 'F4')
      ) {
        e.preventDefault();
        onViolation('blocked_shortcut');
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      onViolation('right_click');
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      onViolation('copy_attempt');
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      onViolation('paste_attempt');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
    };
  }, [isActive, onViolation]);
}

// ============================================
// Webcam Component
// ============================================

function WebcamFeed({ onFlag }: { onFlag: (type: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsActive(true);
          setError(null);
        }
      } catch (err) {
        setError('Camera access denied');
        setIsActive(false);
        onFlag('camera_denied');
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onFlag]);

  return (
    <div className="relative overflow-hidden rounded-lg border bg-black">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="h-[120px] w-[160px] object-cover"
        style={{ transform: 'scaleX(-1)' }}
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-950/80">
          <div className="text-center text-red-400">
            <CameraOff className="mx-auto mb-1 h-6 w-6" />
            <p className="text-[10px]">{error}</p>
          </div>
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
// Timer Component
// ============================================

function ExamTimer({
  totalMinutes,
  onTimeUp,
  isPaused,
}: {
  totalMinutes: number;
  onTimeUp: () => void;
  isPaused: boolean;
}) {
  const [remaining, setRemaining] = useState(totalMinutes * 60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, onTimeUp]);

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  const isUrgent = remaining < 300; // Last 5 minutes
  const isCritical = remaining < 60;

  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 ${
      isCritical ? 'border-red-500 bg-red-50 dark:bg-red-950' :
      isUrgent ? 'border-amber-500 bg-amber-50 dark:bg-amber-950' : ''
    }`}>
      <Clock className={`h-4 w-4 ${isCritical ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-muted-foreground'}`} />
      <span className={`font-mono text-lg font-bold ${
        isCritical ? 'text-red-600' : isUrgent ? 'text-amber-600' : ''
      }`}>
        {hours > 0 && `${hours}:`}{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
      {isCritical && <span className="text-[10px] font-medium text-red-600 animate-pulse">SUBMITTING SOON</span>}
    </div>
  );
}

// ============================================
// Main Exam Taking Interface
// ============================================

export default function ExamTakePage() {
  const searchParams = useSearchParams();
  const examId = searchParams.get('examId');
  const router = useRouter();

  const [phase, setPhase] = useState<'instructions' | 'identity' | 'exam' | 'submitting' | 'submitted'>('instructions');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violations, setViolations] = useState<Array<{ type: string; timestamp: string }>>([]);
  const [flagWarning, setFlagWarning] = useState<string | null>(null);
  const [exam] = useState<ExamData>(MOCK_EXAM);
  const flagTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleViolation = useCallback((type: string) => {
    const entry = { type, timestamp: new Date().toISOString() };
    setViolations(prev => [...prev, entry]);

    // Show warning
    const messages: Record<string, string> = {
      tab_switch: '⚠️ Tab/window switch detected! This has been recorded.',
      window_blur: '⚠️ Window focus lost! Stay on the exam page.',
      blocked_shortcut: '⚠️ Keyboard shortcut blocked during exam.',
      right_click: '⚠️ Right-click is disabled during exam.',
      copy_attempt: '⚠️ Copy is disabled during exam.',
      paste_attempt: '⚠️ Paste is disabled during exam.',
      camera_denied: '🔴 Camera access is required for proctored exams.',
    };

    setFlagWarning(messages[type] || '⚠️ Suspicious activity detected.');

    if (flagTimeoutRef.current) clearTimeout(flagTimeoutRef.current);
    flagTimeoutRef.current = setTimeout(() => setFlagWarning(null), 4000);

    // Send to API
    if (examId) {
      fetch(`${API_BASE}/api/v1/proctoring/flags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: examId,
          flag_type: type,
          severity: type === 'camera_denied' ? 9 : type === 'tab_switch' ? 7 : 4,
          description: `Auto-detected: ${type.replace('_', ' ')}`,
        }),
      }).catch(() => {});
    }
  }, [examId]);

  useBrowserLockdown(phase === 'exam', handleViolation);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleTimeUp = () => {
    handleSubmit();
  };

  const handleSubmit = async () => {
    setPhase('submitting');
    // Submit answers to API
    try {
      await fetch(`${API_BASE}/api/v1/exam-submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam_id: examId || exam.id,
          answers,
          violations: violations.length,
          submitted_at: new Date().toISOString(),
        }),
      });
    } catch (e) {
      console.error('Submit error:', e);
    }
    setPhase('submitted');
  };

  const handleIdentityVerify = () => {
    setPhase('exam');
    toggleFullscreen();
  };

  const updateAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const question = exam.questions[currentQ];
  const answeredCount = Object.keys(answers).length;

  // ============================================
  // INSTRUCTIONS PHASE
  // ============================================
  if (phase === 'instructions') {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <Card>
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">{exam.exam_name}</h1>
                  <p className="text-sm text-muted-foreground">Proctored Online Examination</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-lg font-bold">{exam.duration_minutes} min</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Total Marks</p>
                  <p className="text-lg font-bold">{exam.total_marks}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Questions</p>
                  <p className="text-lg font-bold">{exam.total_questions}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-lg font-bold">MCQ + Written</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Exam Instructions
                </h3>
                <ol className="space-y-2">
                  {exam.instructions.map((inst, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="font-mono text-xs text-primary mt-0.5">{i + 1}.</span>
                      {inst}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-lg border border-amber-500/30 bg-amber-50 dark:bg-amber-950 p-4 mb-6">
                <div className="flex items-start gap-2">
                  <Lock className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-amber-700 dark:text-amber-400">Browser Lockdown Active</p>
                    <p className="text-amber-600 dark:text-amber-500 mt-1">
                      Once the exam starts, tab switching, copy/paste, right-click, and keyboard shortcuts will be blocked. 
                      All activity is logged and may be flagged for review.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => router.back()}>
                  Exit
                </Button>
                <Button className="flex-1" onClick={() => setPhase('identity')}>
                  <Camera className="mr-2 h-4 w-4" />
                  Verify Identity & Start
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ============================================
  // IDENTITY VERIFICATION PHASE
  // ============================================
  if (phase === 'identity') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Camera className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-lg font-bold mb-2">Identity Verification</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Position your face in the center of the frame. Your webcam will be active during the exam.
            </p>
            <div className="mx-auto mb-4 w-[240px] h-[180px] overflow-hidden rounded-lg border-2 border-dashed border-primary/30 bg-black flex items-center justify-center">
              <WebcamFeed onFlag={handleViolation} />
            </div>
            <div className="space-y-2 text-sm text-muted-foreground mb-6">
              <p>✓ Ensure good lighting</p>
              <p>✓ Face clearly visible</p>
              <p>✓ No other persons in frame</p>
              <p>✓ No headphones or external devices</p>
            </div>
            <Button className="w-full" onClick={handleIdentityVerify}>
              <CheckCircle className="mr-2 h-4 w-4" />
              I Confirm — Start Exam
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================
  // SUBMITTING / SUBMITTED PHASES
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

  if (phase === 'submitted') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Exam Submitted Successfully</h2>
            <p className="text-sm text-muted-foreground mb-2">
              Your answers have been recorded. {answeredCount} of {exam.questions.length} questions answered.
            </p>
            {violations.length > 0 && (
              <p className="text-xs text-amber-600 mb-4">
                {violations.length} activity flag(s) were recorded during your session.
              </p>
            )}
            <Button className="w-full" onClick={() => router.push('/dashboard/exams')}>
              Back to Exams
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================
  // EXAM PHASE
  // ============================================
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Violation Warning Banner */}
      {flagWarning && (
        <div className="bg-red-600 text-white px-4 py-2 text-center text-sm font-medium animate-pulse z-50">
          {flagWarning}
        </div>
      )}

      {/* Top Bar */}
      <header className="flex items-center justify-between border-b bg-card px-3 md:px-4 py-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold hidden sm:inline">{exam.exam_name}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            Q {currentQ + 1}/{exam.questions.length}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <ExamTimer totalMinutes={exam.duration_minutes} onTimeUp={handleTimeUp} isPaused={false} />
          <WebcamFeed onFlag={handleViolation} />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Question Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-bold text-primary">Q{question.question_number}</span>
                <Badge variant="outline">{question.marks} marks</Badge>
              </div>
              {violations.length > 0 && (
                <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-0 text-xs">
                  <Flag className="mr-1 h-3 w-3" /> {violations.length} flag(s)
                </Badge>
              )}
            </div>

            <p className="text-base md:text-lg mb-6 whitespace-pre-wrap">{question.question_text}</p>

            {/* Answer Input */}
            {question.question_type === 'mcq' && question.options && (
              <RadioGroup
                value={answers[question.id] || ''}
                onValueChange={(val) => updateAnswer(question.id, val)}
                className="space-y-3"
              >
                {question.options.map((opt, i) => (
                  <Label
                    key={i}
                    className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                      answers[question.id] === opt
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <RadioGroupItem value={opt} />
                    <span className="text-sm">{opt}</span>
                  </Label>
                ))}
              </RadioGroup>
            )}

            {question.question_type === 'true_false' && (
              <RadioGroup
                value={answers[question.id] || ''}
                onValueChange={(val) => updateAnswer(question.id, val)}
                className="space-y-3"
              >
                {['True', 'False'].map(opt => (
                  <Label
                    key={opt}
                    className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                      answers[question.id] === opt
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <RadioGroupItem value={opt} />
                    <span className="text-sm">{opt}</span>
                  </Label>
                ))}
              </RadioGroup>
            )}

            {(question.question_type === 'short_answer' || question.question_type === 'long_answer') && (
              <Textarea
                placeholder="Type your answer here..."
                value={answers[question.id] || ''}
                onChange={(e) => updateAnswer(question.id, e.target.value)}
                rows={question.question_type === 'long_answer' ? 8 : 4}
                className="resize-none text-sm"
              />
            )}
          </div>
        </div>

        {/* Question Navigator Sidebar */}
        <div className="hidden md:flex w-[200px] border-l bg-card flex-col">
          <div className="p-3 border-b">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Questions</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <div className="grid grid-cols-5 gap-1">
              {exam.questions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQ(i)}
                  className={`flex h-8 w-8 items-center justify-center rounded text-xs font-medium transition-colors ${
                    i === currentQ
                      ? 'bg-primary text-primary-foreground'
                      : answers[q.id]
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {q.question_number}
                </button>
              ))}
            </div>
          </div>
          <div className="p-3 border-t space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Answered</span>
              <span className="font-medium">{answeredCount}/{exam.questions.length}</span>
            </div>
            <Button
              variant="destructive"
              className="w-full"
              size="sm"
              onClick={handleSubmit}
            >
              <Send className="mr-1 h-3.5 w-3.5" />
              Submit Exam
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <footer className="flex items-center justify-between border-t bg-card px-3 md:px-4 py-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          disabled={currentQ === 0}
          onClick={() => setCurrentQ(prev => prev - 1)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>

        {/* Mobile question nav */}
        <div className="flex md:hidden items-center gap-1">
          {exam.questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentQ(i)}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === currentQ ? 'bg-primary' : answers[q.id] ? 'bg-emerald-500' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {currentQ === exam.questions.length - 1 ? (
          <Button
            size="sm"
            onClick={handleSubmit}
          >
            Submit Exam <Send className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => setCurrentQ(prev => prev + 1)}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </footer>
    </div>
  );
}
