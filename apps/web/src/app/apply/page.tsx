'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  User,
  GraduationCap,
  FileText,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Upload,
  AlertCircle,
  Loader2,
  Save,
  Info
} from 'lucide-react';

interface FormData {
  // Step 1: Personal Information
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

  // Step 2: Program Selection
  programId: string;
  admissionCycleId: string;

  // Step 3: Documents
  documents: {
    marksheet: File | null;
    idProof: File | null;
    categoryCertificate: File | null;
    photo: File | null;
    signature: File | null;
  };

  // Step 4: Review
  agreeToTerms: boolean;
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  category: 'general',
  aadhaarNumber: '',
  programId: '',
  admissionCycleId: '',
  documents: {
    marksheet: null,
    idProof: null,
    categoryCertificate: null,
    photo: null,
    signature: null,
  },
  agreeToTerms: false,
};

const steps = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Program Selection', icon: GraduationCap },
  { id: 3, title: 'Documents', icon: FileText },
  { id: 4, title: 'Review & Submit', icon: CheckCircle },
];

const categories = [
  { value: 'general', label: 'General' },
  { value: 'obc', label: 'OBC' },
  { value: 'sc', label: 'SC' },
  { value: 'st', label: 'ST' },
  { value: 'ews', label: 'EWS' },
];

const states = [
  'Andhra Pradesh', 'Bihar', 'Delhi', 'Gujarat', 'Haryana', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab',
  'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal',
];

export default function ApplyPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = useCallback((field: keyof FormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const updateDocument = useCallback((docType: keyof FormData['documents'], file: File | null) => {
    setFormData(prev => ({
      ...prev,
      documents: { ...prev.documents, [docType]: file },
    }));
  }, []);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
      if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
      else if (!/^[6-9]\d{9}$/.test(formData.phone)) newErrors.phone = 'Invalid 10-digit phone number';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state) newErrors.state = 'State is required';
      if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
      else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Invalid 6-digit pincode';
    }

    if (step === 2) {
      if (!formData.programId) newErrors.programId = 'Please select a program';
    }

    if (step === 3) {
      if (!formData.documents.marksheet) newErrors.marksheet = 'Marksheet is required';
      if (!formData.documents.idProof) newErrors.idProof = 'ID proof is required';
      if (!formData.documents.photo) newErrors.photo = 'Photo is required';
      if (!formData.documents.signature) newErrors.signature = 'Signature is required';
    }

    if (step === 4) {
      if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const saveDraft = () => {
    // Save to localStorage for resume later
    localStorage.setItem('uniedge-application-draft', JSON.stringify({
      ...formData,
      documents: undefined, // Can't serialize files
    }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h1>
            <p className="text-gray-600 mb-6">
              Your application has been submitted successfully. You will receive a confirmation
              email shortly with your application ID.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">Your Application ID</p>
              <p className="text-xl font-bold text-blue-600">APP-2025-{Math.random().toString(36).substring(2, 8).toUpperCase()}</p>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              You can track your application status using the applicant portal.
            </p>
            <Button onClick={() => window.location.href = '/applicant'} className="w-full">
              Go to Applicant Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Uni-Edge Application</h1>
              <p className="text-sm text-gray-500">Admission Application Form</p>
            </div>
            <Button variant="outline" size="sm" onClick={saveDraft}>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-green-500 text-white' :
                      isActive ? 'bg-blue-600 text-white' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <p className={`text-xs mt-2 font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Enter your personal and contact details'}
              {currentStep === 2 && 'Choose the program you want to apply for'}
              {currentStep === 3 && 'Upload required documents (scanned copies)'}
              {currentStep === 4 && 'Review your application before submitting'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => updateField('firstName', e.target.value)}
                      placeholder="Enter first name"
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => updateField('lastName', e.target.value)}
                      placeholder="Enter last name"
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="email@example.com"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="9876543210"
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                    <Input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => updateField('dateOfBirth', e.target.value)}
                      className={errors.dateOfBirth ? 'border-red-500' : ''}
                    />
                    {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => updateField('gender', e.target.value)}
                      className={`w-full h-10 px-3 py-2 border rounded-md text-sm ${errors.gender ? 'border-red-500' : 'border-gray-200'}`}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <div className="flex flex-wrap gap-3">
                    {categories.map(cat => (
                      <label key={cat.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value={cat.value}
                          checked={formData.category === cat.value}
                          onChange={(e) => updateField('category', e.target.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">{cat.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="House no, Street, Locality"
                    className={errors.address ? 'border-red-500' : ''}
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <Input
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="City"
                      className={errors.city ? 'border-red-500' : ''}
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <select
                      value={formData.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      className={`w-full h-10 px-3 py-2 border rounded-md text-sm ${errors.state ? 'border-red-500' : 'border-gray-200'}`}
                    >
                      <option value="">Select state</option>
                      {states.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                    <Input
                      value={formData.pincode}
                      onChange={(e) => updateField('pincode', e.target.value)}
                      placeholder="110001"
                      className={errors.pincode ? 'border-red-500' : ''}
                    />
                    {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number (Optional)</label>
                  <Input
                    value={formData.aadhaarNumber}
                    onChange={(e) => updateField('aadhaarNumber', e.target.value)}
                    placeholder="1234 5678 9012"
                    maxLength={14}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Program Selection */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Program Selection</p>
                    <p className="text-sm text-blue-700">
                      Choose the program you wish to apply for. Ensure you meet the eligibility criteria.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select Program *</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { id: 'btech-cse', name: 'B.Tech Computer Science', dept: 'CSE', duration: '4 years', seats: 120 },
                      { id: 'btech-ece', name: 'B.Tech Electronics', dept: 'ECE', duration: '4 years', seats: 60 },
                      { id: 'btech-mech', name: 'B.Tech Mechanical', dept: 'ME', duration: '4 years', seats: 60 },
                      { id: 'bca', name: 'BCA', dept: 'CS', duration: '3 years', seats: 120 },
                      { id: 'mca', name: 'MCA', dept: 'CS', duration: '2 years', seats: 60 },
                      { id: 'mba', name: 'MBA', dept: 'Management', duration: '2 years', seats: 60 },
                    ].map(program => (
                      <label
                        key={program.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.programId === program.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="program"
                          value={program.id}
                          checked={formData.programId === program.id}
                          onChange={(e) => updateField('programId', e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{program.name}</p>
                            <p className="text-sm text-gray-500">{program.dept} • {program.duration}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">{program.seats} seats</Badge>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.programId && <p className="text-red-500 text-xs mt-2">{errors.programId}</p>}
                </div>
              </div>
            )}

            {/* Step 3: Documents */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Document Requirements</p>
                    <p className="text-sm text-yellow-700">
                      Upload clear, legible scans. Accepted formats: PDF, JPG, PNG. Max size: 10MB each.
                    </p>
                  </div>
                </div>

                {[
                  { key: 'marksheet' as const, label: '10th/12th Marksheet', required: true },
                  { key: 'idProof' as const, label: 'ID Proof (Aadhaar/Passport)', required: true },
                  { key: 'photo' as const, label: 'Passport Size Photo', required: true },
                  { key: 'signature' as const, label: 'Signature', required: true },
                  { key: 'categoryCertificate' as const, label: 'Category Certificate (if applicable)', required: false },
                ].map(doc => (
                  <div key={doc.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {doc.label} {doc.required && <span className="text-red-500">*</span>}
                    </label>
                    <div className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors ${
                      errors[doc.key] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => updateDocument(doc.key, e.target.files?.[0] || null)}
                        className="sr-only"
                        id={`upload-${doc.key}`}
                      />
                      <label htmlFor={`upload-${doc.key}`} className="cursor-pointer">
                        {formData.documents[doc.key] ? (
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm text-green-700 font-medium">
                              {(formData.documents[doc.key] as File).name}
                            </span>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (max 10MB)</p>
                          </>
                        )}
                      </label>
                    </div>
                    {errors[doc.key] && <p className="text-red-500 text-xs mt-1">{errors[doc.key]}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">Name:</span> <span className="font-medium">{formData.firstName} {formData.lastName}</span></div>
                    <div><span className="text-gray-500">Email:</span> <span className="font-medium">{formData.email}</span></div>
                    <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{formData.phone}</span></div>
                    <div><span className="text-gray-500">DOB:</span> <span className="font-medium">{formData.dateOfBirth}</span></div>
                    <div><span className="text-gray-500">Gender:</span> <span className="font-medium capitalize">{formData.gender}</span></div>
                    <div><span className="text-gray-500">Category:</span> <span className="font-medium uppercase">{formData.category}</span></div>
                    <div className="col-span-2"><span className="text-gray-500">Address:</span> <span className="font-medium">{formData.address}, {formData.city}, {formData.state} - {formData.pincode}</span></div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Program Selection</h3>
                  <p className="text-sm text-gray-700">
                    {formData.programId ? formData.programId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Not selected'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Documents</h3>
                  <div className="space-y-2">
                    {Object.entries(formData.documents).map(([key, file]) => (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        {file ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        {file && <span className="text-gray-500">— {(file as File).name}</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={(e) => updateField('agreeToTerms', e.target.checked)}
                    className="w-4 h-4 mt-1 text-blue-600 rounded"
                  />
                  <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
                    I declare that all information provided is true and correct to the best of my knowledge.
                    I understand that providing false information may lead to cancellation of my application.
                  </label>
                </div>
                {errors.agreeToTerms && <p className="text-red-500 text-xs">{errors.agreeToTerms}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          {currentStep < 4 ? (
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
