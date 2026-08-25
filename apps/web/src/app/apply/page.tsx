'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { submitApplicationSchema } from '@uni-edge/types';
import type { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

type FormData = z.infer<typeof submitApplicationSchema>;

type Step = 'personal' | 'academic' | 'documents' | 'review' | 'success';

export default function ApplyPage() {
  const [step, setStep] = useState<Step>('personal');
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(submitApplicationSchema),
    defaultValues: { form_data: {} },
  });

  const steps: { key: Step; label: string; number: number }[] = [
    { key: 'personal', label: 'Personal Details', number: 1 },
    { key: 'academic', label: 'Academic Details', number: 2 },
    { key: 'documents', label: 'Documents', number: 3 },
    { key: 'review', label: 'Review & Submit', number: 4 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  const handleNext = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
    if (step === 'personal') setStep('academic');
    else if (step === 'academic') setStep('documents');
    else if (step === 'documents') setStep('review');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      // In production, this would submit to the API
      // For now, simulate success
      await new Promise((r) => setTimeout(r, 1500));
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="mx-auto mb-4 rounded-full bg-success/10 p-3 w-fit">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold">Application Submitted!</h2>
            <p className="mt-2 text-muted-foreground">
              Your application has been submitted successfully. You can track your
              application status using your registered email.
            </p>
            <Button className="mt-6" onClick={() => window.location.href = '/'}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Admission Application</h1>
          <p className="text-muted-foreground mt-1">Complete the form below to apply for admission.</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                i <= currentStepIndex ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {i < currentStepIndex ? '✓' : s.number}
              </div>
              <span className={`ml-2 text-sm hidden sm:inline ${
                i <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'
              }`}>{s.label}</span>
              {i < steps.length - 1 && <div className="w-8 sm:w-16 h-px bg-border mx-2" />}
            </div>
          ))}
        </div>

        {/* Personal Details Step */}
        {step === 'personal' && (
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
              <CardDescription>Basic information about the applicant</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(handleNext)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <input {...form.register('applicant_name')} className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Enter full name" />
                    {form.formState.errors.applicant_name && (
                      <p className="text-destructive text-xs mt-1">{form.formState.errors.applicant_name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input type="email" {...form.register('applicant_email')} className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="email@example.com" />
                    {form.formState.errors.applicant_email && (
                      <p className="text-destructive text-xs mt-1">{form.formState.errors.applicant_email.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input {...form.register('applicant_phone')} className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Admission Cycle *</label>
                    <select {...form.register('cycle_id')} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                      <option value="">Select program...</option>
                      <option value="880e8400-e29b-41d4-a716-446655440001">B.Tech CSE — 2026-27</option>
                      <option value="880e8400-e29b-41d4-a716-446655440002">B.Tech ECE — 2026-27</option>
                    </select>
                    {form.formState.errors.cycle_id && (
                      <p className="text-destructive text-xs mt-1">{form.formState.errors.cycle_id.message}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit">Next: Academic Details</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Academic Details Step */}
        {step === 'academic' && (
          <Card>
            <CardHeader>
              <CardTitle>Academic Details</CardTitle>
              <CardDescription>Your educational qualifications</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(handleNext)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">12th Percentage *</label>
                    <input type="number" {...form.register('form_data.12th_percentage', { valueAsNumber: true })} className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="e.g., 85" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">School/College Name *</label>
                    <input {...form.register('form_data.school')} className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="e.g., Delhi Public School" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select {...form.register('form_data.category')} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="EWS">EWS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Board</label>
                    <input {...form.register('form_data.board')} className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="e.g., CBSE" />
                  </div>
                </div>
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setStep('personal')}>Back</Button>
                  <Button type="submit">Next: Documents</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Documents Step */}
        {step === 'documents' && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>Upload required documents for verification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: '10th Marksheet', type: 'marksheet_10', required: true },
                  { label: '12th Marksheet', type: 'marksheet_12', required: true },
                  { label: 'ID Proof (Aadhaar/PAN)', type: 'id_proof', required: true },
                  { label: 'Category Certificate', type: 'category_cert', required: false },
                  { label: 'Photograph', type: 'photo', required: true },
                ].map((doc) => (
                  <div key={doc.type} className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <span className="text-sm font-medium">{doc.label}</span>
                      {doc.required && <span className="ml-1 text-destructive">*</span>}
                    </div>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="text-sm" />
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">Accepted formats: PDF, JPG, PNG (max 5MB each)</p>
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setStep('academic')}>Back</Button>
                  <Button onClick={() => setStep('review')}>Next: Review</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review Step */}
        {step === 'review' && (
          <Card>
            <CardHeader>
              <CardTitle>Review & Submit</CardTitle>
              <CardDescription>Review your application before submitting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{formData.applicant_name || '—'}</span>
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{formData.applicant_email || '—'}</span>
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{formData.applicant_phone || '—'}</span>
                </div>
              </div>
              <div className="bg-muted/50 rounded-md p-3 mt-4 text-sm text-muted-foreground">
                By submitting, you confirm that all information provided is accurate and you agree to the
                institution&apos;s admission terms.
              </div>
              {error && <p className="text-destructive text-sm mt-2">{error}</p>}
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep('documents')}>Back</Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
