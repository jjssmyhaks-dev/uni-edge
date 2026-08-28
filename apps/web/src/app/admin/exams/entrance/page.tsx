'use client';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useEntranceExams, useLockExam } from '@/lib/hooks/useEntranceExams';
import { Plus, Loader2, ClipboardList, FileText, Lock } from 'lucide-react';

const SC: Record<string, string> = {
  draft: 'bg-gray-500/15 text-gray-700 dark:text-gray-400',
  under_review: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  locked: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  completed: 'bg-green-500/15 text-green-700 dark:text-green-400',
};

export default function EntranceExamsPage() {
  const { data, isLoading } = useEntranceExams();
  const lockExam = useLockExam();
  const exams = data?.data || [];
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div><h1 className='text-2xl font-bold tracking-tight'>Entrance Exams</h1>
        <p className='text-muted-foreground text-sm'>Create and manage entrance examinations</p></div>
        <Button asChild><Link href='/admin/exams/entrance/new'><Plus className='h-4 w-4 mr-1.5' /> Create Exam</Link></Button>
      </div>
      {isLoading ? (<div className='flex items-center justify-center py-12'><Loader2 className='h-6 w-6 animate-spin text-muted-foreground' /></div>)
      : exams.length === 0 ? (<Card><CardContent className='py-12 text-center'><ClipboardList className='h-10 w-10 text-muted-foreground mx-auto mb-3' /><p className='text-muted-foreground'>No entrance exams yet</p></CardContent></Card>)
      : (
        <div className='w-full rounded-lg border bg-card'>
          <Table><TableHeader><TableRow className='border-b hover:bg-transparent'>
            <TableHead className='h-12 px-4 font-medium'>Exam Name</TableHead>
            <TableHead className='h-12 px-4 font-medium'>Status</TableHead>
            <TableHead className='h-12 px-4 font-medium'>Mode</TableHead>
            <TableHead className='h-12 px-4 font-medium'>Date</TableHead>
            <TableHead className='h-12 px-4 font-medium'>Duration</TableHead>
            <TableHead className='h-12 w-[180px] px-4 font-medium'>Actions</TableHead>
          </TableRow></TableHeader><TableBody>
            {exams.map((exam: any) => (
              <TableRow key={exam.id} className='hover:bg-muted/50'>
                <TableCell className='h-16 px-4 font-medium'>{exam.name}</TableCell>
                <TableCell className='h-16 px-4'><Badge variant='secondary' className={SC[exam.status] || ''}>{exam.status}</Badge></TableCell>
                <TableCell className='h-16 px-4'><Badge variant='outline' className='text-xs'>{exam.mode || '—'}</Badge></TableCell>
                <TableCell className='h-16 px-4 text-sm text-muted-foreground'>{exam.exam_date ? new Date(exam.exam_date).toLocaleDateString('en-IN') : '—'}</TableCell>
                <TableCell className='h-16 px-4 text-sm text-muted-foreground'>{exam.duration_minutes ? exam.duration_minutes + ' min' : '—'}</TableCell>
                <TableCell className='h-16 px-4'><TooltipProvider><div className='flex items-center gap-1'>
                  <Tooltip><TooltipTrigger asChild><Button variant='outline' size='icon' className='h-8 w-8' asChild><Link href={'/admin/exams/entrance/' + exam.id + '/questions'}><FileText className='size-4' /></Link></Button></TooltipTrigger><TooltipContent>Questions</TooltipContent></Tooltip>
                  {exam.status === 'draft' && <Tooltip><TooltipTrigger asChild><Button variant='outline' size='icon' className='h-8 w-8' onClick={() => lockExam.mutate(exam.id)} disabled={lockExam.isPending}><Lock className='size-4' /></Button></TooltipTrigger><TooltipContent>Lock Exam</TooltipContent></Tooltip>}
                </div></TooltipProvider></TableCell>
              </TableRow>))}
          </TableBody></Table>
        </div>)}
    </div>);
}