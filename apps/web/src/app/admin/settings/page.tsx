'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Institution configuration and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Institution Profile</CardTitle>
          <CardDescription>Basic information about your institution.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Institution settings will be configurable here once an institution is set up.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
