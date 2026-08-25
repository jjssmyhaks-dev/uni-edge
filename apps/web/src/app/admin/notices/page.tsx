'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Bell, Plus, Send, Archive, Eye } from 'lucide-react';
import type { UserRole } from '@uni-edge/types';

interface Notice {
  id: string;
  title: string;
  content: string;
  target_audience: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
  author: string;
}

export default function NoticesPage() {
  const { user } = useUser();
  const role = (user?.publicMetadata?.role as UserRole) || 'staff';
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notices</h1>
          <p className="text-muted-foreground">Publish and manage institutional notices.</p>
        </div>
        {role !== 'student' && (
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="h-4 w-4 mr-2" />
            New Notice
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">—</div>
            <p className="text-xs text-muted-foreground">Active notices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">—</div>
            <p className="text-xs text-muted-foreground">Pending publication</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Archived</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">—</div>
            <p className="text-xs text-muted-foreground">Past notices</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'published', 'draft', 'archived'].map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Create Notice Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Notice</CardTitle>
            <CardDescription>Publish information to students and staff.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <input
                type="text"
                placeholder="Notice title"
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Content</label>
              <textarea
                placeholder="Write your notice content here..."
                rows={5}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Target Audience</label>
                <select className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="all">All</option>
                  <option value="students">Students</option>
                  <option value="faculty">Faculty</option>
                  <option value="department">Department</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  Publish Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notices List */}
      <Card>
        <CardContent className="p-0">
          <EmptyState
            title="No notices yet"
            description="Create a notice to broadcast information to students and staff."
            icon={<Bell className="h-8 w-8 text-muted-foreground" />}
            action={
              role !== 'student' ? (
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Notice
                </Button>
              ) : undefined
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
