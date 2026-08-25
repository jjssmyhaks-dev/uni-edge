'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewRegularExamPage() {
  const [formData, setFormData] = useState({
    name: '',
    course_code: '',
    program_id: '',
    term: 'end_semester',
    academic_year: '2025-26',
    exam_date: '',
    exam_time: '',
    duration_minutes: 180,
    total_marks: 100,
    passing_marks: 40,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Will be connected to API
    console.log('Creating exam:', formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/exams/regular">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Regular Exam</h1>
          <p className="text-muted-foreground">Schedule a new examination for a program.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Exam Details</CardTitle>
              <CardDescription>Basic information about the examination.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Exam Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., B.Tech Semester 3 End-Term Exam"
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Course Code</label>
                  <input
                    type="text"
                    value={formData.course_code}
                    onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                    placeholder="e.g., CS301"
                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Program *</label>
                  <select
                    value={formData.program_id}
                    onChange={(e) => setFormData({ ...formData, program_id: e.target.value })}
                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select program</option>
                    {/* Programs will be populated from API */}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Term *</label>
                  <select
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="mid_semester">Mid-Semester</option>
                    <option value="end_semester">End-Semester</option>
                    <option value="internal">Internal Assessment</option>
                    <option value="practical">Practical</option>
                    <option value="backlog">Backlog</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Academic Year *</label>
                  <input
                    type="text"
                    value={formData.academic_year}
                    onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                    placeholder="YYYY-YY"
                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule & Marks</CardTitle>
              <CardDescription>Exam timing and grading configuration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Exam Date</label>
                  <input
                    type="date"
                    value={formData.exam_date}
                    onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Start Time</label>
                  <input
                    type="time"
                    value={formData.exam_time}
                    onChange={(e) => setFormData({ ...formData, exam_time: e.target.value })}
                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  min={30}
                  max={480}
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Total Marks</label>
                  <input
                    type="number"
                    value={formData.total_marks}
                    onChange={(e) => setFormData({ ...formData, total_marks: parseInt(e.target.value) })}
                    min={1}
                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Passing Marks</label>
                  <input
                    type="number"
                    value={formData.passing_marks}
                    onChange={(e) => setFormData({ ...formData, passing_marks: parseInt(e.target.value) })}
                    min={1}
                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6">
          <Link href="/admin/exams/regular">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Create Exam
          </Button>
        </div>
      </form>
    </div>
  );
}
