'use client';

import { useState } from 'react';
import { useRegularExams } from '@/lib/hooks/useRegularExams';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Download, 
  Search, 
  Calendar, 
  Clock, 
  MapPin,
  User,
  FileText,
  Loader2,
  Printer,
  QrCode
} from 'lucide-react';

export default function StudentHallTicketsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: examsData, isLoading } = useRegularExams();
  const exams = examsData?.data || [];

  const filteredTickets = exams.filter(exam => 
    (exam.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Hall Tickets</h1>
          <p className="text-gray-600 mt-1">Download and print your exam hall tickets</p>
        </div>
        <Button variant="outline"><Printer className="w-4 h-4 mr-2" />Print All</Button>
      </div>

      <Card><CardContent className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search hall tickets..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
      </CardContent></Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : filteredTickets.length === 0 ? (
        <Card><CardContent className="py-12">
          <div className="text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Hall Tickets Found</h3>
            <p className="text-gray-500">{searchTerm ? 'No hall tickets match your search.' : 'No hall tickets available yet.'}</p>
          </div>
        </CardContent></Card>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow overflow-hidden">
              <div className="border-l-4 border-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg"><FileText className="w-5 h-5 text-blue-600" /></div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{ticket.name}</h3>
                          <p className="text-sm text-gray-500">{ticket.course_code || 'Exam'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div><p className="text-xs text-gray-400">Date</p><p className="font-medium">{ticket.exam_date ? new Date(ticket.exam_date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }) : 'TBA'}</p></div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <div><p className="text-xs text-gray-400">Time</p><p className="font-medium">{ticket.exam_time || '10:00 AM'}</p></div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <div><p className="text-xs text-gray-400">Duration</p><p className="font-medium">{ticket.duration_minutes || 120} min</p></div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="w-4 h-4 text-gray-400" />
                          <div><p className="text-xs text-gray-400">Status</p><p className="font-medium">{ticket.status || 'Scheduled'}</p></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Available</Badge>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm"><QrCode className="w-4 h-4 mr-1" />QR Code</Button>
                        <Button size="sm"><Download className="w-4 h-4 mr-1" />Download</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredTickets.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-gray-600">Important Instructions</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2"><span className="text-blue-600 mt-1">•</span>Print this hall ticket on A4 paper</li>
              <li className="flex items-start gap-2"><span className="text-blue-600 mt-1">•</span>Carry a valid photo ID (Aadhaar/Passport/College ID) along with the hall ticket</li>
              <li className="flex items-start gap-2"><span className="text-blue-600 mt-1">•</span>Arrive at the exam center at least 30 minutes before the scheduled time</li>
              <li className="flex items-start gap-2"><span className="text-blue-600 mt-1">•</span>Electronic devices (phones, calculators, smartwatches) are strictly prohibited</li>
              <li className="flex items-start gap-2"><span className="text-blue-600 mt-1">•</span>Contact the exam cell immediately if you notice any discrepancy in the hall ticket</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
