'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, GraduationCap, PartyPopper, FileText, Clock } from 'lucide-react';
import { useCalendarEvents, type CalendarEvent } from '@/lib/hooks/useStudentData';

const TYPE_COLORS: Record<string, { badge: string; dot: string }> = {
  exam: { badge: 'bg-purple-500/10 text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' },
  holiday: { badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  deadline: { badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  registration: { badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  event: { badge: 'bg-primary/10 text-primary', dot: 'bg-primary' },
};

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  exam: CalendarIcon,
  holiday: PartyPopper,
  deadline: FileText,
  registration: FileText,
  event: GraduationCap,
};

export default function CalendarPage() {
  const { data: events = [], isLoading } = useCalendarEvents();
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));

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
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
          ) : sorted.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <CalendarIcon className="mx-auto mb-3 h-10 w-10 opacity-30" />
              <p>No events in the calendar</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border" />
              <div className="space-y-6">
                {sorted.map(event => {
                  const colors = TYPE_COLORS[event.type] || TYPE_COLORS.event;
                  const Icon = TYPE_ICONS[event.type] || CalendarIcon;
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
                            {event.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
