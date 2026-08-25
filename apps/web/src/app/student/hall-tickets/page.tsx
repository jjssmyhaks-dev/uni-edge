'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ticket, Download, Calendar, Clock, MapPin, Printer } from 'lucide-react';

const hallTickets = [
  { exam: 'CS301 — Data Structures', date: 'Dec 10, 2025', time: '9:00 AM', room: 'Room 101', seat: 15, ticketNumber: 'CSES3-00015', issued: true },
  { exam: 'CS302 — Operating Systems', date: 'Dec 12, 2025', time: '2:00 PM', room: 'Room 102', seat: 22, ticketNumber: 'CSES3-00022', issued: true },
  { exam: 'CS303 — Computer Networks', date: 'Dec 15, 2025', time: '9:00 AM', room: 'TBD', seat: 0, ticketNumber: '—', issued: false },
];

export default function StudentHallTicketsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hall Tickets</h1>
          <p className="text-muted-foreground">Download your exam hall tickets and admit cards.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hallTickets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{hallTickets.filter(t => t.issued).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{hallTickets.filter(t => !t.issued).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Hall Tickets */}
      <div className="space-y-4">
        {hallTickets.map((ticket, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-14 h-14 rounded-xl ${ticket.issued ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
                    <Ticket className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{ticket.exam}</h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {ticket.date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {ticket.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {ticket.room}{ticket.seat ? `, Seat ${ticket.seat}` : ''}</span>
                    </div>
                    {ticket.issued && (
                      <p className="mt-1 text-xs font-mono text-muted-foreground">Ticket: {ticket.ticketNumber}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {ticket.issued ? (
                    <>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Printer className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Not Yet Issued</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
