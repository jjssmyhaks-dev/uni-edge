'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { FileCheck, Clock, CheckCircle2, XCircle, Package } from 'lucide-react';
import type { UserRole } from '@uni-edge/types';

export default function DocumentRequestsPage() {
  const { user } = useUser();
  const role = (user?.publicMetadata?.role as UserRole) || 'staff';
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const statCards = [
    { title: 'Requested', value: '—', icon: <Clock className="h-5 w-5 text-yellow-500" />, color: 'text-yellow-600' },
    { title: 'Processing', value: '—', icon: <Package className="h-5 w-5 text-blue-500" />, color: 'text-blue-600' },
    { title: 'Ready', value: '—', icon: <CheckCircle2 className="h-5 w-5 text-green-500" />, color: 'text-green-600' },
    { title: 'Issued', value: '—', icon: <FileCheck className="h-5 w-5 text-emerald-500" />, color: 'text-emerald-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Requests</h1>
          <p className="text-muted-foreground">Manage student requests for transcripts, certificates, and other documents.</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'requested', 'processing', 'ready', 'issued', 'rejected'].map((status) => (
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

      {/* Request Types */}
      <Card>
        <CardHeader>
          <CardTitle>Document Types</CardTitle>
          <CardDescription>Available document request types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'Transcript', desc: 'Official academic transcript', icon: '📄' },
              { name: 'Bonafide Certificate', desc: 'Enrollment verification', icon: '🎓' },
              { name: 'Transfer Certificate', desc: 'TC for transfer', icon: '📋' },
              { name: 'Migration Certificate', desc: 'Migration to another university', icon: '🏛️' },
              { name: 'Degree Certificate', desc: 'Degree completion certificate', icon: '🏅' },
              { name: 'Mark Sheet', desc: 'Duplicate mark sheet', icon: '📊' },
            ].map((type) => (
              <Card key={type.name} className="cursor-pointer hover:bg-accent transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <p className="text-sm font-medium">{type.name}</p>
                  <p className="text-xs text-muted-foreground">{type.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Requests Queue */}
      <Card>
        <CardContent className="p-0">
          <EmptyState
            title="No document requests"
            description="Student document requests will appear here for processing."
            icon={<FileCheck className="h-8 w-8 text-muted-foreground" />}
          />
        </CardContent>
      </Card>
    </div>
  );
}
