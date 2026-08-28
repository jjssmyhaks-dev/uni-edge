'use client';

import { useState, useCallback, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSubmitApplication, useApplications } from '@/lib/hooks/useApplications';
import { usePrograms } from '@/lib/hooks/usePrograms';
import { createClient } from '@supabase/supabase-js';
import {
  User,
  GraduationCap,
  FileText,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Upload,
  AlertCircle,
  Loader2,
  Save,
  Info,
  X,
  RotateCcw,
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'obc', label: 'OBC' },
  { value: 'sc', label: 'SC' },
  { value: 'st', label: 'ST' },
  { value: 'ews', label: 'EWS' },
];

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
];

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  category: string;
  aadhaarNumber: string;
  programId: string;
  admissionCycleId: string;
  documents: {
    marksheet: File | null;
    idProof: File | null;
    categoryCertificate: File | null;
    photo: File | null;
    signature: File | null;
  };
  agreeToTerms: boolean;
}

const INITIAL_FORM: FormData = {
  firstName: '', lastName: '', email: '', phone: '',
  dateOfBirth: '', gender: '', address: '', city: '',
  state: '', pincode: '', category: 'general', aadhaarNumber: '',
  programId: '', admissionCycleId: '',
  documents: { marksheet: null, idProof: null, categoryCertificate: null, photo: null, signature: null },
  agreeToTerms: false,
};

const STEPS = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Program Selection', icon: GraduationCap },
  { id: 3, title: 'Documents', icon: FileText },
  { id: 4, title: 'Review & Submit', icon: CheckCircle },
];

const DOC_FIELDS = [
  { key: 'marksheet' as const, label: '10th/12th Marksheet', required: true },
  { key: 'idProof' as const, label: 'ID Proof (Aadhaar/Passport)', required: true },
  { key: 'photo' as const, label: 'Passport Size Photo', required: true },
  { key: 'signature' as const, label: 'Signature', required: true },
  { key: 'categoryCertificate' as const, label: 'Category Certificate (if applicable)', required: false },
];

const DRAFT_KEY = 'uniedge-application-draft';

export default function ApplyPage() {
  const { user } = useUser();
  const submitMutation = useSubmitApplication();
  const { data: programsData } = usePrograms();
  const { data: existingApps } = useApplications();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingDocs, setUploadingDocs] = useState<Record<string, boolean>>({});
  const [hasDraft, setHasDraft] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  // Pre-fill from Clerk user
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.emailAddresses?.[0]?.emailAddress || prev.email,
        phone: prev.phone,
      }));
    }
  }, [user]);

  // Load draft from localStorage
  useEffect(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        const parsed = JSON.parse(draft);
        setFormData(prev => ({ ...prev, ...parsed, documents: INITIAL_FORM.documents }));
        setHasDraft(true);
      }
    } catch { /* ignore */ }
  }, []);

  const programs = programsData?.data || [];

  const updateField = useCallback((field: keyof FormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
  }, []);

  const updateDocument = useCallback((docType: keyof FormData['documents'], file: File | null) => {
    setFormData(prev => ({ ...prev, documents: { ...prev.documents, [docType]: file } }));
    setErrors(prev => { const next = { ...prev }; delete next[docType]; return next; });
  }, []);

  const validateStep = (step: number): boolean => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!formData.firstName.trim()) e.firstName = 'Required';
      if (!formData.lastName.trim()) e.lastName = 'Required';
      if (!formData.email.trim()) e.email = 'Required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email';
      if (!formData.phone.trim()) e.phone = 'Required';
      else if (!/^[6-9]\d{9}$/.test(formData.phone)) e.phone = 'Invalid phone';
      if (!formData.dateOfBirth) e.dateOfBirth = 'Required';
      if (!formData.gender) e.gender = 'Required';
      if (!formData.city.trim()) e.city = 'Required';
      if (!formData.state) e.state = 'Required';
      if (!formData.pincode.trim()) e.pincode = 'Required';
      else if (!/^\d{6}$/.test(formData.pincode)) e.pincode = 'Invalid pincode';
    }
    if (step === 2) {
      if (!formData.programId) e.programId = 'Please select a program';
    }
    if (step === 3) {
      if (!formData.documents.marksheet) e.marksheet = 'Required';
      if (!formData.documents.idProof) e.idProof = 'Required';
      if (!formData.documents.photo) e.photo = 'Required';
      if (!formData.documents.signature) e.signature = 'Required';
    }
    if (step === 4) {
      if (!formData.agreeToTerms) e.agreeToTerms = 'You must agree';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => { if (validateStep(currentStep)) setCurrentStep(p => Math.min(p + 1, 4)); };
  const prevStep = () => setCurrentStep(p => Math.max(p - 1, 1));

  const uploadDocumentToStorage = async (file: File, docType: string): Promise<string | null> => {
    const supabase = createClient(supabaseUrl, supabaseAnon);
    const ext = file.name.split('.').pop();
    const path = `applications/${Date.now()}-${docType}.${ext}`;

    const { error } = await supabase.storage.from('documents').upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      console.error('Upload failed:', error);
      return null;
    }

    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    setIsSubmitting(true);

    try {
      // Upload documents to Supabase Storage
      const docUrls: Record<string, string> = {};
      const docEntries = Object.entries(formData.documents).filter(([, file]) => file !== null);

      for (const [key, file] of docEntries) {
        setUploadingDocs(prev => ({ ...prev, [key]: true }));
        const url = await uploadDocumentToStorage(file as File, key);
        if (url) docUrls[key] = url;
        setUploadingDocs(prev => ({ ...prev, [key]: false }));
      }

      // Submit application via API
      const result = await submitMutation.mutateAsync({
        cycle_id: formData.admissionCycleId || '00000000-0000-0000-0000-000000000000',
        applicant_name: `${formData.firstName} ${formData.lastName}`,
        applicant_email: formData.email,
        form_data: {
          personal: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            category: formData.category,
            aadhaarNumber: formData.aadhaarNumber,
            address: { full: formData.address, city: formData.city, state: formData.state, pincode: formData.pincode },
          },
          programId: formData.programId,
          documents: docUrls,
        },
      });

      setSubmittedAppId(result?.data?.id || `APP-${Date.now().toString(36).toUpperCase()}`);
      setIsSubmitted(true);
      localStorage.removeItem(DRAFT_KEY);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Submission failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveDraft = () => {
    const { documents, ...rest } = formData;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(rest));
    setHasDraft(true);
  };

  const restoreDraft = () => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        const parsed = JSON.parse(draft);
        setFormData(prev => ({ ...prev, ...parsed, documents: INITIAL_FORM.documents }));
        setDraftRestored(true);
      }
    } catch { /* ignore */ }
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setFormData(INITIAL_FORM);
    setHasDraft(false);
    setDraftRestored(false);
    setCurrentStep(1);
  };

  // Success screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-xl font-bold mb-2">Application Submitted</h1>
            <p className="text-muted-foreground mb-5 text-sm">
              Your application has been submitted successfully. You will receive a confirmation email shortly.
            </p>
            <div className="rounded-lg bg-muted p-4 mb-5">
              <p className="text-xs text-muted-foreground mb-1">Application ID</p>
              <p className="text-lg font-bold font-mono">{submittedAppId}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => window.location.href = '/applicant'}>
                View Application
              </Button>
              <Button className="flex-1" onClick={() => window.location.href = '/'}>
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Uni-Edge Application</h1>
            <p className="text-xs text-muted-foreground">Admission Application Form</p>
          </div>
          <div className="flex items-center gap-2">
            {hasDraft && !draftRestored && (
              <Button variant="outline" size="sm" onClick={restoreDraft}>
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Restore Draft
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={saveDraft}>
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Save Draft
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Step Indicator */}
        <div className="mb-6">
          <div className="flex items-center">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isDone = currentStep > step.id;
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium ${
                      isDone ? 'bg-primary text-primary-foreground' :
                      isActive ? 'bg-primary text-primary-foreground' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {isDone ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <p className={`text-xs mt-1.5 font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.title}
                    </p>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 ${currentStep > step.id ? 'bg-primary' : 'bg-muted'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Enter your personal and contact details'}
              {currentStep === 2 && 'Choose the program you want to apply for'}
              {currentStep === 3 && 'Upload required documents (scanned copies, PDF/JPG/PNG, max 10MB)'}
              {currentStep === 4 && 'Review your application before submitting'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="First Name" required error={errors.firstName}>
                    <Input value={formData.firstName} onChange={e => updateField('firstName', e.target.value)} placeholder="First name" />
                  </Field>
                  <Field label="Last Name" required error={errors.lastName}>
                    <Input value={formData.lastName} onChange={e => updateField('lastName', e.target.value)} placeholder="Last name" />
                  </Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Email" required error={errors.email}>
                    <Input type="email" value={formData.email} onChange={e => updateField('email', e.target.value)} placeholder="email@example.com" />
                  </Field>
                  <Field label="Phone" required error={errors.phone}>
                    <Input type="tel" value={formData.phone} onChange={e => updateField('phone', e.target.value)} placeholder="9876543210" />
                  </Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Field label="Date of Birth" required error={errors.dateOfBirth}>
                    <Input type="date" value={formData.dateOfBirth} onChange={e => updateField('dateOfBirth', e.target.value)} />
                  </Field>
                  <Field label="Gender" required error={errors.gender}>
                    <select value={formData.gender} onChange={e => updateField('gender', e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </Field>
                  <Field label="Category" required>
                    <select value={formData.category} onChange={e => updateField('category', e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Address">
                  <Input value={formData.address} onChange={e => updateField('address', e.target.value)} placeholder="House no, Street, Locality" />
                </Field>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Field label="City" required error={errors.city}>
                    <Input value={formData.city} onChange={e => updateField('city', e.target.value)} placeholder="City" />
                  </Field>
                  <Field label="State" required error={errors.state}>
                    <select value={formData.state} onChange={e => updateField('state', e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                      <option value="">Select state</option>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Pincode" required error={errors.pincode}>
                    <Input value={formData.pincode} onChange={e => updateField('pincode', e.target.value)} placeholder="110001" maxLength={6} />
                  </Field>
                </div>
                <Field label="Aadhaar Number (Optional)">
                  <Input value={formData.aadhaarNumber} onChange={e => updateField('aadhaarNumber', e.target.value)} placeholder="1234 5678 9012" maxLength={14} />
                </Field>
              </div>
            )}

            {/* Step 2: Program Selection */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-start gap-2 rounded-lg bg-muted p-3 text-sm">
                  <Info className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <p className="text-muted-foreground">Choose the program you wish to apply for. Ensure you meet the eligibility criteria.</p>
                </div>
                {programs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {programs.map((program) => (
                      <label key={program.id} className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.programId === program.id
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-muted-foreground/30'
                      }`}>
                        <input type="radio" name="program" value={program.id} checked={formData.programId === program.id} onChange={e => updateField('programId', e.target.value)} className="sr-only" />
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm">{program.name}</p>
                            <p className="text-xs text-muted-foreground">{program.code || '—'}</p>
                          </div>
                          {'total_seats' in program && (program as { total_seats: number | null }).total_seats && <Badge variant="outline" className="text-xs shrink-0">{(program as { total_seats: number }).total_seats} seats</Badge>}
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No programs available. Please check back later.
                  </div>
                )}
                {errors.programId && <p className="text-destructive text-xs">{errors.programId}</p>}
              </div>
            )}

            {/* Step 3: Documents */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-start gap-2 rounded-lg bg-muted p-3 text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <p className="text-muted-foreground">Upload clear, legible scans. Accepted: PDF, JPG, PNG. Max 10MB each.</p>
                </div>
                {DOC_FIELDS.map(doc => (
                  <div key={doc.key}>
                    <label className="block text-sm font-medium mb-1.5">
                      {doc.label} {doc.required && <span className="text-destructive">*</span>}
                    </label>
                    <div className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                      errors[doc.key] ? 'border-destructive bg-destructive/5' : 'border-muted hover:border-muted-foreground/30'
                    }`}>
                      <input
                        type="file" accept=".pdf,.jpg,.jpeg,.png"
                        onChange={e => updateDocument(doc.key, e.target.files?.[0] || null)}
                        className="sr-only" id={`upload-${doc.key}`}
                      />
                      <label htmlFor={`upload-${doc.key}`} className="cursor-pointer block">
                        {formData.documents[doc.key] ? (
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                            <div className="text-left min-w-0">
                              <span className="text-sm font-medium truncate block max-w-[200px]">
                                {(formData.documents[doc.key] as File).name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {((formData.documents[doc.key] as File).size / 1024 / 1024).toFixed(1)} MB
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); updateDocument(doc.key, null); }}
                              className="ml-1 p-1 rounded hover:bg-muted"
                            >
                              <X className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                          </div>
                        ) : uploadingDocs[doc.key] ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Uploading...</span>
                            </div>
                            <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }} />
                            </div>
                          </div>
                        ) : (
                          <>
                            <FileText className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                            <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                            <p className="text-xs text-muted-foreground/70 mt-0.5">PDF, JPG, PNG (max 10MB)</p>
                          </>
                        )}
                      </label>
                    </div>
                    {errors[doc.key] && <p className="text-destructive text-xs mt-1">{errors[doc.key]}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <ReviewSection title="Personal Information">
                  <ReviewRow label="Name" value={`${formData.firstName} ${formData.lastName}`} />
                  <ReviewRow label="Email" value={formData.email} />
                  <ReviewRow label="Phone" value={formData.phone} />
                  <ReviewRow label="DOB" value={formData.dateOfBirth} />
                  <ReviewRow label="Gender" value={formData.gender} className="capitalize" />
                  <ReviewRow label="Category" value={formData.category.toUpperCase()} />
                  <ReviewRow label="Address" value={`${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`} />
                </ReviewSection>

                <ReviewSection title="Program">
                  <p className="text-sm">{formData.programId ? programs.find((p: { id: string }) => p.id === formData.programId)?.name || formData.programId : 'Not selected'}</p>
                </ReviewSection>

                <ReviewSection title="Documents">
                  <div className="space-y-1.5">
                    {Object.entries(formData.documents).map(([key, file]) => (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        {file ? <CheckCircle className="h-3.5 w-3.5 text-green-600" /> : <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />}
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        {file && <span className="text-muted-foreground">— {(file as File).name}</span>}
                      </div>
                    ))}
                  </div>
                </ReviewSection>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.agreeToTerms} onChange={e => updateField('agreeToTerms', e.target.checked)} className="mt-0.5 rounded border-input" />
                  <span className="text-sm text-muted-foreground">
                    I declare that all information provided is true and correct. I understand that providing false information may lead to cancellation of my application.
                  </span>
                </label>
                {errors.agreeToTerms && <p className="text-destructive text-xs">{errors.agreeToTerms}</p>}

                {errors.submit && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{errors.submit}</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={prevStep} disabled={currentStep === 1}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            {hasDraft && (
              <Button variant="ghost" size="sm" onClick={clearDraft}>
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Clear Draft
              </Button>
            )}
          </div>
          {currentStep < 4 ? (
            <Button size="sm" onClick={nextStep}>
              Next
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button size="sm" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Submitting...</>
              ) : (
                <><CheckCircle className="h-4 w-4 mr-1.5" /> Submit Application</>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- Small helpers ---- */

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {error && <p className="text-destructive text-xs mt-0.5">{error}</p>}
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-muted/50 p-4">
      <h3 className="font-medium text-sm mb-2">{title}</h3>
      {children}
    </div>
  );
}

function ReviewRow({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex gap-2 text-sm py-0.5">
      <span className="text-muted-foreground w-24 shrink-0">{label}:</span>
      <span className={`font-medium ${className || ''}`}>{value || '—'}</span>
    </div>
  );
}
