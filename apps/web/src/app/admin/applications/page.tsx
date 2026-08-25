'use client';

import { useState } from 'react';
import { useApplications } from '@/lib/hooks/useApplications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  Search,
  Filter,
  Download,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Send,
  Loader2,
  BarChart3,
  FileText,
  ChevronDown
} from 'lucide-react';

export default function ApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set());
  const { data: applicationsData, isLoading } = useApplications();
  const applications = applicationsData?.data || [];

  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      (app.applicant_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.applicant_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const toggleSelect = (id: string) => {
    setSelectedApplications(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedApplications.size === filteredApplications.length) {
      setSelectedApplications(new Set());
    } else {
      setSelectedApplications(new Set(filteredApplications.map(a => a.id)));
    }
  };

  const statusCounts = {
    all: applications.length,
    submitted: applications.filter(a => a.status === 'submitted').length,
    under_review: applications.filter(a => a.status === 'under_review').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    offered: applications.filter(a => a.status === 'offered').length,
    confirmed: applications.filter(a => a.status === 'confirmed').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'under_review': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'shortlisted': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'offered': return 'bg-green-100 text-green-700 border-green-200';
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600 mt-1">Review and manage admission applications</p>
        </div>
        <div className="flex gap-2">
          {selectedApplications.size > 0 && (
            <>
              <Button variant="outline" size="sm">
                <Mail className="w-4 h-4 mr-2" />
                Email ({selectedApplications.size})
              </Button>
              <Button variant="outline" size="sm" className="text-green-600 border-green-200">
                <CheckCircle className="w-4 h-4 mr-2" />
                Shortlist ({selectedApplications.size})
              </Button>
            </>
          )}
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: 'Total', count: statusCounts.all, color: 'bg-gray-100 text-gray-700' },
          { label: 'Submitted', count: statusCounts.submitted, color: 'bg-blue-100 text-blue-700' },
          { label: 'Under Review', count: statusCounts.under_review, color: 'bg-yellow-100 text-yellow-700' },
          { label: 'Shortlisted', count: statusCounts.shortlisted, color: 'bg-purple-100 text-purple-700' },
          { label: 'Offered', count: statusCounts.offered, color: 'bg-green-100 text-green-700' },
          { label: 'Rejected', count: statusCounts.rejected, color: 'bg-red-100 text-red-700' },
        ].map(stat => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedStatus(stat.label === 'Total' ? 'all' : stat.label.toLowerCase().replace(' ', '_'))}>
            <CardContent className="p-3">
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900">{stat.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or application ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="offered">Offered</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && filteredApplications.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'No applications match your search.' : 'No applications received yet.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Applications Table */}
      {!isLoading && filteredApplications.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="py-3 px-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedApplications.size === filteredApplications.length}
                        onChange={selectAll}
                        className="w-4 h-4"
                      />
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Program</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Applied</th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedApplications.has(app.id)}
                          onChange={() => toggleSelect(app.id)}
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{app.applicant_name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{app.applicant_email || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {app.admission_cycles?.programs?.name || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs uppercase">General</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={getStatusColor(app.status)}>
                          {(app.status || 'submitted').replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(app.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {app.status === 'submitted' && (
                            <Button variant="ghost" size="sm" title="Mark Under Review" className="text-yellow-600">
                              <Clock className="w-4 h-4" />
                            </Button>
                          )}
                          {(app.status === 'under_review' || app.status === 'shortlisted') && (
                            <Button variant="ghost" size="sm" title="Shortlist" className="text-green-600">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {app.status !== 'rejected' && app.status !== 'confirmed' && (
                            <Button variant="ghost" size="sm" title="Reject" className="text-red-600">
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
