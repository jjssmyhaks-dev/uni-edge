'use client';

import { useState } from 'react';
import { useDocumentRequests } from '@/lib/hooks/useDocumentRequests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Search, 
  Download, 
  Clock,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Plus
} from 'lucide-react';

export default function StudentDocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const { data: requestsData, isLoading } = useDocumentRequests();
  const requests = requestsData?.data || [];

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.request_type.toLowerCase().includes(searchTerm.toLowerCase()) || (r.remarks || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued': return 'bg-green-100 text-green-700 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'requested': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const statusCounts = {
    all: requests.length,
    requested: requests.filter(r => r.status === 'requested').length,
    processing: requests.filter(r => r.status === 'processing').length,
    issued: requests.filter(r => r.status === 'issued').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
          <p className="text-gray-600 mt-1">Request and track your official documents</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />New Request</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg"><Clock className="w-5 h-5 text-yellow-600" /></div>
            <div><p className="text-sm text-gray-500">Pending</p><p className="text-2xl font-bold text-gray-900">{statusCounts.requested}</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover:shadow-md transition-shadow"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Loader2 className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-sm text-gray-500">Processing</p><p className="text-2xl font-bold text-gray-900">{statusCounts.processing}</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover:shadow-md transition-shadow"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-sm text-gray-500">Issued</p><p className="text-2xl font-bold text-gray-900">{statusCounts.issued}</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover:shadow-md transition-shadow"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
            <div><p className="text-sm text-gray-500">Rejected</p><p className="text-2xl font-bold text-gray-900">{statusCounts.rejected}</p></div>
          </div>
        </CardContent></Card>
      </div>

      <Card><CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search documents..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'requested', 'processing', 'issued', 'rejected'] as const).map(status => (
              <Button key={status} variant={selectedStatus === status ? 'default' : 'outline'} size="sm" onClick={() => setSelectedStatus(status)}>
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                <span className="ml-1 text-xs">({statusCounts[status]})</span>
              </Button>
            ))}
          </div>
        </div>
      </CardContent></Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : filteredRequests.length === 0 ? (
        <Card><CardContent className="py-12">
          <div className="text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Found</h3>
            <p className="text-gray-500 mb-4">{searchTerm ? 'No documents match your search.' : "You haven't requested any documents yet."}</p>
            <Button><Plus className="w-4 h-4 mr-2" />Request Your First Document</Button>
          </div>
        </CardContent></Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg"><FileText className="w-6 h-6 text-blue-600" /></div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{request.request_type}{request.custom_type ? ` — ${request.custom_type}` : ''}</h3>
                      {request.remarks && <p className="text-sm text-gray-500 mt-1">{request.remarks}</p>}
                      <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Requested: {new Date(request.created_at).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className={getStatusColor(request.status)}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                    {request.status === 'issued' && <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Download</Button>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && (
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-gray-600">Available Document Types</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Transcript', 'Bonafide Certificate', 'Migration Certificate', 'Character Certificate', 'Degree Certificate', 'Marksheet', 'Provisional Certificate', 'Recommendation Letter'].map(type => (
                <div key={type} className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors">{type}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
