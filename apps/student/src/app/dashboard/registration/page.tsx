'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ClipboardList, CheckCircle2, AlertCircle, Users, Clock, Info } from 'lucide-react';
import { useRegistration } from '@/lib/hooks/useRegistration';

export default function RegistrationPage() {
  const { data } = useRegistration();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { window: regWindow, courses } = data || { window: null, courses: [] };

  const toggleCourse = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedCredits = courses.filter(c => selected.has(c.id)).reduce((s, c) => s + c.credits, 0);
  const canSubmit = regWindow?.status === 'open' && selected.size > 0 && regWindow && selectedCredits >= regWindow.min_credits && selectedCredits <= regWindow.max_credits;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Semester Registration</h1>
        <p className="text-muted-foreground">Register for upcoming semester courses</p>
      </div>

      {/* Registration Window Info */}
      {regWindow && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{regWindow.semester}</p>
                  <p className="text-xs text-muted-foreground">Registration Window</p>
                </div>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{regWindow.start_date} → {regWindow.end_date}</p>
                  <p className="text-xs text-muted-foreground">Dates</p>
                </div>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div>
                <p className="text-sm font-medium">{regWindow.min_credits}–{regWindow.max_credits} credits</p>
                <p className="text-xs text-muted-foreground">Required range</p>
              </div>
              <div className="ml-auto">
                <Badge variant={regWindow.status === 'open' ? 'default' : regWindow.status === 'upcoming' ? 'outline' : 'secondary'} className="capitalize">
                  {regWindow.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Credit Counter */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Credits Selected</span>
            <span className="text-sm text-muted-foreground">{selectedCredits} / {regWindow?.max_credits || 22}</span>
          </div>
          <Progress value={regWindow ? (selectedCredits / regWindow.max_credits) * 100 : 0} className="h-2" />
        </div>
        <Button disabled={!canSubmit}>
          <CheckCircle2 className="h-4 w-4 mr-2" />Confirm Registration
        </Button>
      </div>

      {/* Course List */}
      <div className="space-y-3">
        {courses.map(course => {
          const isSelected = selected.has(course.id);
          const isFull = course.enrolled >= course.capacity;
          const seatPercent = (course.enrolled / course.capacity) * 100;

          return (
            <Card
              key={course.id}
              className={`transition-all ${isSelected ? 'ring-2 ring-primary' : ''} ${isFull && !isSelected ? 'opacity-60' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleCourse(course.id)}
                    disabled={isFull && !isSelected}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-sm font-semibold">{course.course_code}</span>
                      <Badge variant={course.type === 'core' ? 'default' : course.type === 'elective' ? 'secondary' : 'outline'} className="text-xs capitalize">{course.type}</Badge>
                    </div>
                    <p className="font-medium">{course.course_name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{course.instructor} · {course.schedule} · {course.credits} credits</p>
                    {course.prerequisites.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Prerequisites: {course.prerequisites.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{course.enrolled}/{course.capacity}</span>
                    </div>
                    <div className="w-24 mt-1">
                      <Progress value={seatPercent} className="h-1.5" />
                    </div>
                    {isFull && (
                      <Badge variant="destructive" className="text-[10px] mt-1">Full</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
