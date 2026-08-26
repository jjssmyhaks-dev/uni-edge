'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCreateEntranceExam } from '@/lib/hooks/useEntranceExams';
import { usePrograms } from '@/lib/hooks/usePrograms';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle,
  ClipboardList,
  Monitor,
  Shield,
  Settings,
  Clock,
} from 'lucide-react';

export default function CreateEntranceExamPage() {
  const router = useRouter();
  const createExam = useCreateEntranceExam();
  const { data: programsData } = usePrograms();
  const programs = programsData?.data || [];

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    program_id: '',
    exam_date: '',
    exam_time: '',
    duration_minutes: 120,
    mode: 'online' as 'online' | 'offline' | 'hybrid',
    total_marks: 100,
    passing_marks: 33,
    // Online proctoring config
    enable_webcam: true,
    enable_lockdown: true,
    tab_switch_limit: 3,
    auto_submit_on_threshold: 5,
    shuffle_questions: true,
    show_results_immediately: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = 'Required';
    if (!formData.exam_date) e.exam_date = 'Required';
    if (!formData.duration_minutes || formData.duration_minutes < 1) e.duration_minutes = 'Must be at least 1 minute';
    if (formData.total_marks < 1) e.total_marks = 'Must be at least 1';
    if (formData.passing_marks < 1) e.passing_marks = 'Must be at least 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    try {
      const result = await createExam.mutateAsync({
        name: formData.name,
        description: formData.description || undefined,
        program_id: formData.program_id || undefined,
        exam_date: formData.exam_date || undefined,
        exam_time: formData.exam_time || undefined,
        duration_minutes: formData.duration_minutes,
        mode: formData.mode,
        total_marks: formData.total_marks,
        passing_marks: formData.passing_marks,
        status: 'draft',
        online_config: {
          enable_webcam: formData.enable_webcam,
          enable_lockdown: formData.enable_lockdown,
          tab_switch_limit: formData.tab_switch_limit,
          auto_submit_on_threshold: formData.auto_submit_on_threshold,
          shuffle_questions: formData.shuffle_questions,
          show_results_immediately: formData.show_results_immediately,
        },
      });
      const examId = result?.data?.id;
      if (examId) {
        router.push(`/admin/exams/entrance/${examId}/questions`);
      } else {
        router.push('/admin/exams/entrance');
      }
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to create exam' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Entrance Exam</h1>
          <p className="text-muted-foreground text-sm">Set up a new entrance examination with proctoring config</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        {[1, 2].map(s => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {step > s ? <CheckCircle className="h-4 w-4" /> : s}
            </div>
            <span className={`text-sm ${step >= s ? 'text-foreground' : 'text-muted-foreground'}`}>
              {s === 1 ? 'Exam Details' : 'Online Proctoring'}
            </span>
            {s < 2 && <div className={`h-0.5 flex-1 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Step 1: Exam Details */}
          {step === 1 && (
            <div className="space-y-4">
              <Field label="Exam Name" required error={errors.name}>
                <Input value={formData.name} onChange={e => update('name', e.target.value)} placeholder="e.g. B.Tech CSE Entrance 2025" />
              </Field>

              <Field label="Description">
                <Input value={formData.description} onChange={e => update('description', e.target.value)} placeholder="Optional description" />
              </Field>

              <Field label="Program">
                <select value={formData.program_id} onChange={e => update('program_id', e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                  <option value="">Select program (optional)</option>
                  {programs.map((p: { id: string; name: string }) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Exam Date" required error={errors.exam_date}>
                  <Input type="date" value={formData.exam_date} onChange={e => update('exam_date', e.target.value)} />
                </Field>
                <Field label="Start Time">
                  <Input type="time" value={formData.exam_time} onChange={e => update('exam_time', e.target.value)} />
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Field label="Duration (min)" required error={errors.duration_minutes}>
                  <Input type="number" value={formData.duration_minutes} onChange={e => update('duration_minutes', Number(e.target.value))} />
                </Field>
                <Field label="Total Marks" required error={errors.total_marks}>
                  <Input type="number" value={formData.total_marks} onChange={e => update('total_marks', Number(e.target.value))} />
                </Field>
                <Field label="Passing Marks" required error={errors.passing_marks}>
                  <Input type="number" value={formData.passing_marks} onChange={e => update('passing_marks', Number(e.target.value))} />
                </Field>
              </div>

              <Field label="Exam Mode">
                <div className="flex gap-2">
                  {(['online', 'offline', 'hybrid'] as const).map(mode => (
                    <button key={mode} type="button" onClick={() => update('mode', mode)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        formData.mode === mode ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/30'
                      }`}>
                      {mode === 'online' ? <Monitor className="h-4 w-4 inline mr-1.5" /> : <ClipboardList className="h-4 w-4 inline mr-1.5" />}
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {/* Step 2: Proctoring Config */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Online Proctoring Settings</h3>
              </div>

              <ToggleRow
                label="Enable Webcam Monitoring"
                description="Candidate's webcam will be recorded during the exam"
                checked={formData.enable_webcam}
                onChange={v => update('enable_webcam', v)}
              />

              <ToggleRow
                label="Enable Browser Lockdown"
                description="Block copy/paste, right-click, F12, and other shortcuts"
                checked={formData.enable_lockdown}
                onChange={v => update('enable_lockdown', v)}
              />

              <ToggleRow
                label="Shuffle Questions"
                description="Randomize question order for each candidate"
                checked={formData.shuffle_questions}
                onChange={v => update('shuffle_questions', v)}
              />

              <ToggleRow
                label="Show Results Immediately"
                description="Display score to candidate right after submission"
                checked={formData.show_results_immediately}
                onChange={v => update('show_results_immediately', v)}
              />

              <div className="grid grid-cols-2 gap-4 pt-2">
                <Field label="Tab Switch Limit" description="Max allowed tab switches before auto-terminate">
                  <Input type="number" value={formData.tab_switch_limit} onChange={e => update('tab_switch_limit', Number(e.target.value))} min={0} />
                </Field>
                <Field label="Auto-Submit Flag Threshold" description="Auto-submit after this many high-severity flags">
                  <Input type="number" value={formData.auto_submit_on_threshold} onChange={e => update('auto_submit_on_threshold', Number(e.target.value))} min={0} />
                </Field>
              </div>

              {errors.submit && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{errors.submit}</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setStep(1)} disabled={step === 1}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        {step === 1 ? (
          <Button onClick={() => { if (validateStep1()) setStep(2); }}>
            Next <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={createExam.isPending}>
            {createExam.isPending ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Creating...</> : <><CheckCircle className="h-4 w-4 mr-1.5" /> Create Exam</>}
          </Button>
        )}
      </div>
    </div>
  );
}

function Field({ label, required, error, description, children }: { label: string; required?: boolean; error?: string; description?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label} {required && <span className="text-destructive">*</span>}</label>
      {description && <p className="text-xs text-muted-foreground mb-1">{description}</p>}
      {children}
      {error && <p className="text-destructive text-xs mt-0.5">{error}</p>}
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-muted'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}
