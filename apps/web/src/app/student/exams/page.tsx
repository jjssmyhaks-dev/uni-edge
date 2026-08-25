'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Download, AlertCircle } from 'lucide-react';

const exams = [
  { name: 'CS301 — Data Structures', date: 'Dec 10, 2025', time: '9:00 AM - 12:00 PM', duration: '3 hours', room: 'Room 101, Block A', hallTicket: true, status: 'scheduled' },
  { name: 'CS302 — Operating Systems', date: 'Dec 12, 2025', time: '2:00 PM - 5:00 PM', duration: '3 hours', room: 'Room 102, Block A', hallTicket: true, status: 'scheduled' },
  { name: 'CS303 — Computer Networks', date: 'Dec 15, 2025', time: '9:00 AM - 12:00 PM', duration: '3 hours', room: 'TBD', hallTicket: false, status: 'pending' },
  { name: 'CS304 — Database Systems', date: 'Dec 18, 2025', time: '2:00 PM - 4:00 PM', duration: '2 hours', room: 'TBD', hallTicket: false, status: 'pending' },
];

export default function StudentExamsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exam Schedule</h1>
        <p className="text-muted-foreground">View your upcoming examinations and download hall tickets.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exams.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hall Tickets Ready</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{exams.filter(e => e.hallTicket).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{exams.filter(e => !e.hallTicket).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Exam List */}
      <div className="space-y-4">
        {exams.map((exam, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 shrink-0">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{exam.name}</h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {exam.date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {exam.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {exam.room}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {exam.hallTicket ? (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Hall Ticket
                    </Button>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Ticket Pending
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
