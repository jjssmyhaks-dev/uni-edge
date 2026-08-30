'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertTriangle, CheckCircle, Clock, MessageSquare, Search,
  Filter, Send, User, ChevronDown, ChevronUp, XCircle, Eye,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

interface GrievanceReply {
  id: string;
  message: string;
  sender_role: string;
  sender_name?: string;
  users?: { full_name: string };
  created_at: string;
}

interface Grievance {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  resolution_notes?: string;
  resolved_at?: string;
  created_at: string;
  students?: {
    enrollment_number: string;
    users?: { full_name: string; email: string };
  };
  users?: { full_name: string };
  grievance_replies?: GrievanceReply[];
}

function getStatusColor(status: string) {
  switch (status) {
    case 'open': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-0';
    case 'in_review': return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-0';
    case 'awaiting_info': return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-0';
    case 'resolved': return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-0';
    case 'closed': return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-0';
    default: return '';
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'urgent': return 'bg-red-500/10 text-red-700 dark:text-red-400 border-0';
    case 'high': return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-0';
    case 'normal': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-0';
    case 'low': return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-0';
    default: return '';
  }
}

function getCategoryLabel(cat: string) {
  const labels: Record<string, string> = {
    academic: 'Academic', administrative: 'Administrative', financial: 'Financial',
    technical: 'Technical', harassment: 'Harassment', other: 'Other',
  };
  return labels[cat] || cat;
}

export default function AdminGrievancesPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');

  const { data: grievances = [], isLoading } = useQuery<Grievance[]>({
    queryKey: ['admin-grievances', statusFilter, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      const url = `${API_BASE}/api/v1/student/grievances?${params.toString()}`;
      const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
  });

  const replyMutation = useMutation({
    mutationFn: async ({ id, message }: { id: string; message: string }) => {
      const res = await fetch(`${API_BASE}/api/v1/student/grievances/${id}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error('Failed to send reply');
      return res.json();
    },
    onSuccess: () => {
      setReplyText('');
      queryClient.invalidateQueries({ queryKey: ['admin-grievances'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`${API_BASE}/api/v1/student/grievances/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => {
      setUpdateStatus('');
      queryClient.invalidateQueries({ queryKey: ['admin-grievances'] });
    },
  });

  const filtered = grievances.filter(g => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return g.subject.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.students?.users?.full_name?.toLowerCase().includes(q) ||
        g.students?.enrollment_number?.toLowerCase().includes(q);
    }
    return true;
  });

  const selected = filtered.find(g => g.id === selectedId);
  const totalOpen = grievances.filter(g => g.status === 'open').length;
  const totalInReview = grievances.filter(g => g.status === 'in_review').length;
  const totalResolved = grievances.filter(g => g.status === 'resolved' || g.status === 'closed').length;
  const totalUrgent = grievances.filter(g => g.priority === 'urgent' || g.priority === 'high').length;

  const handleReply = () => {
    if (!selected || !replyText.trim()) return;
    replyMutation.mutate({ id: selected.id, message: replyText.trim() });
  };

  const handleStatusUpdate = (status: string) => {
    if (!selected) return;
    updateStatusMutation.mutate({ id: selected.id, status });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Grievance Management</h1>
        <p className="text-muted-foreground">Review and resolve student grievances</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Open</p>
              <p className="text-2xl font-bold">{totalOpen}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">In Review</p>
              <p className="text-2xl font-bold">{totalInReview}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Resolved</p>
              <p className="text-2xl font-bold">{totalResolved}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Urgent/High</p>
              <p className="text-2xl font-bold">{totalUrgent}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by subject, student, or enrollment number..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="awaiting_info">Awaiting Info</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="academic">Academic</SelectItem>
            <SelectItem value="administrative">Administrative</SelectItem>
            <SelectItem value="financial">Financial</SelectItem>
            <SelectItem value="technical">Technical</SelectItem>
            <SelectItem value="harassment">Harassment</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content: Table + Detail Panel */}
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Grievances Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <MessageSquare className="mx-auto mb-3 h-10 w-10 opacity-30" />
                <p>No grievances found</p>
              </div>
            ) : (
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(g => (
                      <TableRow
                        key={g.id}
                        className={`hover:bg-muted/50 cursor-pointer ${selectedId === g.id ? 'bg-primary/5' : ''}`}
                        onClick={() => { setSelectedId(g.id); setReplyText(''); }}
                      >
                        <TableCell className="font-medium max-w-[200px] truncate">{g.subject}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {g.students?.users?.full_name || 'Unknown'}
                          <br />
                          <span className="text-xs">{g.students?.enrollment_number}</span>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{getCategoryLabel(g.category)}</Badge></TableCell>
                        <TableCell><Badge className={getPriorityColor(g.priority)}>{g.priority}</Badge></TableCell>
                        <TableCell><Badge className={getStatusColor(g.status)}>{g.status.replace('_', ' ')}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(g.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {/* Mobile: Cards */}
            <div className="space-y-2 p-3 md:hidden">
              {filtered.map(g => (
                <div
                  key={g.id}
                  className={`rounded-lg border p-3 cursor-pointer transition-colors ${selectedId === g.id ? 'border-primary bg-primary/5' : ''}`}
                  onClick={() => { setSelectedId(g.id); setReplyText(''); }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm line-clamp-1">{g.subject}</p>
                    <Badge className={getStatusColor(g.status)}>{g.status.replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {g.students?.users?.full_name} · {g.students?.enrollment_number}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-[10px]">{getCategoryLabel(g.category)}</Badge>
                    <Badge className={getPriorityColor(g.priority)}>{g.priority}</Badge>
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {new Date(g.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detail Panel */}
        {selected ? (
          <Card className="h-fit lg:sticky lg:top-6">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base leading-tight">{selected.subject}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selected.students?.users?.full_name} ({selected.students?.enrollment_number}) ·{' '}
                    {new Date(selected.created_at).toLocaleString()}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setSelectedId(null)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className={getStatusColor(selected.status)}>{selected.status.replace('_', ' ')}</Badge>
                <Badge className={getPriorityColor(selected.priority)}>{selected.priority}</Badge>
                <Badge variant="outline">{getCategoryLabel(selected.category)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Description */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Description</p>
                <p className="text-sm whitespace-pre-wrap">{selected.description}</p>
              </div>

              {/* Status Update */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {['open', 'in_review', 'awaiting_info', 'resolved', 'closed'].map(s => (
                    <Button
                      key={s}
                      variant={selected.status === s ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleStatusUpdate(s)}
                      disabled={selected.status === s || updateStatusMutation.isPending}
                    >
                      {s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Replies Thread */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  Conversation ({selected.grievance_replies?.length || 0})
                </p>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {(selected.grievance_replies || []).length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No replies yet</p>
                  ) : (
                    (selected.grievance_replies || []).map(reply => (
                      <div key={reply.id} className={`rounded-lg p-3 text-sm ${reply.sender_role === 'admin' ? 'bg-primary/5 ml-4' : 'bg-muted mr-4'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium">
                            {reply.users?.full_name || reply.sender_name || (reply.sender_role === 'admin' ? 'Staff' : 'Student')}
                          </span>
                          <Badge variant="outline" className="text-[10px] h-5">{reply.sender_role}</Badge>
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            {new Date(reply.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Reply Input */}
              <div className="border-t pt-3">
                <Textarea
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <Button
                  size="sm"
                  className="mt-2 w-full"
                  disabled={!replyText.trim() || replyMutation.isPending}
                  onClick={handleReply}
                >
                  <Send className="mr-2 h-3.5 w-3.5" />
                  {replyMutation.isPending ? 'Sending...' : 'Send Reply'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="h-fit lg:sticky lg:top-6 hidden lg:block">
            <CardContent className="py-12 text-center text-muted-foreground">
              <MessageSquare className="mx-auto mb-3 h-10 w-10 opacity-30" />
              <p>Select a grievance to view details</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
