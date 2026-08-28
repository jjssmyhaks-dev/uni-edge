'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle2, AlertTriangle, Info, AlertCircle, CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { useNotifications } from '@/lib/hooks/useNotifications';

function getTypeIcon(type: string) {
  switch (type) {
    case 'info': return <Info className="h-4 w-4 text-blue-500" />;
    case 'success': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case 'urgent': return <AlertCircle className="h-4 w-4 text-red-500" />;
    default: return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
}

export default function NotificationsPage() {
  const { data: notifications = [] } = useNotifications();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Stay updated on exams, assignments, and announcements</p>
        </div>
        <Button variant="outline" size="sm"><CheckCheck className="h-4 w-4 mr-2" />Mark All Read</Button>
      </div>

      <div className="space-y-2">
        {notifications.map(notif => (
          <Card key={notif.id} className={`transition-colors ${!notif.read ? 'border-primary/30 bg-primary/5' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">{getTypeIcon(notif.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{notif.title}</p>
                    {!notif.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                    <Badge variant="outline" className="text-[10px] capitalize">{notif.scope}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(notif.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {notif.link && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={notif.link}>View</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
