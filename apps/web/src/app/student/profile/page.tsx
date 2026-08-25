'use client';

import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Building2, GraduationCap, Calendar, Edit } from 'lucide-react';

export default function StudentProfilePage() {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">View and manage your profile information.</p>
        </div>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mx-auto mb-4">
              <User className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-bold">{user?.fullName || 'Student Name'}</h2>
            <p className="text-sm text-muted-foreground mt-1">{user?.emailAddresses?.[0]?.emailAddress || 'student@email.com'}</p>
            <Badge variant="secondary" className="mt-3">Student</Badge>
          </CardContent>
        </Card>

        {/* Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{user?.emailAddresses?.[0]?.emailAddress || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">—</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Institution</p>
                  <p className="text-sm font-medium">Delhi Technical University</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Program</p>
                  <p className="text-sm font-medium">B.Tech Computer Science</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Enrollment Number</p>
                  <p className="text-sm font-medium font-mono">DTU-CSE-2024-001</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Batch Year</p>
                  <p className="text-sm font-medium">2024</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
