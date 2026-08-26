'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  useExamQuestions,
  useCreateExamQuestion,
  useBulkUploadQuestions,
  useDeleteExamQuestion,
} from '@/lib/hooks/useExamQuestions';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  Loader2,
  GripVertical,
  CheckCircle,
  FileText,
} from 'lucide-react';

export default function QuestionEditorPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = use(params);
  const router = useRouter();
  const { data: questionsData, isLoading } = useExamQuestions(examId);
  const createQuestion = useCreateExamQuestion();
  const bulkUpload = useBulkUploadQuestions();
  const deleteQuestion = useDeleteExamQuestion();

  const questions = questionsData?.data || [];
  const totalMarks = questions.reduce((sum, q) => sum + Number(q.marks), 0);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [newQ, setNewQ] = useState({
    question_text: '',
    question_type: 'mcq' as string,
    options: ['', '', '', ''],
    correct_answer: '',
    marks: 1,
  });
  const [csvText, setCsvText] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddQuestion = async () => {
    const e: Record<string, string> = {};
    if (!newQ.question_text.trim()) e.question_text = 'Required';
    const validOptions = newQ.options.filter(o => o.trim());
    if (validOptions.length < 2) e.options = 'At least 2 options required';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    try {
      await createQuestion.mutateAsync({
        examId,
        question_text: newQ.question_text,
        question_type: newQ.question_type,
        options: validOptions,
        correct_answer: newQ.correct_answer || undefined,
        marks: newQ.marks,
      });
      setNewQ({ question_text: '', question_type: 'mcq', options: ['', '', '', ''], correct_answer: '', marks: 1 });
      setShowAddForm(false);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed' });
    }
  };

  const handleBulkUpload = async () => {
    // Parse CSV: question_text, option1, option2, option3, option4, correct_answer, marks
    const lines = csvText.trim().split('\n').filter(l => l.trim());
    const parsed = lines.map(line => {
      const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      return {
        question_text: cols[0] || '',
        question_type: 'mcq',
        options: cols.slice(1, 5).filter(Boolean),
        correct_answer: cols[5] || undefined,
        marks: Number(cols[6]) || 1,
      };
    }).filter(q => q.question_text && q.options.length >= 2);

    if (parsed.length === 0) {
      setErrors({ csv: 'No valid questions found. Format: question, opt1, opt2, opt3, opt4, correct, marks' });
      return;
    }

    try {
      await bulkUpload.mutateAsync({ examId, questions: parsed });
      setCsvText('');
      setShowBulkUpload(false);
    } catch (err) {
      setErrors({ csv: err instanceof Error ? err.message : 'Bulk upload failed' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    await deleteQuestion.mutateAsync(id);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Question Bank</h1>
            <p className="text-muted-foreground text-sm">{questions.length} questions · {totalMarks} total marks</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setShowBulkUpload(!showBulkUpload); setShowAddForm(false); }}>
            <Upload className="h-4 w-4 mr-1.5" /> Bulk Upload
          </Button>
          <Button size="sm" onClick={() => { setShowAddForm(!showAddForm); setShowBulkUpload(false); }}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Question
          </Button>
        </div>
      </div>

      {/* Bulk Upload */}
      {showBulkUpload && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Bulk Upload (CSV)</CardTitle>
            <CardDescription className="text-xs">Format: question, option1, option2, option3, option4, correct_answer, marks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <textarea
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              placeholder={'What is 2+2?, 3, 4, 5, 6, 4, 1\nCapital of India?, Delhi, Mumbai, Kolkata, Chennai, Delhi, 1'}
              className="w-full h-40 rounded-md border border-input bg-transparent px-3 py-2 text-sm font-mono"
            />
            {errors.csv && <p className="text-destructive text-xs">{errors.csv}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowBulkUpload(false)}>Cancel</Button>
              <Button size="sm" onClick={handleBulkUpload} disabled={bulkUpload.isPending}>
                {bulkUpload.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1" />}
                Upload {csvText.trim().split('\n').filter(l => l.trim()).length} Questions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Question Form */}
      {showAddForm && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Add Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1">Question Text <span className="text-destructive">*</span></label>
              <textarea
                value={newQ.question_text}
                onChange={e => setNewQ(p => ({ ...p, question_text: e.target.value }))}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                rows={2}
                placeholder="Enter the question..."
              />
              {errors.question_text && <p className="text-destructive text-xs mt-0.5">{errors.question_text}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium">Options <span className="text-destructive">*</span></label>
              {newQ.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct"
                    checked={newQ.correct_answer === opt && opt.trim() !== ''}
                    onChange={() => setNewQ(p => ({ ...p, correct_answer: opt }))}
                    disabled={!opt.trim()}
                    className="shrink-0"
                    title="Mark as correct"
                  />
                  <Input
                    value={opt}
                    onChange={e => {
                      const opts = [...newQ.options];
                      opts[i] = e.target.value;
                      setNewQ(p => ({ ...p, options: opts }));
                    }}
                    placeholder={`Option ${i + 1}`}
                    className="text-sm"
                  />
                </div>
              ))}
              {errors.options && <p className="text-destructive text-xs">{errors.options}</p>}
              <p className="text-xs text-muted-foreground">Click the radio button next to the correct answer</p>
            </div>

            <div className="flex gap-3">
              <div className="w-32">
                <label className="block text-xs font-medium mb-1">Marks</label>
                <Input type="number" value={newQ.marks} onChange={e => setNewQ(p => ({ ...p, marks: Number(e.target.value) }))} min={0.5} step={0.5} />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium mb-1">Type</label>
                <select value={newQ.question_type} onChange={e => setNewQ(p => ({ ...p, question_type: e.target.value }))} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                  <option value="mcq">Multiple Choice</option>
                  <option value="true_false">True/False</option>
                </select>
              </div>
            </div>

            {errors.submit && <p className="text-destructive text-xs">{errors.submit}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button size="sm" onClick={handleAddQuestion} disabled={createQuestion.isPending}>
                {createQuestion.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
                Add Question
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : questions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No questions yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add questions manually or bulk upload via CSV</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {questions.map((q, i) => (
            <Card key={q.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2 shrink-0 pt-0.5">
                    <GripVertical className="h-4 w-4 text-muted-foreground/40" />
                    <span className="text-xs font-mono text-muted-foreground w-6 text-right">{i + 1}.</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{q.question_text}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {q.options.map((opt, j) => (
                        <Badge
                          key={j}
                          variant={opt === q.correct_answer ? 'default' : 'outline'}
                          className={`text-xs ${opt === q.correct_answer ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30' : ''}`}
                        >
                          {String.fromCharCode(65 + j)}. {opt}
                          {opt === q.correct_answer && <CheckCircle className="h-3 w-3 ml-1" />}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-[10px]">{q.marks} mark{q.marks !== 1 ? 's' : ''}</Badge>
                      <Badge variant="outline" className="text-[10px]">{q.question_type}</Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost" size="sm"
                    className="h-7 px-2 text-destructive hover:text-destructive shrink-0"
                    onClick={() => handleDelete(q.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
