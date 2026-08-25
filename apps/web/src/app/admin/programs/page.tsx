'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { usePrograms, useCreateProgram, useUpdateProgram } from '@/lib/hooks';
import { GraduationCap, Plus, Edit, Building2, Users, Clock } from 'lucide-react';

export default function ProgramsPage() {
  const { data: programsData, isLoading, error } = usePrograms();
  const createProgram = useCreateProgram();
  const updateProgram = useUpdateProgram();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    degree_level: 'undergraduate',
    department_id: '',
    duration_years: 4,
    total_seats: 60,
  });

  const programs = programsData?.data || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateProgram.mutateAsync({ id: editingId, ...formData });
      } else {
        await createProgram.mutateAsync(formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', code: '', degree_level: 'undergraduate', department_id: '', duration_years: 4, total_seats: 60 });
    } catch (err) {
      console.error('Error saving program:', err);
    }
  };

  const handleEdit = (program: typeof programs[0]) => {
    setFormData({
      name: program.name,
      code: program.code || '',
      degree_level: program.degree_level,
      department_id: program.department_id || '',
      duration_years: program.duration_years || 4,
      total_seats: program.total_seats || 60,
    });
    setEditingId(program.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Programs</h1>
          <p className="text-muted-foreground">Manage academic programs and their configurations.</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', code: '', degree_level: 'undergraduate', department_id: '', duration_years: 4, total_seats: 60 }); }}>
          <Plus className="h-4 w-4 mr-2" />
          New Program
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Program' : 'Create New Program'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Program Name *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="text-sm font-medium">Code</label>
                  <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="e.g., CSE-BTech" />
                </div>
                <div>
                  <label className="text-sm font-medium">Degree Level</label>
                  <select value={formData.degree_level} onChange={(e) => setFormData({ ...formData, degree_level: e.target.value })} className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="undergraduate">Undergraduate</option>
                    <option value="postgraduate">Postgraduate</option>
                    <option value="diploma">Diploma</option>
                    <option value="phd">PhD</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Duration (years)</label>
                  <input type="number" value={formData.duration_years} onChange={(e) => setFormData({ ...formData, duration_years: parseInt(e.target.value) })} className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" min={1} max={10} />
                </div>
                <div>
                  <label className="text-sm font-medium">Total Seats</label>
                  <input type="number" value={formData.total_seats} onChange={(e) => setFormData({ ...formData, total_seats: parseInt(e.target.value) })} className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" min={1} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createProgram.isPending || updateProgram.isPending}>
                  {editingId ? 'Update' : 'Create'} Program
                </Button>
                <Button variant="outline" type="button" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Undergraduate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{programs.filter(p => p.degree_level === 'undergraduate').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Seats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{programs.reduce((acc, p) => acc + (p.total_seats || 0), 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Programs List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Programs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">Failed to load programs. Please try again.</div>
          ) : programs.length === 0 ? (
            <EmptyState title="No programs yet" description="Create your first academic program to get started." icon={<GraduationCap className="h-8 w-8 text-muted-foreground" />} action={{ label: 'Create Program', onClick: () => setShowForm(true) }} />
          ) : (
            <div className="space-y-3">
              {programs.map((program) => (
                <div key={program.id} className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">{program.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {program.code && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {program.code}</span>}
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {program.duration_years || '—'} years</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {program.total_seats || '—'} seats</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{program.degree_level}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(program)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
