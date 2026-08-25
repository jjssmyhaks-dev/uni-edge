'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ClipboardList, Plus, Calendar, MapPin, Users, FileText } from 'lucide-react';
import Link from 'next/link';

const examTabs = [
  { id: 'exams', label: 'Exams', icon: <ClipboardList className="h-4 w-4" /> },
  { id: 'rooms', label: 'Rooms', icon: <MapPin className="h-4 w-4" /> },
  { id: 'invigilators', label: 'Invigilators', icon: <Users className="h-4 w-4" /> },
  { id: 'results', label: 'Results', icon: <FileText className="h-4 w-4" /> },
];

const termLabels: Record<string, string> = {
  mid_semester: 'Mid-Semester',
  end_semester: 'End-Semester',
  internal: 'Internal',
  practical: 'Practical',
  backlog: 'Backlog',
};

export default function RegularExamsPage() {
  const [activeTab, setActiveTab] = useState('exams');
  const [filterTerm, setFilterTerm] = useState<string>('all');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Regular Examinations</h1>
          <p className="text-muted-foreground">Schedule exams, allocate rooms, assign invigilators, and manage results.</p>
        </div>
        <Link href="/admin/exams/regular/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Exam
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">—</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">—</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">—</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Results Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">—</div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b">
        {examTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Exams Tab */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          {/* Term Filter */}
          <div className="flex gap-2">
            {['all', 'mid_semester', 'end_semester', 'internal', 'practical', 'backlog'].map((term) => (
              <Button
                key={term}
                variant={filterTerm === term ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterTerm(term)}
              >
                {term === 'all' ? 'All Terms' : termLabels[term] || term}
              </Button>
            ))}
          </div>

          <Card>
            <CardContent className="p-0">
              <EmptyState
                title="No regular exams scheduled"
                description="Create an exam to get started with scheduling, room allocation, and result management."
                icon={<ClipboardList className="h-8 w-8 text-muted-foreground" />}
                action={
                  <Link href="/admin/exams/regular/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Exam
                    </Button>
                  </Link>
                }
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rooms Tab */}
      {activeTab === 'rooms' && (
        <Card>
          <CardHeader>
            <CardTitle>Exam Rooms</CardTitle>
            <CardDescription>Manage examination halls and room allocations.</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="No rooms configured"
              description="Add exam rooms and allocate them to scheduled examinations."
              icon={<MapPin className="h-8 w-8 text-muted-foreground" />}
            />
          </CardContent>
        </Card>
      )}

      {/* Invigilators Tab */}
      {activeTab === 'invigilators' && (
        <Card>
          <CardHeader>
            <CardTitle>Invigilator Assignments</CardTitle>
            <CardDescription>Assign and manage invigilators for exam sessions.</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="No invigilator assignments"
              description="Assign invigilators to exam rooms. The system prevents double-booking."
              icon={<Users className="h-8 w-8 text-muted-foreground" />}
            />
          </CardContent>
        </Card>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && (
        <Card>
          <CardHeader>
            <CardTitle>Exam Results</CardTitle>
            <CardDescription>Enter marks, generate grades, and publish results.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Bulk Upload Template
                </Button>
              </div>
              <EmptyState
                title="No results to display"
                description="Enter marks for completed exams. Results can be published once all entries are complete."
                icon={<FileText className="h-8 w-8 text-muted-foreground" />}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
