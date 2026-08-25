'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface ScoreRow {
  enrollment_number: string;
  marks_obtained: number;
  grade?: string;
  grade_points?: number;
}

interface BulkScoreUploadProps {
  examId: string;
  totalMarks: number;
  onUpload: (results: ScoreRow[]) => Promise<void>;
}

export function BulkScoreUpload({ examId, totalMarks, onUpload }: BulkScoreUploadProps) {
  const [parsedData, setParsedData] = useState<ScoreRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: number; failed: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) {
      setErrors(['CSV must have a header row and at least one data row']);
      return;
    }

    const header = lines[0].toLowerCase().split(',').map(h => h.trim());
    const enrollIdx = header.findIndex(h => h.includes('enrollment') || h.includes('roll'));
    const marksIdx = header.findIndex(h => h.includes('marks') || h.includes('score'));

    if (enrollIdx === -1 || marksIdx === -1) {
      setErrors(['CSV must have columns: enrollment_number, marks_obtained']);
      return;
    }

    const data: ScoreRow[] = [];
    const errs: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim());
      const enrollmentNumber = cols[enrollIdx];
      const marks = parseFloat(cols[marksIdx]);

      if (!enrollmentNumber) {
        errs.push(`Row ${i + 1}: Missing enrollment number`);
        continue;
      }
      if (isNaN(marks) || marks < 0 || marks > totalMarks) {
        errs.push(`Row ${i + 1}: Invalid marks (must be 0-${totalMarks})`);
        continue;
      }

      data.push({
        enrollment_number: enrollmentNumber,
        marks_obtained: marks,
      });
    }

    setParsedData(data);
    setErrors(errs);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) return;
    setUploading(true);
    try {
      await onUpload(parsedData);
      setUploadResult({ success: parsedData.length, failed: 0 });
      setParsedData([]);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      setUploadResult({ success: 0, failed: parsedData.length });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csv = 'enrollment_number,marks_obtained\nDTU-CSE-2024-001,85\nDTU-CSE-2024-002,92\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `score-upload-template-${examId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Bulk Score Upload</CardTitle>
        <CardDescription>Upload marks via CSV file. Download the template first.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <FileText className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <div>
            <input ref={fileRef} type="file" accept=".csv,.xlsx" onChange={handleFileChange} className="hidden" />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3">
            <div className="flex items-center gap-2 text-destructive text-sm font-medium mb-2">
              <AlertTriangle className="h-4 w-4" /> {errors.length} validation error(s)
            </div>
            <ul className="text-xs text-destructive/80 space-y-1">
              {errors.slice(0, 5).map((err, i) => <li key={i}>• {err}</li>)}
              {errors.length > 5 && <li>... and {errors.length - 5} more</li>}
            </ul>
          </div>
        )}

        {parsedData.length > 0 && (
          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="text-sm font-medium">{parsedData.length} rows ready to upload</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {parsedData.slice(0, 5).map((row, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {row.enrollment_number}: {row.marks_obtained}/{totalMarks}
                </Badge>
              ))}
              {parsedData.length > 5 && <Badge variant="secondary" className="text-xs">+{parsedData.length - 5} more</Badge>}
            </div>
          </div>
        )}

        {uploadResult && (
          <div className={`rounded-lg border p-3 ${uploadResult.failed > 0 ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-green-500/50 bg-green-500/5'}`}>
            <div className="flex items-center gap-2">
              {uploadResult.failed > 0 ? <AlertTriangle className="h-4 w-4 text-yellow-500" /> : <CheckCircle2 className="h-4 w-4 text-green-500" />}
              <p className="text-sm">
                {uploadResult.success} scores uploaded successfully
                {uploadResult.failed > 0 && `, ${uploadResult.failed} failed`}
              </p>
            </div>
          </div>
        )}

        {parsedData.length > 0 && (
          <Button onClick={handleUpload} disabled={uploading || errors.length > 0}>
            {uploading ? 'Uploading...' : `Upload ${parsedData.length} Scores`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
