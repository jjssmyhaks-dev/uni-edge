'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCompleteOnboarding, useOnboardingStatus } from '@/lib/hooks/useOnboarding';
import {
  Building2,
  CheckCircle,
  Globe,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
} from 'lucide-react';

const institutionTypes = [
  { value: 'government', label: 'Government', desc: 'State or central government funded' },
  { value: 'private', label: 'Private', desc: 'Privately managed institution' },
  { value: 'deemed', label: 'Deemed University', desc: 'Deemed to be university' },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const { data: statusData } = useOnboardingStatus();
  const completeOnboarding = useCompleteOnboarding();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    institution_name: '',
    short_name: '',
    institution_type: '' as 'government' | 'private' | 'deemed' | '',
    address: '',
    website: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already onboarded
  if (statusData?.data?.onboarded) {
    router.replace('/admin/dashboard');
    return null;
  }

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!formData.institution_name.trim()) e.institution_name = 'Institution name is required';
    if (!formData.institution_type) e.institution_type = 'Please select an institution type';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleComplete = async () => {
    const e: Record<string, string> = {};
    if (!formData.address.trim()) e.address = 'Address is recommended for your institution profile';
    setErrors(e);

    try {
      await completeOnboarding.mutateAsync({
        institution_name: formData.institution_name,
        institution_type: formData.institution_type as 'government' | 'private' | 'deemed',
        short_name: formData.short_name || undefined,
        address: formData.address || undefined,
        website: formData.website || undefined,
      });
      router.push('/admin/dashboard');
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Something went wrong' });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome to Uni-Edge</h1>
          <p className="text-muted-foreground mt-1">
            Set up your institution to get started. This takes less than a minute.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-6">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {step > s ? <CheckCircle className="h-4 w-4" /> : s}
              </div>
              <span className={`text-sm ${step >= s ? 'text-foreground' : 'text-muted-foreground'}`}>
                {s === 1 ? 'Institution' : 'Confirm'}
              </span>
              {s < 2 && <div className={`h-0.5 flex-1 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            {/* Step 1: Institution Details */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Institution Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={formData.institution_name}
                    onChange={(e) => updateField('institution_name', e.target.value)}
                    placeholder="e.g. Delhi Technical University"
                  />
                  {errors.institution_name && (
                    <p className="text-destructive text-xs mt-1">{errors.institution_name}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Short Name</label>
                    <Input
                      value={formData.short_name}
                      onChange={(e) => updateField('short_name', e.target.value)}
                      placeholder="e.g. DTU"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Website</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={formData.website}
                        onChange={(e) => updateField('website', e.target.value)}
                        placeholder="https://..."
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Institution Type <span className="text-destructive">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {institutionTypes.map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => updateField('institution_type', type.value)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          formData.institution_type === type.value
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-muted-foreground/30'
                        }`}
                      >
                        <p className="text-sm font-medium">{type.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{type.desc}</p>
                      </button>
                    ))}
                  </div>
                  {errors.institution_type && (
                    <p className="text-destructive text-xs mt-1">{errors.institution_type}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      placeholder="Full address with city and state"
                      className="pl-9"
                    />
                  </div>
                  {errors.address && (
                    <p className="text-destructive text-xs mt-1">{errors.address}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Review & Confirm */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                  <h3 className="font-medium text-sm">Institution Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>{' '}
                      <span className="font-medium">{formData.institution_name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Short Name:</span>{' '}
                      <span className="font-medium">{formData.short_name || '—'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>{' '}
                      <span className="font-medium capitalize">{formData.institution_type}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Website:</span>{' '}
                      <span className="font-medium">{formData.website || '—'}</span>
                    </div>
                    {formData.address && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Address:</span>{' '}
                        <span className="font-medium">{formData.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                  <h3 className="font-medium text-sm">Your Account</h3>
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="text-muted-foreground">Name:</span>{' '}
                      <span className="font-medium">{user?.fullName || user?.emailAddresses?.[0]?.emailAddress}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>{' '}
                      <span className="font-medium">{user?.emailAddresses?.[0]?.emailAddress}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Role:</span>{' '}
                      <span className="font-medium">Institution Admin</span>
                    </div>
                  </div>
                </div>

                {errors.submit && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {errors.submit}
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  By continuing, you agree to Uni-Edge&apos;s Terms of Service and Privacy Policy.
                  You can update your institution details later from Settings.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4">
          {step > 1 ? (
            <Button variant="ghost" onClick={() => setStep(1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {step === 1 ? (
            <Button onClick={() => { if (validateStep1()) setStep(2); }}>
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={completeOnboarding.isPending}>
              {completeOnboarding.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4 mr-2" />
                  Create Institution
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
