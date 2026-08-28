'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Search, FileText, Upload, Clock, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { useAssignments, type Assignment } from '@/lib/hooks/useAssignments';

function getStatusBadge(status: Assignment['status']) {
  switch (status) {
    case 'pending': return <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
    case 'submitted': return <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400"><CheckCircle2 className="mr-1 h-3 w-3" />Submitted</Badge>;
    case 'graded': return <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="mr-1 h-3 w-3" />Graded</Badge>;
    case 'late': return <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"><AlertCircle className="mr-1 h-3 w-3" />Late</Badge>;
    case 'returned': return <Badge variant="outline" className="border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400"><RotateCcw className="mr-1 h-3 w-3" />Returned</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function AssignmentsPage() {
  const { data: assignments = [], isLoading } = useAssignments();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');

  const filtered = assignments.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.course_code.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || a.status === filter;
    return matchesSearch && matchesFilter;
  });

  const counts = {
    all: assignments.length,
    pending: assignments.filter(a => a.status === 'pending').length,
    submitted: assignments.filter(a => a.status === 'submitted').length,
    graded: assignments.filter(a => a.status === 'graded').length,
    returned: assignments.filter(a => a.status === 'returned').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground">Track and submit your coursework</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(counts).map(([key, count]) => (
          <Button
            key={key}
            variant={filter === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(key)}
            className="capitalize"
          >
            {key} <Badge variant="secondary" className="ml-2 text-xs">{count}</Badge>
          </Button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">All Assignments</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search assignments..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No assignments found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(a => (
                  <TableRow key={a.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm font-semibold">{a.course_code}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{a.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{a.description}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{a.due_date}</TableCell>
                    <TableCell className="text-sm">{a.max_marks}</TableCell>
                    <TableCell>{getStatusBadge(a.status)}</TableCell>
                    <TableCell className="font-medium">{a.grade !== undefined ? `${a.grade}/${a.max_marks}` : '—'}</TableCell>
                    <TableCell className="text-right">
                      <TooltipProvider>
                        <div className="flex items-center gap-1 justify-end">
                          {(a.status === 'pending' || a.status === 'returned') && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8">
                                  <Upload className="h-3.5 w-3.5 mr-1" />Submit
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Upload submission</TooltipContent>
                            </Tooltip>
                          )}
                          {a.status === 'graded' && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 text-xs">View Feedback</Button>
                              </TooltipTrigger>
                              <TooltipContent>{a.feedback || 'No feedback'}</TooltipContent>
                            </Tooltip>
                          )}
                          {a.allow_resubmit && (a.status === 'graded' || a.status === 'returned') && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8">
                                  <RotateCcw className="h-3.5 w-3.5 mr-1" />Resubmit
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Upload revised submission</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
