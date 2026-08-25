'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, TrendingUp, Download, FileText } from 'lucide-react';

const results = [
  { exam: 'CS201 — Mid-Term', date: 'Oct 15, 2025', marks: 42, total: 50, grade: 'A', gradePoint: 8.5, status: 'published' },
  { exam: 'CS202 — Quiz 3', date: 'Sep 28, 2025', marks: 18, total: 20, grade: 'O', gradePoint: 10, status: 'published' },
  { exam: 'CS203 — Assignment 2', date: 'Sep 15, 2025', marks: 9, total: 10, grade: 'A+', gradePoint: 9.5, status: 'published' },
  { exam: 'CS201 — Quiz 2', date: 'Sep 5, 2025', marks: 8, total: 10, grade: 'A', gradePoint: 8.5, status: 'published' },
];

const gradeColors: Record<string, string> = {
  'O': 'bg-green-500/10 text-green-600',
  'A+': 'bg-green-500/10 text-green-600',
  'A': 'bg-blue-500/10 text-blue-600',
  'B+': 'bg-yellow-500/10 text-yellow-600',
  'B': 'bg-yellow-500/10 text-yellow-600',
  'C': 'bg-orange-500/10 text-orange-600',
  'F': 'bg-red-500/10 text-red-600',
};

export default function StudentResultsPage() {
  const avgGradePoint = results.reduce((acc, r) => acc + r.gradePoint, 0) / results.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Results</h1>
          <p className="text-muted-foreground">View your exam results and grade history.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
          <Download className="h-4 w-4" />
          Download Marksheet
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average GPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgGradePoint.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">out of 10.0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Best Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">O</div>
          </CardContent>
        </Card>
      </div>

      {/* Results List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Result History</CardTitle>
          <CardDescription>All published results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.map((result, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium">{result.exam}</p>
                    <p className="text-sm text-muted-foreground">{result.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">{result.marks}/{result.total}</p>
                    <p className="text-xs text-muted-foreground">GP: {result.gradePoint}</p>
                  </div>
                  <Badge variant="secondary" className={gradeColors[result.grade] || ''}>
                    {result.grade}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
