'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, Building2, MapPin, Calendar, ExternalLink, Clock } from 'lucide-react';
import { useJobPostings, type JobPosting } from '@/lib/hooks/useExtras';

function getTypeBadge(type: string) {
  switch (type) {
    case 'internship': return <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-0">Internship</Badge>;
    case 'full_time': return <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-0">Full-Time</Badge>;
    case 'part_time': return <Badge className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border-0">Part-Time</Badge>;
    case 'contract': return <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-0">Contract</Badge>;
    default: return <Badge variant="secondary">{type}</Badge>;
  }
}

export default function CareerPage() {
  const { data: postings = [], isLoading } = useJobPostings();

  const companies = new Set(postings.map(p => p.company_name)).size;
  const closingSoon = postings.filter(p => {
    if (!p.deadline) return false;
    const daysUntil = (new Date(p.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysUntil > 0 && daysUntil <= 7;
  }).length;

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
              <p className="text-2xl font-bold">{postings.length}</p>
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
              <p className="text-2xl font-bold">{companies}</p>
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
              <p className="text-2xl font-bold">{closingSoon}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
      ) : postings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Briefcase className="mx-auto mb-3 h-10 w-10 opacity-30" />
            <p>No job postings available yet</p>
            <p className="text-xs mt-1">Check back later for opportunities from our placement cell</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {postings.map(posting => (
            <Card key={posting.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{posting.title}</h3>
                      {getTypeBadge(posting.job_type)}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{posting.company_name}</span>
                      {posting.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{posting.location}</span>}
                      {posting.is_remote && <Badge variant="outline" className="text-xs">Remote</Badge>}
                      {posting.deadline && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Deadline: {posting.deadline}</span>}
                      {posting.salary_range && <span className="font-semibold text-foreground">{posting.salary_range}</span>}
                    </div>
                    {posting.description && <p className="text-sm text-muted-foreground mb-3">{posting.description}</p>}
                    {posting.required_skills && posting.required_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {posting.required_skills.map(s => (
                          <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                    )}
                    {posting.eligibility && (
                      <p className="text-xs text-muted-foreground mt-2">Eligibility: {posting.eligibility}</p>
                    )}
                  </div>
                  <div className="shrink-0 space-y-2">
                    {posting.application_link && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={posting.application_link} target="_blank" rel="noopener noreferrer">
                          Apply <ExternalLink className="h-3.5 w-3.5 ml-1" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
