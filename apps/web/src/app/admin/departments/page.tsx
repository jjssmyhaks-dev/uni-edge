'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { useDepartments, useCreateDepartment, useUpdateDepartment } from '@/lib/hooks';
import { BookOpen, Plus, Edit, Hash } from 'lucide-react';

export default function DepartmentsPage() {
  const { data: departmentsData, isLoading, error } = useDepartments();
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '' });

  const departments = departmentsData?.data || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDepartment.mutateAsync({ id: editingId, ...formData });
      } else {
        await createDepartment.mutateAsync(formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', code: '' });
    } catch (err) {
      console.error('Error saving department:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">Manage academic departments within your institution.</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', code: '' }); }}>
          <Plus className="h-4 w-4 mr-2" />
          New Department
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Department' : 'Create New Department'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Department Name *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="text-sm font-medium">Code</label>
                  <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="e.g., CSE" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createDepartment.isPending || updateDepartment.isPending}>
                  {editingId ? 'Update' : 'Create'} Department
                </Button>
                <Button variant="outline" type="button" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Departments ({departments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">Failed to load departments.</div>
          ) : departments.length === 0 ? (
            <EmptyState title="No departments yet" description="Create your first department to organize programs." icon={<BookOpen className="h-8 w-8 text-muted-foreground" />} action={{ label: 'Create Department', onClick: () => setShowForm(true) }} />
          ) : (
            <div className="space-y-3">
              {departments.map((dept) => (
                <div key={dept.id} className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">{dept.name}</h3>
                      {dept.code && <p className="text-sm text-muted-foreground flex items-center gap-1"><Hash className="h-3 w-3" /> {dept.code}</p>}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setFormData({ name: dept.name, code: dept.code || '' }); setEditingId(dept.id); setShowForm(true); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
