'use client';

import { useState } from 'react';
import { useEntranceExams } from '@/lib/hooks/useEntranceExams';
import { useRegularExams } from '@/lib/hooks/useRegularExams';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  Search, 
  Download, 
  Clock,
  MapPin,
  Loader2,
  FileText
} from 'lucide-react';

export default function StudentExamsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'entrance' | 'regular'>('all');
  
  const { data: entranceData, isLoading: entranceLoading } = useEntranceExams();
  const { data: regularData, isLoading: regularLoading } = useRegularExams();

  const isLoading = entranceLoading || regularLoading;

  const entranceExams = (entranceData?.data || []).map(e => ({ ...e, type: 'entrance' as const }));
  const regularExams = (regularData?.data || []).map(e => ({ ...e, type: 'regular' as const }));
  const allExams = [...entranceExams, ...regularExams];

  const filteredExams = allExams.filter(exam => {
    const matchesSearch = (exam.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || exam.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const upcomingExams = filteredExams.filter(e => new Date(e.exam_date || '').getTime() > Date.now());
  const pastExams = filteredExams.filter(e => new Date(e.exam_date || '').getTime() <= Date.now());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Exams</h1>
          <p className="text-gray-600 mt-1">View and manage your entrance and regular examinations</p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{upcomingExams.length} Upcoming</Badge>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search exams..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2">
              {(['all', 'entrance', 'regular'] as const).map(tab => (
                <Button key={tab} variant={activeTab === tab ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab(tab)}>
                  {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      )}

      {!isLoading && filteredExams.length === 0 && (
        <Card><CardContent className="py-12">
          <div className="text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Exams Found</h3>
            <p className="text-gray-500">{searchTerm ? 'No exams match your search.' : 'No exams scheduled yet.'}</p>
          </div>
        </CardContent></Card>
      )}

      {!isLoading && upcomingExams.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-600" /> Upcoming Exams</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingExams.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg"><FileText className="w-6 h-6 text-blue-600" /></div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{exam.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(exam.exam_date || '').toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{exam.duration_minutes || 120} min</span>
                        {exam.type === 'entrance' && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />Online</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={exam.type === 'entrance' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-green-50 text-green-700 border-green-200'}>
                      {exam.type === 'entrance' ? 'Entrance' : 'Regular'}
                    </Badge>
                    <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Hall Ticket</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && pastExams.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-gray-500"><Clock className="w-5 h-5" /> Past Exams</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastExams.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg opacity-75">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-200 rounded-lg"><FileText className="w-6 h-6 text-gray-500" /></div>
                    <div>
                      <h3 className="font-semibold text-gray-700">{exam.name}</h3>
                      <p className="text-sm text-gray-500">{new Date(exam.exam_date || '').toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-gray-100 text-gray-600">Completed</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
