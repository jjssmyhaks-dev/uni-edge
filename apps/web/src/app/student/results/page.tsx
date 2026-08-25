'use client';

import { useState } from 'react';
import { useRegularExams } from '@/lib/hooks/useRegularExams';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Award, 
  Search, 
  Download, 
  TrendingUp,
  Loader2,
  BarChart3
} from 'lucide-react';

const gradeToGPA: Record<string, number> = {
  'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'D': 4, 'F': 0, 'RA': 0, 'AB': 0,
};

interface GradeEntry {
  id: string;
  name: string;
  course_code: string;
  credits: number;
  grade: string;
  marks_obtained: number;
  max_marks: number;
  term: string;
}

export default function StudentResultsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const { data: examsData, isLoading } = useRegularExams();

  const gradeEntries: GradeEntry[] = (examsData?.data || []).map(exam => ({
    id: exam.id,
    name: exam.name,
    course_code: exam.course_code || 'N/A',
    credits: 4,
    grade: 'A',
    marks_obtained: exam.total_marks || 85,
    max_marks: exam.total_marks || 100,
    term: exam.term || 'Semester 1',
  }));

  const filteredEntries = gradeEntries.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.course_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSem = selectedSemester === 'all' || e.term === selectedSemester;
    return matchesSearch && matchesSem;
  });

  const calculateGPA = (entries: GradeEntry[]) => {
    if (entries.length === 0) return '0.00';
    const totalCredits = entries.reduce((s, e) => s + e.credits, 0);
    const weighted = entries.reduce((s, e) => s + (gradeToGPA[e.grade] || 0) * e.credits, 0);
    return totalCredits > 0 ? (weighted / totalCredits).toFixed(2) : '0.00';
  };

  const overallGPA = calculateGPA(gradeEntries);
  const totalCredits = gradeEntries.reduce((s, e) => s + e.credits, 0);
  const passedCredits = gradeEntries.filter(e => (gradeToGPA[e.grade] || 0) > 0).reduce((s, e) => s + e.credits, 0);
  const semesters = [...new Set(gradeEntries.map(e => e.term))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Results</h1>
          <p className="text-gray-600 mt-1">View your exam results and academic performance</p>
        </div>
        <Button variant="outline"><Download className="w-4 h-4 mr-2" />Download Transcript</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Award className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-sm text-gray-500">Overall GPA</p><p className="text-2xl font-bold text-gray-900">{overallGPA}</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover:shadow-md transition-shadow"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><TrendingUp className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-sm text-gray-500">Credits</p><p className="text-2xl font-bold text-gray-900">{passedCredits}/{totalCredits}</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover:shadow-md transition-shadow"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><Award className="w-5 h-5 text-purple-600" /></div>
            <div><p className="text-sm text-gray-500">Courses</p><p className="text-2xl font-bold text-gray-900">{gradeEntries.length}</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover:shadow-md transition-shadow"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg"><BarChart3 className="w-5 h-5 text-orange-600" /></div>
            <div><p className="text-sm text-gray-500">Pass Rate</p><p className="text-2xl font-bold text-gray-900">{gradeEntries.length > 0 ? Math.round((passedCredits / totalCredits) * 100) : 0}%</p></div>
          </div>
        </CardContent></Card>
      </div>

      <Card><CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search courses..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className="px-3 py-2 border rounded-md text-sm">
            <option value="all">All Semesters</option>
            {semesters.map(sem => <option key={sem} value={sem}>{sem}</option>)}
          </select>
        </div>
      </CardContent></Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : filteredEntries.length === 0 ? (
        <Card><CardContent className="py-12">
          <div className="text-center">
            <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-500">{searchTerm ? 'No courses match your search.' : 'No results available yet.'}</p>
          </div>
        </CardContent></Card>
      ) : (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Award className="w-5 h-5 text-blue-600" /> Course Results</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Course</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Code</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Credits</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Marks</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Grade</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">GPA</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => {
                    const gpa = gradeToGPA[entry.grade] || 0;
                    return (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4"><p className="font-medium text-gray-900">{entry.name}</p><p className="text-sm text-gray-500">{entry.term}</p></td>
                        <td className="py-3 px-4 text-gray-600">{entry.course_code}</td>
                        <td className="py-3 px-4 text-center text-gray-600">{entry.credits}</td>
                        <td className="py-3 px-4 text-center"><span className="font-medium">{entry.marks_obtained}</span><span className="text-gray-500">/{entry.max_marks}</span></td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline" className={gpa >= 8 ? 'bg-green-50 text-green-700' : gpa >= 6 ? 'bg-blue-50 text-blue-700' : gpa >= 4 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}>{entry.grade}</Badge>
                        </td>
                        <td className="py-3 px-4 text-center font-medium">{gpa.toFixed(1)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
