'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { useNotices, useCreateNotice, useUpdateNotice, useDeleteNotice } from '@/lib/hooks';
import { Bell, Plus, Send, Archive, Edit, Trash2, Eye, Calendar } from 'lucide-react';

export default function NoticesPage() {
  const { data: noticesData, isLoading } = useNotices();
  const createNotice = useCreateNotice();
  const updateNotice = useUpdateNotice();
  const deleteNotice = useDeleteNotice();
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_audience: 'all',
    publish_immediately: false,
  });

  const notices = noticesData?.data || [];
  const filtered = filterStatus === 'all' ? notices : notices.filter(n => filterStatus === 'published' ? n.published : !n.published);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createNotice.mutateAsync(formData);
      setShowForm(false);
      setFormData({ title: '', content: '', target_audience: 'all', publish_immediately: false });
    } catch (err) {
      console.error('Error creating notice:', err);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await updateNotice.mutateAsync({ id, status: 'published' });
    } catch (err) {
      console.error('Error publishing notice:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this notice?')) {
      try {
        await deleteNotice.mutateAsync(id);
      } catch (err) {
        console.error('Error deleting notice:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notices</h1>
          <p className="text-muted-foreground">Publish and manage institutional notices.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          New Notice
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Published</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{notices.filter(n => n.published).length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Drafts</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-600">{notices.filter(n => !n.published).length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{notices.length}</div></CardContent>
        </Card>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Notice</CardTitle>
            <CardDescription>Publish information to students and staff.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="text-sm font-medium">Content *</label>
                <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={5} className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Target Audience</label>
                  <select value={formData.target_audience} onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })} className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="all">All</option>
                    <option value="students">Students</option>
                    <option value="faculty">Faculty</option>
                    <option value="department">Department</option>
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <Button type="submit" disabled={createNotice.isPending}>
                    <Send className="h-4 w-4 mr-2" />
                    {formData.publish_immediately ? 'Publish Now' : 'Save Draft'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setFormData({ ...formData, publish_immediately: true })}>
                    Publish Immediately
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'published', 'draft'].map((status) => (
          <Button key={status} variant={filterStatus === status ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card><CardContent className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </CardContent></Card>
        ) : filtered.length === 0 ? (
          <Card><CardContent><EmptyState title="No notices" description="Create a notice to broadcast information." icon={<Bell className="h-8 w-8 text-muted-foreground" />} action={{ label: 'Create Notice', onClick: () => setShowForm(true) }} /></CardContent></Card>
        ) : (
          filtered.map((notice) => (
            <Card key={notice.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-500/10 text-yellow-600 shrink-0">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{notice.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notice.content}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" /> {notice.created_at ? new Date(notice.created_at).toLocaleDateString() : '—'}</span>
                        <Badge variant="secondary" className="text-xs">{notice.target_audience}</Badge>
                        <Badge variant={notice.published ? 'secondary' : 'outline'} className={notice.published ? 'bg-green-500/10 text-green-600' : 'text-yellow-600'}>
                          {notice.published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!notice.published && (
                      <Button variant="ghost" size="sm" onClick={() => handlePublish(notice.id)} disabled={updateNotice.isPending}>
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(notice.id)} disabled={deleteNotice.isPending}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
