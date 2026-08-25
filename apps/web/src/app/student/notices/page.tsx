'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar } from 'lucide-react';

const notices = [
  { title: 'Mid-Semester Exam Schedule Released', content: 'The mid-semester examination schedule for Odd Semester 2025 has been published. Please check the exam portal for your individual timetable.', date: 'Aug 20, 2025', audience: 'all' },
  { title: 'Library Hours Extended During Exams', content: 'The central library will remain open until 10 PM during the examination period (Oct 10 - Oct 25).', date: 'Aug 19, 2025', audience: 'students' },
  { title: 'Annual Day Rehearsals', content: 'All students participating in annual day cultural programs are requested to attend rehearsals in the auditorium.', date: 'Aug 18, 2025', audience: 'students' },
];

export default function StudentNoticesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notices</h1>
        <p className="text-muted-foreground">View notices and announcements from your institution.</p>
      </div>

      <div className="space-y-4">
        {notices.map((notice, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-500/10 text-yellow-600 shrink-0">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{notice.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{notice.content}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {notice.date}
                      </span>
                      <Badge variant="secondary" className="text-xs">{notice.audience}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
