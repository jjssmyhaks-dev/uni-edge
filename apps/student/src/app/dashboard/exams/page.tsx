'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Download, Timer, Play } from 'lucide-react';
import { useExams } from '@/lib/hooks/useExams';

function getTypeBadge(type: string) {
  switch (type) {
    case 'midterm': return <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-400">Mid-Term</Badge>;
    case 'final': return <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400">Final</Badge>;
    case 'quiz': return <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400">Quiz</Badge>;
    case 'practical': return <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">Practical</Badge>;
    default: return <Badge variant="secondary">{type}</Badge>;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'upcoming': return <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-0">Upcoming</Badge>;
    case 'ongoing': return <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-0">Ongoing</Badge>;
    case 'completed': return <Badge variant="secondary">Completed</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function ExamsPage() {
  const { data: exams = [], isLoading } = useExams();

  const upcoming = exams.filter(e => e.status === 'upcoming');
  const completed = exams.filter(e => e.status === 'completed');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Exam Schedule</h1>
        <p className="text-muted-foreground">View upcoming exams and download hall tickets</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Upcoming</p>
              <p className="text-2xl font-bold">{upcoming.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
              <Timer className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{completed.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Next Exam</p>
              <p className="text-lg font-bold">{upcoming.length > 0 ? upcoming[0].date : 'None'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Exams */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Upcoming Exams</CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No upcoming exams</p>
          ) : (
            <div>
              {/* Desktop: Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Venue</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcoming.map(exam => (
                      <TableRow key={exam.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-sm font-semibold">{exam.course_code}</TableCell>
                        <TableCell className="font-medium">{exam.exam_name}</TableCell>
                        <TableCell>{getTypeBadge(exam.type)}</TableCell>
                        <TableCell className="text-sm">{exam.date}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{exam.time}</TableCell>
                        <TableCell className="text-sm">{exam.duration_minutes} min</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{exam.venue}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/exam-take?examId=${exam.id}`}>
                              <Button size="sm" className="h-8">
                                <Play className="h-3.5 w-3.5 mr-1" />Take Exam
                              </Button>
                            </Link>
                            {exam.hall_ticket_available && (
                              <Button variant="outline" size="sm" className="h-8">
                                <Download className="h-3.5 w-3.5 mr-1" />Hall Ticket
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Mobile: Cards */}
              <div className="space-y-3 md:hidden">
                {upcoming.map(exam => (
                  <div key={exam.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-semibold text-muted-foreground">{exam.course_code}</span>
                          {getTypeBadge(exam.type)}
                        </div>
                        <p className="font-medium text-sm">{exam.exam_name}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {exam.date}</div>
                      <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {exam.time}</div>
                      <div className="flex items-center gap-1"><Timer className="h-3 w-3" /> {exam.duration_minutes} min</div>
                      <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {exam.venue}</div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Link href={`/exam-take?examId=${exam.id}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          <Play className="h-3.5 w-3.5 mr-1" />Take Exam
                        </Button>
                      </Link>
                      {exam.hall_ticket_available && (
                        <Button variant="outline" size="sm" className="flex-1">
                          <Download className="h-3.5 w-3.5 mr-1" />Hall Ticket
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
