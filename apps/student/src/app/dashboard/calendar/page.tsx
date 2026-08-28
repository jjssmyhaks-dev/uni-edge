'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, GraduationCap, PartyPopper, FileText, Clock } from 'lucide-react';

const EVENTS = [
  { id: '1', title: 'Semester 1 Begins', date: '2026-07-25', type: 'semester', icon: GraduationCap },
  { id: '2', title: 'Registration Window Opens', date: '2026-10-01', type: 'registration', icon: FileText },
  { id: '3', title: 'Independence Day (Holiday)', date: '2026-08-15', type: 'holiday', icon: PartyPopper },
  { id: '4', title: 'Mid-Term Exams Begin', date: '2026-10-05', type: 'exam', icon: CalendarIcon },
  { id: '5', title: 'Mid-Term Exams End', date: '2026-10-12', type: 'exam', icon: CalendarIcon },
  { id: '6', title: 'Assignment Deadline (Physics)', date: '2026-09-25', type: 'deadline', icon: FileText },
  { id: '7', title: 'Registration Window Closes', date: '2026-10-30', type: 'registration', icon: Clock },
  { id: '8', title: 'Gandhi Jayanti (Holiday)', date: '2026-10-02', type: 'holiday', icon: PartyPopper },
  { id: '9', title: 'Semester 1 End', date: '2026-12-15', type: 'semester', icon: GraduationCap },
  { id: '10', title: 'Final Exams Begin', date: '2026-11-25', type: 'exam', icon: CalendarIcon },
];

const TYPE_COLORS: Record<string, { badge: string; dot: string }> = {
  semester: { badge: 'bg-primary/10 text-primary', dot: 'bg-primary' },
  registration: { badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  holiday: { badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  exam: { badge: 'bg-purple-500/10 text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' },
  deadline: { badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
};

export default function CalendarPage() {
  const sorted = [...EVENTS].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Academic Calendar</h1>
        <p className="text-muted-foreground">Semester schedule, holidays, exams, and deadlines</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(TYPE_COLORS).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
            <span className="text-xs text-muted-foreground capitalize">{type}</span>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border" />
            <div className="space-y-6">
              {sorted.map(event => {
                const colors = TYPE_COLORS[event.type];
                const Icon = event.icon;
                const dateObj = new Date(event.date);
                const month = dateObj.toLocaleDateString('en-IN', { month: 'short' });
                const day = dateObj.getDate();
                const isPast = dateObj < new Date();
                return (
                  <div key={event.id} className={`flex gap-4 items-start ${isPast ? 'opacity-50' : ''}`}>
                    <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background border-2 border-border">
                      <div className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="text-center min-w-[40px]">
                          <p className="text-xs text-muted-foreground uppercase">{month}</p>
                          <p className="text-lg font-bold leading-none">{day}</p>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{event.title}</p>
                            <Badge variant="outline" className={`text-[10px] capitalize ${colors.badge}`}>{event.type}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
