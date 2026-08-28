'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Plus,
  Send,
  X,
} from 'lucide-react';
import { useGrievances, type Grievance } from '@/lib/hooks/useStudentData';

function getStatusColor(status: string) {
  switch (status) {
    case 'open':
      return 'bg-blue-500/15 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400';
    case 'in_review':
      return 'bg-yellow-500/15 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400';
    case 'awaiting_info':
      return 'bg-orange-500/15 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400';
    case 'resolved':
      return 'bg-green-500/15 text-green-700 dark:bg-green-500/10 dark:text-green-400';
    case 'closed':
      return 'bg-gray-500/15 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400';
    default:
      return 'bg-gray-500/15 text-gray-700';
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'urgent':
      return 'bg-red-500/15 text-red-700 dark:bg-red-500/10 dark:text-red-400';
    case 'high':
      return 'bg-orange-500/15 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400';
    case 'normal':
      return 'bg-blue-500/15 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400';
    case 'low':
      return 'bg-gray-500/15 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400';
    default:
      return 'bg-gray-500/15 text-gray-700';
  }
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'academic':
      return '📚';
    case 'administrative':
      return '🏫';
    case 'fee':
      return '💰';
    case 'examination':
      return '📝';
    default:
      return '📋';
  }
}

export default function GrievancesPage() {
  const { data: grievances = [], createGrievance, replyToGrievance } = useGrievances();
  const [showForm, setShowForm] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // New grievance form
  const [newSubject, setNewSubject] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('academic');
  const [newPriority, setNewPriority] = useState('normal');

  const filtered = filterStatus === 'all'
    ? grievances
    : grievances.filter(g => g.status === filterStatus);

  const handleCreate = async () => {
    if (!newSubject.trim() || !newDescription.trim()) return;
    await createGrievance.mutateAsync({
      subject: newSubject,
      description: newDescription,
      category: newCategory,
      priority: newPriority,
    });
    setNewSubject('');
    setNewDescription('');
    setShowForm(false);
  };

  const handleReply = async () => {
    if (!selectedGrievance || !replyText.trim()) return;
    await replyToGrievance.mutateAsync({
      id: selectedGrievance.id,
      message: replyText,
    });
    setReplyText('');
  };

  const openCounts = grievances.filter(g => g.status === 'open' || g.status === 'in_review').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Grievances & Queries</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Raise academic or administrative queries and track their resolution.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" />
          Raise Grievance
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{grievances.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{openCounts}</p>
                <p className="text-xs text-muted-foreground">Open / In Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{grievances.filter(g => g.status === 'resolved' || g.status === 'closed').length}</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{grievances.reduce((sum, g) => sum + g.replies.length, 0)}</p>
                <p className="text-xs text-muted-foreground">Replies</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Raise a New Grievance</CardTitle>
                <CardDescription>Describe your issue clearly for faster resolution.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  <option value="academic">Academic</option>
                  <option value="administrative">Administrative</option>
                  <option value="fee">Fee Related</option>
                  <option value="examination">Examination</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <select
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="Brief summary of your issue"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Provide detailed information about your grievance..."
                rows={4}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={createGrievance.isPending}>
                <Send className="h-4 w-4 mr-1" />
                {createGrievance.isPending ? 'Submitting...' : 'Submit Grievance'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'open', 'in_review', 'awaiting_info', 'resolved', 'closed'].map(status => (
          <Button
            key={status}
            variant={filterStatus === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus(status)}
            className="capitalize"
          >
            {status === 'all' ? 'All' : status.replace('_', ' ')}
          </Button>
        ))}
      </div>

      {/* Grievance List & Detail */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* List */}
        <div className={`space-y-3 ${selectedGrievance ? 'lg:col-span-2' : 'lg:col-span-5'}`}>
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="font-medium">No grievances found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {filterStatus === 'all'
                    ? 'You haven\'t raised any grievances yet.'
                    : `No grievances with status "${filterStatus.replace('_', ' ')}".`}
                </p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((grievance) => (
              <Card
                key={grievance.id}
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedGrievance?.id === grievance.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedGrievance(grievance)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-xl mt-0.5">{getCategoryIcon(grievance.category)}</span>
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm truncate">{grievance.subject}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{grievance.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={`${getStatusColor(grievance.status)} border-0 text-xs`} variant="outline">
                            {grievance.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={`${getPriorityColor(grievance.priority)} border-0 text-xs`} variant="outline">
                            {grievance.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(grievance.created_at).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                    {grievance.replies.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <MessageSquare className="h-3 w-3" />
                        {grievance.replies.length}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Detail */}
        {selectedGrievance && (
          <div className="lg:col-span-3">
            <Card className="sticky top-24">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedGrievance.subject}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={`${getStatusColor(selectedGrievance.status)} border-0`} variant="outline">
                        {selectedGrievance.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={`${getPriorityColor(selectedGrievance.priority)} border-0`} variant="outline">
                        {selectedGrievance.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground capitalize">
                        {getCategoryIcon(selectedGrievance.category)} {selectedGrievance.category}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedGrievance(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Description */}
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm whitespace-pre-wrap">{selectedGrievance.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Raised on {new Date(selectedGrievance.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>

                {/* Resolution */}
                {selectedGrievance.resolution_notes && (
                  <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-4">
                    <h4 className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">Resolution</h4>
                    <p className="text-sm">{selectedGrievance.resolution_notes}</p>
                    {selectedGrievance.resolved_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Resolved on {new Date(selectedGrievance.resolved_at).toLocaleDateString('en-IN')}
                      </p>
                    )}
                  </div>
                )}

                {/* Replies */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Conversation ({selectedGrievance.replies.length})</h4>
                  {selectedGrievance.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`rounded-lg p-3 ${
                        reply.sender_role === 'student'
                          ? 'bg-primary/5 border border-primary/10 ml-6'
                          : 'bg-muted/50 mr-6'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium capitalize">{reply.sender_name || reply.sender_role}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(reply.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm">{reply.message}</p>
                    </div>
                  ))}
                  {selectedGrievance.replies.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No replies yet. Waiting for admin response.</p>
                  )}
                </div>

                {/* Reply Input */}
                {selectedGrievance.status !== 'closed' && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Input
                      placeholder="Type your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={handleReply}
                      disabled={!replyText.trim() || replyToGrievance.isPending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
