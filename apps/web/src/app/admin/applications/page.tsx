'use client';

import { useState } from 'react';
import { useApplications } from '@/lib/hooks/useApplications';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Users, Search, Download, CheckCircle, XCircle, Clock, Eye, Loader2 } from 'lucide-react';

function getStatusBadge(status: string) {
  const s: Record<string, string> = {
    submitted: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
    under_review: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    shortlisted: 'bg-purple-500/15 text-purple-700 dark:text-purple-400',
    offered: 'bg-green-500/15 text-green-700 dark:text-green-400',
    confirmed: 'bg-green-500/15 text-green-700 dark:text-green-400',
    rejected: 'bg-rose-500/15 text-rose-700 dark:text-rose-400',
  };
  return <Badge variant='outline' className={s[status] || 'bg-gray-500/15 text-gray-700'}>{(status || 'submitted').replace(/_/g, ' ')}</Badge>;
}

export default function ApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const { data: applicationsData, isLoading } = useApplications();
  const applications = applicationsData?.data || [];
  const filtered = applications.filter(app => {
    const ms = (app.applicant_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (app.applicant_email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const mf = selectedStatus === 'all' || app.status === selectedStatus;
    return ms && mf;
  });
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div><h1 className='text-2xl font-bold tracking-tight'>Applications</h1>
        <p className='text-sm text-muted-foreground mt-1'>Review and manage admission applications</p></div>
        <Button variant='outline' size='sm'><Download className='w-4 h-4 mr-1.5' /> Export</Button>
      </div>
      <div className='flex items-center gap-3'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <Input placeholder='Search by name or email...' value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className='pl-9' />
        </div>
      </div>
      {isLoading ? (
        <div className='flex items-center justify-center py-12'><Loader2 className='w-6 h-6 animate-spin text-muted-foreground' /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className='py-12 text-center'><Users className='w-12 h-12 text-muted-foreground mx-auto mb-3' /><p className='text-muted-foreground'>No applications found</p></CardContent></Card>
      ) : (
        <div className='rounded-lg border bg-card'>
          <Table>
            <TableHeader><TableRow className='border-b hover:bg-transparent'>
              <TableHead className='h-12 px-4 font-medium'>Applicant</TableHead>
              <TableHead className='h-12 px-4 font-medium'>Program</TableHead>
              <TableHead className='h-12 px-4 font-medium'>Status</TableHead>
              <TableHead className='h-12 px-4 font-medium'>Applied</TableHead>
              <TableHead className='h-12 w-[180px] px-4 font-medium'>Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.map(app => (
                <TableRow key={app.id} className='hover:bg-muted/50'>
                  <TableCell className='h-16 px-4'><div><p className='font-medium'>{app.applicant_name || 'N/A'}</p><p className='text-sm text-muted-foreground'>{app.applicant_email || 'N/A'}</p></div></TableCell>
                  <TableCell className='h-16 px-4 text-sm text-muted-foreground'>{app.admission_cycles?.programs?.name || 'N/A'}</TableCell>
                  <TableCell className='h-16 px-4'>{getStatusBadge(app.status)}</TableCell>
                  <TableCell className='h-16 px-4 text-sm text-muted-foreground'>{new Date(app.created_at).toLocaleDateString('en-IN')}</TableCell>
                  <TableCell className='h-16 px-4'>
                    <TooltipProvider><div className='flex items-center gap-1'>
                      <Tooltip><TooltipTrigger asChild><Button variant='outline' size='icon' className='h-8 w-8'><Eye className='size-4' /></Button></TooltipTrigger><TooltipContent>View</TooltipContent></Tooltip>
                      {app.status === 'submitted' && <Tooltip><TooltipTrigger asChild><Button variant='outline' size='icon' className='h-8 w-8'><Clock className='size-4' /></Button></TooltipTrigger><TooltipContent>Review</TooltipContent></Tooltip>}
                      {(app.status === 'under_review' || app.status === 'shortlisted') && <Tooltip><TooltipTrigger asChild><Button variant='outline' size='icon' className='h-8 w-8'><CheckCircle className='size-4' /></Button></TooltipTrigger><TooltipContent>Shortlist</TooltipContent></Tooltip>}
                      {app.status !== 'rejected' && app.status !== 'confirmed' && <Tooltip><TooltipTrigger asChild><Button variant='outline' size='icon' className='h-8 w-8 text-destructive hover:bg-destructive hover:text-white'><XCircle className='size-4' /></Button></TooltipTrigger><TooltipContent>Reject</TooltipContent></Tooltip>}
                    </div></TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}