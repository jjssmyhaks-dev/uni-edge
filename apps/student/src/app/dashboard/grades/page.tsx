'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TrendingUp, Award, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { useGrades, calculateCGPA, type GradeEntry } from '@/lib/hooks/useGrades';

function GradeRow({ entry }: { entry: GradeEntry }) {
  const [open, setOpen] = useState(false);
  const totalObtained = entry.assessments.reduce((s, a) => s + a.marks_obtained, 0);
  const totalMax = entry.assessments.reduce((s, a) => s + a.max_marks, 0);

  return (
    <>
      <TableRow className="hover:bg-muted/50 cursor-pointer" onClick={() => setOpen(!open)}>
        <TableCell className="font-mono font-semibold text-sm">{entry.course_code}</TableCell>
        <TableCell className="font-medium">{entry.course_name}</TableCell>
        <TableCell className="text-center">{entry.credits}</TableCell>
        <TableCell className="text-center">
          <Badge variant={entry.grade.startsWith('A') ? 'default' : entry.grade.startsWith('B') ? 'secondary' : 'outline'}>
            {entry.grade}
          </Badge>
        </TableCell>
        <TableCell className="text-center font-medium">{entry.grade_points}</TableCell>
        <TableCell className="text-center text-muted-foreground text-sm">{totalObtained}/{totalMax}</TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </TableCell>
      </TableRow>
      {open && (
        <TableRow>
          <TableCell colSpan={7} className="p-0">
            <div className="bg-muted/30 p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Assessment Breakdown</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {entry.assessments.map(a => (
                  <div key={a.id} className="rounded-md border bg-card p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{a.name}</span>
                      <Badge variant="outline" className="text-[10px]">{a.weightage}%</Badge>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold">{a.marks_obtained}</span>
                      <span className="text-sm text-muted-foreground">/ {a.max_marks}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${(a.marks_obtained / a.max_marks) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export default function GradesPage() {
  const { data: grades = [], isLoading } = useGrades();
  const cgpa = calculateCGPA(grades);
  const totalCredits = grades.reduce((s, g) => s + g.credits, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marks & Grades</h1>
          <p className="text-muted-foreground">View your grades and download transcript</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />Download Transcript
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cumulative GPA</p>
              <p className="text-3xl font-bold">{cgpa.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Credits</p>
              <p className="text-3xl font-bold">{totalCredits}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Courses Completed</p>
              <p className="text-3xl font-bold">{grades.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grades Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Semester 1 — Grade Report</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
          ) : grades.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No grades available yet</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-center">Credits</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                  <TableHead className="text-center">Grade Points</TableHead>
                  <TableHead className="text-center">Marks</TableHead>
                  <TableHead className="text-right w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.map(entry => (
                  <GradeRow key={entry.id} entry={entry} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
