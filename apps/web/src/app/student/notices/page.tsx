'use client';

import { useState } from 'react';
import { useNotices } from '@/lib/hooks/useNotices';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bell, 
  Search, 
  Calendar,
  Loader2,
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react';

export default function StudentNoticesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: noticesData, isLoading } = useNotices();
  const notices = noticesData?.data || [];

  const filteredNotices = notices.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notices & Announcements</h1>
          <p className="text-gray-600 mt-1">Stay updated with the latest from your institution</p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{filteredNotices.length} Notices</Badge>
      </div>

      <Card><CardContent className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search notices..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
      </CardContent></Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : filteredNotices.length === 0 ? (
        <Card><CardContent className="py-12">
          <div className="text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Notices Found</h3>
            <p className="text-gray-500">{searchTerm ? 'No notices match your search.' : 'No notices published yet.'}</p>
          </div>
        </CardContent></Card>
      ) : (
        <div className="space-y-4">
          {filteredNotices.map((notice) => (
            <Card key={notice.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">{notice.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-3 whitespace-pre-wrap">{notice.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(notice.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                      {notice.target_audience && <Badge variant="outline" className="text-xs">{notice.target_audience}</Badge>}
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-gray-50 text-gray-600">
                    {notice.published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
