'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, Building2, MapPin, Calendar, ExternalLink, Clock } from 'lucide-react';

const POSTINGS = [
  { id: '1', title: 'Software Engineering Intern', company: 'Infosys', location: 'Pune (Hybrid)', type: 'Internship', stipend: '₹15,000/month', deadline: '2026-10-15', posted: '2026-09-15', description: '6-month internship in web development. Working with React, Node.js, and PostgreSQL.', skills: ['React', 'Node.js', 'SQL'] },
  { id: '2', title: 'Data Analyst', company: 'TCS', location: 'Mumbai', type: 'Full-Time', stipend: '₹4.5 LPA', deadline: '2026-10-20', posted: '2026-09-18', description: 'Entry-level data analyst role. Work with large datasets, create dashboards, and support business decisions.', skills: ['Python', 'SQL', 'Excel'] },
  { id: '3', title: 'Campus Ambassador', company: 'Google', location: 'Remote', type: 'Part-Time', stipend: '₹5,000/month + swags', deadline: '2026-10-05', posted: '2026-09-20', description: 'Represent Google on your campus. Organize events, workshops, and grow the developer community.', skills: ['Communication', 'Leadership'] },
  { id: '4', title: 'Cloud Engineering Intern', company: 'Amazon Web Services', location: 'Hyderabad', type: 'Internship', stipend: '₹25,000/month', deadline: '2026-10-25', posted: '2026-09-22', description: 'Work on cloud infrastructure projects. Learn AWS services, automation, and distributed systems.', skills: ['AWS', 'Linux', 'Python'] },
];

function getTypeBadge(type: string) {
  switch (type) {
    case 'Internship': return <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-0">Internship</Badge>;
    case 'Full-Time': return <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-0">Full-Time</Badge>;
    case 'Part-Time': return <Badge className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border-0">Part-Time</Badge>;
    default: return <Badge variant="secondary">{type}</Badge>;
  }
}

export default function CareerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Career Board</h1>
        <p className="text-muted-foreground">Browse job and internship opportunities from our placement cell</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Open Positions</p>
              <p className="text-2xl font-bold">{POSTINGS.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Companies</p>
              <p className="text-2xl font-bold">{new Set(POSTINGS.map(p => p.company)).size}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Closing Soon</p>
              <p className="text-2xl font-bold">1</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {POSTINGS.map(posting => (
          <Card key={posting.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{posting.title}</h3>
                    {getTypeBadge(posting.type)}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{posting.company}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{posting.location}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Deadline: {posting.deadline}</span>
                    <span className="font-semibold text-foreground">{posting.stipend}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{posting.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {posting.skills.map(s => (
                      <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="shrink-0">
                  Apply <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
