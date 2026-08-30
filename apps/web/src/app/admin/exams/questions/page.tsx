'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Plus, Upload, Trash2, GripVertical, Save, FileText, CheckCircle,
  AlertCircle, Download, Edit, X, ChevronDown, ChevronUp,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

// ============================================
// Types
// ============================================

interface Exam {
  id: string;
  name: string;
  exam_date: string;
  question_count?: number;
  total_marks_computed?: number;
}

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer?: string;
  marks: number;
  question_order: number;
  is_active: boolean;
}

interface ParsedCSVRow {
  question_text: string;
  question_type: 'mcq' | 'true_false' | 'short_answer';
  options: string[];
  correct_answer?: string;
  marks: number;
}

// ============================================
// CSV Parser
// ============================================

function parseCSV(text: string): ParsedCSVRow[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const rows: ParsedCSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    if (cols.length < 2 || !cols[0]) continue;

    const type = (cols[2] || 'mcq').toLowerCase() as 'mcq' | 'true_false' | 'short_answer';
    const options = type === 'mcq' ? cols.slice(3, 7).filter(Boolean) : type === 'true_false' ? ['True', 'False'] : [];

    rows.push({
      question_text: cols[0],
      question_type: type,
      options,
      correct_answer: cols[7] || undefined,
      marks: parseInt(cols[8]) || 1,
    });
  }
  return rows;
}

const CSV_TEMPLATE = `question_text,description,type,option_a,option_b,option_c,option_d,correct_answer,marks
"What is 2+2?","Basic math","mcq","3","4","5","6","4",1
"The sky is blue","True/False","true_false","","","","","True",1
"Explain recursion","Short answer","short_answer","","","","","",5`;

// ============================================
// Main Component
// ============================================

export default function ExamQuestionsPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCSVDialog, setShowCSVDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [csvText, setCsvText] = useState('');
  const [csvPreview, setCsvPreview] = useState<ParsedCSVRow[]>([]);

  // Form state
  const [formText, setFormText] = useState('');
  const [formType, setFormType] = useState<string>('mcq');
  const [formOptions, setFormOptions] = useState<string[]>(['', '', '', '']);
  const [formCorrect, setFormCorrect] = useState('');
  const [formMarks, setFormMarks] = useState('1');

  // Fetch exams
  const { data: exams = [] } = useQuery<Exam[]>({
    queryKey: ['entrance-exams'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/v1/entrance-exams`, { headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
  });

  // Fetch questions for selected exam
  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ['exam-questions', selectedExamId],
    queryFn: async () => {
      if (!selectedExamId) return [];
      const res = await fetch(`${API_BASE}/api/v1/exam-questions/${selectedExamId}`, { headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!selectedExamId,
  });

  // Add question mutation
  const addQuestion = useMutation({
    mutationFn: async (data: ParsedCSVRow) => {
      const res = await fetch(`${API_BASE}/api/v1/exam-questions/${selectedExamId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to add question');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exam-questions', selectedExamId] }),
  });

  // Bulk upload mutation
  const bulkUpload = useMutation({
    mutationFn: async (questions: ParsedCSVRow[]) => {
      const res = await fetch(`${API_BASE}/api/v1/exam-questions/${selectedExamId}/bulk`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions }),
      });
      if (!res.ok) throw new Error('Bulk upload failed');
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['exam-questions', selectedExamId] }); setShowCSVDialog(false); setCsvText(''); setCsvPreview([]); },
  });

  // Delete question mutation
  const deleteQuestion = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/api/v1/exam-questions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exam-questions', selectedExamId] }),
  });

  const resetForm = () => {
    setFormText(''); setFormType('mcq'); setFormOptions(['', '', '', '']); setFormCorrect(''); setFormMarks('1');
    setEditingQuestion(null); setShowAddDialog(false);
  };

  const handleAddQuestion = async () => {
    if (!formText.trim()) return;
    const data: ParsedCSVRow = {
      question_text: formText,
      question_type: formType as any,
      options: formType === 'mcq' ? formOptions.filter(Boolean) : formType === 'true_false' ? ['True', 'False'] : [],
      correct_answer: formCorrect || undefined,
      marks: parseInt(formMarks) || 1,
    };
    await addQuestion.mutateAsync(data);
    resetForm();
  };

  const handleCSVParse = () => {
    const parsed = parseCSV(csvText);
    setCsvPreview(parsed);
  };

  const handleBulkSubmit = async () => {
    if (csvPreview.length === 0) return;
    await bulkUpload.mutateAsync(csvPreview);
  };

  const totalMarks = questions.reduce((s, q) => s + q.marks, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Exam Questions</h1>
          <p className="text-muted-foreground">Create, edit, and manage exam question banks</p>
        </div>
      </div>

      {/* Exam Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Label className="text-sm font-medium shrink-0">Select Exam:</Label>
            <Select value={selectedExamId} onValueChange={setSelectedExamId}>
              <SelectTrigger className="w-full sm:w-[400px]">
                <SelectValue placeholder="Choose an exam..." />
              </SelectTrigger>
              <SelectContent>
                {exams.map(exam => (
                  <SelectItem key={exam.id} value={exam.id}>
                    {exam.name} — {exam.exam_date} ({exam.question_count || 0} Qs)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedExamId && (
        <>
          {/* Stats & Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <div className="rounded-lg border px-4 py-2">
                <p className="text-xs text-muted-foreground">Questions</p>
                <p className="text-xl font-bold">{questions.length}</p>
              </div>
              <div className="rounded-lg border px-4 py-2">
                <p className="text-xs text-muted-foreground">Total Marks</p>
                <p className="text-xl font-bold">{totalMarks}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setCsvText(''); setCsvPreview([]); setShowCSVDialog(true); }}>
                <Upload className="mr-2 h-4 w-4" />Bulk Upload CSV
              </Button>
              <Button size="sm" onClick={() => { resetForm(); setShowAddDialog(true); }}>
                <Plus className="mr-2 h-4 w-4" />Add Question
              </Button>
            </div>
          </div>

          {/* Questions List */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
              ) : questions.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <FileText className="mx-auto mb-3 h-10 w-10 opacity-30" />
                  <p>No questions yet. Add questions manually or upload a CSV.</p>
                </div>
              ) : (
                <div>
                  {/* Desktop */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">#</TableHead>
                          <TableHead>Question</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-center">Options</TableHead>
                          <TableHead className="text-center">Answer</TableHead>
                          <TableHead className="text-center">Marks</TableHead>
                          <TableHead className="text-right w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {questions.map((q, i) => (
                          <TableRow key={q.id} className="hover:bg-muted/50">
                            <TableCell className="font-mono text-sm text-muted-foreground">{q.question_order || i + 1}</TableCell>
                            <TableCell className="max-w-[300px]">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <p className="text-sm font-medium truncate cursor-help">{q.question_text}</p>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-md"><p className="text-sm">{q.question_text}</p></TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">{q.question_type}</Badge>
                            </TableCell>
                            <TableCell className="text-center text-sm text-muted-foreground">
                              {q.options?.length || 0}
                            </TableCell>
                            <TableCell className="text-center">
                              {q.correct_answer ? (
                                <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-0 text-xs">{q.correct_answer}</Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center font-medium">{q.marks}</TableCell>
                            <TableCell className="text-right">
                              <TooltipProvider>
                                <div className="flex items-center justify-end gap-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                                        setEditingQuestion(q);
                                        setFormText(q.question_text);
                                        setFormType(q.question_type);
                                        setFormOptions(q.options?.length ? [...q.options, ...Array(4 - q.options.length).fill('')] : ['', '', '', '']);
                                        setFormCorrect(q.correct_answer || '');
                                        setFormMarks(String(q.marks));
                                        setShowAddDialog(true);
                                      }}>
                                        <Edit className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { if (confirm('Delete this question?')) deleteQuestion.mutate(q.id); }}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete</TooltipContent>
                                  </Tooltip>
                                </div>
                              </TooltipProvider>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile */}
                  <div className="space-y-2 p-3 md:hidden">
                    {questions.map((q, i) => (
                      <div key={q.id} className="rounded-lg border p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs text-muted-foreground">Q{q.question_order || i + 1}</span>
                              <Badge variant="outline" className="text-[10px]">{q.question_type}</Badge>
                              <span className="text-xs text-muted-foreground">{q.marks} marks</span>
                            </div>
                            <p className="text-sm font-medium line-clamp-2">{q.question_text}</p>
                            {q.correct_answer && <p className="text-xs text-emerald-600 mt-1">Answer: {q.correct_answer}</p>}
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-destructive" onClick={() => { if (confirm('Delete?')) deleteQuestion.mutate(q.id); }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Add/Edit Question Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add Question'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Question Text *</Label>
              <Textarea value={formText} onChange={(e) => setFormText(e.target.value)} rows={3} placeholder="Enter the question..." className="resize-none mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">MCQ</SelectItem>
                    <SelectItem value="true_false">True / False</SelectItem>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Marks</Label>
                <Input type="number" min="1" value={formMarks} onChange={(e) => setFormMarks(e.target.value)} className="mt-1" />
              </div>
            </div>

            {formType === 'mcq' && (
              <div className="space-y-2">
                <Label>Options (A-D)</Label>
                {formOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground w-4">{String.fromCharCode(65 + i)}.</span>
                    <Input value={opt} onChange={(e) => { const newOpts = [...formOptions]; newOpts[i] = e.target.value; setFormOptions(newOpts); }} placeholder={`Option ${String.fromCharCode(65 + i)}`} />
                  </div>
                ))}
              </div>
            )}

            {formType === 'true_false' && <p className="text-xs text-muted-foreground">Options will be: True, False</p>}
            {formType === 'short_answer' && <p className="text-xs text-muted-foreground">Students type a free-form answer.</p>}

            <div>
              <Label>Correct Answer (optional)</Label>
              <Input value={formCorrect} onChange={(e) => setFormCorrect(e.target.value)} placeholder={formType === 'mcq' ? 'e.g. B or 4' : formType === 'true_false' ? 'True or False' : ''} className="mt-1" />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={resetForm}>Cancel</Button>
              <Button className="flex-1" onClick={handleAddQuestion} disabled={!formText.trim() || addQuestion.isPending}>
                {addQuestion.isPending ? 'Saving...' : editingQuestion ? 'Update' : 'Add Question'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CSV Upload Dialog */}
      <Dialog open={showCSVDialog} onOpenChange={setShowCSVDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Upload Questions (CSV)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs font-semibold mb-2">Expected CSV Format:</p>
              <code className="text-[10px] break-all">question_text,description,type,option_a,option_b,option_c,option_d,correct_answer,marks</code>
            </div>

            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(CSV_TEMPLATE); }}>
              <Download className="mr-2 h-3.5 w-3.5" />Download Template
            </Button>

            <div>
              <Label>Paste CSV Content</Label>
              <Textarea
                value={csvText}
                onChange={(e) => { setCsvText(e.target.value); setCsvPreview([]); }}
                rows={8}
                placeholder="Paste your CSV data here..."
                className="font-mono text-xs resize-none mt-1"
              />
            </div>

            <Button variant="outline" size="sm" onClick={handleCSVParse} disabled={!csvText.trim()}>
              <FileText className="mr-2 h-3.5 w-3.5" />Preview ({csvPreview.length} questions)
            </Button>

            {csvPreview.length > 0 && (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">#</TableHead>
                      <TableHead className="text-xs">Question</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Options</TableHead>
                      <TableHead className="text-xs">Answer</TableHead>
                      <TableHead className="text-xs">Marks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvPreview.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs">{i + 1}</TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">{row.question_text}</TableCell>
                        <TableCell className="text-xs"><Badge variant="outline" className="text-[10px]">{row.question_type}</Badge></TableCell>
                        <TableCell className="text-xs">{row.options.length}</TableCell>
                        <TableCell className="text-xs">{row.correct_answer || '—'}</TableCell>
                        <TableCell className="text-xs">{row.marks}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => { setShowCSVDialog(false); setCsvText(''); setCsvPreview([]); }}>Cancel</Button>
              <Button className="flex-1" onClick={handleBulkSubmit} disabled={csvPreview.length === 0 || bulkUpload.isPending}>
                <Upload className="mr-2 h-4 w-4" />
                {bulkUpload.isPending ? 'Uploading...' : `Upload ${csvPreview.length} Questions`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
