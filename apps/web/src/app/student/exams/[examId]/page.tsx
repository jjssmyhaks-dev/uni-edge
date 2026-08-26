'use client';

import { useState, useEffect, useCallback, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useStartExam,
  useExamSubmission,
  useSaveAnswer,
  useSubmitExam,
} from '@/lib/hooks/useExamSubmissions';
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  Flag,
  Eye,
} from 'lucide-react';

export default function ExamPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = use(params);
  const router = useRouter();
  const startExam = useStartExam();
  const saveAnswer = useSaveAnswer();
  const submitExam = useSubmitExam();

  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [localAnswers, setLocalAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [started, setStarted] = useState(false);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  const { data: submissionData, isLoading: submissionLoading } = useExamSubmission(submissionId || '');
  const submission = submissionData?.data;
  const questions = submission?.questions || [];
  const currentQuestion = questions[currentQ];

  // Start exam
  const handleStart = async () => {
    try {
      const result = await startExam.mutateAsync({ exam_id: examId });
      const sid = result?.data?.id;
      if (sid) {
        setSubmissionId(sid);
        setStarted(true);
        setLocalAnswers(result?.data?.answers || {});
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to start exam');
    }
  };

  // Calculate time remaining
  useEffect(() => {
    if (!submission?.started_at || !submission?.time_limit_minutes) return;
    const start = new Date(submission.started_at).getTime();
    const limit = submission.time_limit_minutes * 60 * 1000;
    const end = start + limit;

    const tick = () => {
      const remaining = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        handleSubmit(true);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [submission?.started_at, submission?.time_limit_minutes]);

  // Auto-save answers every 10 seconds
  useEffect(() => {
    if (!started || !submissionId || submission?.status !== 'in_progress') return;
    autoSaveTimer.current = setInterval(() => {
      Object.entries(localAnswers).forEach(([qId, ans]) => {
        saveAnswer.mutate({ submissionId, questionId: qId, answer: ans });
      });
    }, 10000);
    return () => { if (autoSaveTimer.current) clearInterval(autoSaveTimer.current); };
  }, [started, submissionId, submission?.status, localAnswers]);

  // Select answer
  const selectAnswer = useCallback((questionId: string, answer: string) => {
    setLocalAnswers(prev => ({ ...prev, [questionId]: answer }));
    if (submissionId) {
      saveAnswer.mutate({ submissionId, questionId, answer });
    }
  }, [submissionId]);

  // Toggle flag
  const toggleFlag = useCallback((questionId: string) => {
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  }, []);

  // Submit exam
  const handleSubmit = async (timedOut = false) => {
    if (!submissionId) return;
    // Save all pending answers first
    for (const [qId, ans] of Object.entries(localAnswers)) {
      await saveAnswer.mutateAsync({ submissionId, questionId: qId, answer: ans });
    }
    await submitExam.mutateAsync(submissionId);
    setShowSubmitConfirm(false);
  };

  // Format time
  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (submissionLoading && !started) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading exam...</p>
      </div>
    );
  }

  // Pre-exam start screen
  if (!started || !submission) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-xl font-bold">Ready to Start?</h1>
            <p className="text-sm text-muted-foreground">
              Once you start, the timer will begin. Make sure your camera is ready and you are in a quiet environment.
            </p>
            <div className="rounded-lg bg-muted p-3 text-sm text-left space-y-1">
              <p><strong>Duration:</strong> {submission?.time_limit_minutes || '120'} minutes</p>
              <p><strong>Questions:</strong> {submission?.entrance_exams?.question_count || '—'}</p>
              <p><strong>Total Marks:</strong> {submission?.entrance_exams?.total_marks_computed || '—'}</p>
            </div>
            <Button onClick={handleStart} className="w-full" disabled={startExam.isPending}>
              {startExam.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Start Exam
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results screen
  if (submission.status === 'submitted' || submission.status === 'timed_out') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-xl font-bold">
              {submission.status === 'timed_out' ? 'Time\'s Up!' : 'Exam Submitted'}
            </h1>
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Score</span>
                <span className="font-bold text-lg">{submission.marks_obtained} / {submission.total_marks}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Percentage</span>
                <span className="font-medium">{submission.score_percentage}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Questions Answered</span>
                <span className="font-medium">
                  {Object.keys(localAnswers).length} / {questions.length}
                </span>
              </div>
            </div>
            <Button onClick={() => router.push('/student/exams')} className="w-full">Back to Exams</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active exam UI
  const answeredCount = questions.filter(q => localAnswers[q.id]).length;
  const flaggedCount = flagged.size;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="border-b bg-card px-4 py-2 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold">{submission.entrance_exams?.name || 'Exam'}</h1>
          <Badge variant="outline" className="text-xs">
            Q {currentQ + 1} / {questions.length}
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1.5 text-sm font-mono font-bold px-3 py-1 rounded ${
            timeLeft < 300 ? 'text-red-600 bg-red-50 animate-pulse' : 'text-foreground'
          }`}>
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>
          <Button variant="destructive" size="sm" onClick={() => setShowSubmitConfirm(true)}>
            <Send className="h-3.5 w-3.5 mr-1.5" /> Submit
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Question area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {currentQuestion && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-muted-foreground">Q{currentQ + 1}</span>
                  <Badge variant="secondary" className="text-xs">{currentQuestion.marks} mark{currentQuestion.marks !== 1 ? 's' : ''}</Badge>
                </div>
                <Button
                  variant={flagged.has(currentQuestion.id) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleFlag(currentQuestion.id)}
                >
                  <Flag className="h-3.5 w-3.5 mr-1" />
                  {flagged.has(currentQuestion.id) ? 'Flagged' : 'Flag'}
                </Button>
              </div>

              <p className="text-base font-medium leading-relaxed">{currentQuestion.question_text}</p>

              <div className="space-y-2 mt-4">
                {currentQuestion.options.map((option, i) => {
                  const isSelected = localAnswers[currentQuestion.id] === option;
                  return (
                    <label
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-muted-foreground/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${currentQuestion.id}`}
                        checked={isSelected}
                        onChange={() => selectAnswer(currentQuestion.id, option)}
                        className="sr-only"
                      />
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border ${
                        isSelected ? 'bg-primary text-primary-foreground border-primary' : 'border-muted-foreground/30'
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm">{option}</span>
                    </label>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentQ(p => Math.max(0, p - 1))}
                  disabled={currentQ === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                {currentQ < questions.length - 1 ? (
                  <Button size="sm" onClick={() => setCurrentQ(p => p + 1)}>
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setShowSubmitConfirm(true)}>
                    <Send className="h-4 w-4 mr-1" /> Submit Exam
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Question palette sidebar */}
        <div className="w-64 border-l bg-card p-4 overflow-y-auto hidden lg:block">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Question Palette</h3>
          <div className="grid grid-cols-5 gap-1.5 mb-4">
            {questions.map((q, i) => {
              const isAnswered = !!localAnswers[q.id];
              const isFlagged = flagged.has(q.id);
              const isCurrent = i === currentQ;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQ(i)}
                  className={`w-full aspect-square rounded text-xs font-medium transition-all ${
                    isCurrent ? 'ring-2 ring-primary ring-offset-1' : ''
                  } ${
                    isAnswered
                      ? 'bg-green-500 text-white'
                      : isFlagged
                        ? 'bg-amber-500 text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-green-500" />
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-500" />
              <span>Flagged ({flaggedCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-muted" />
              <span>Not Answered ({questions.length - answeredCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit confirmation dialog */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <Card className="max-w-sm w-full mx-4">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
                <h2 className="text-lg font-bold">Submit Exam?</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                You have answered {answeredCount} out of {questions.length} questions.
                {questions.length - answeredCount > 0 && (
                  <span className="text-amber-600 font-medium"> {questions.length - answeredCount} questions are unanswered.</span>
                )}
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowSubmitConfirm(false)}>Cancel</Button>
                <Button size="sm" onClick={() => handleSubmit()} disabled={submitExam.isPending}>
                  {submitExam.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1" />}
                  Confirm Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
