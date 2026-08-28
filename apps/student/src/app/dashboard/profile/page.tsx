'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Phone, MapPin, Calendar, Download, QrCode, Shield, Edit2 } from 'lucide-react';
import { useProfile } from '@/lib/hooks/useProfile';

export default function ProfilePage() {
  const { data: profile } = useProfile();

  if (!profile) return <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  const initials = profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">View your profile and digital ID card</p>
        </div>
        <Button variant="outline"><Edit2 className="h-4 w-4 mr-2" />Edit Profile</Button>
      </div>

      {/* Digital ID Card */}
      <Card className="overflow-hidden border-primary/20">
        <div className="bg-gradient-to-r from-primary to-primary/80 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white font-bold">UE</div>
            <div>
              <p className="text-white/80 text-xs">Uni-Edge Student Identity Card</p>
              <p className="text-white font-semibold">Digital ID</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-white/30">
              <AvatarFallback className="text-2xl bg-white/20 text-white">{initials}</AvatarFallback>
            </Avatar>
            <div className="text-white">
              <h2 className="text-xl font-bold">{profile.name}</h2>
              <p className="text-white/80 text-sm">{profile.program}</p>
              <p className="text-white/60 text-xs mt-1">Roll: {profile.roll_number}</p>
            </div>
            <div className="ml-auto text-right">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white/20 ml-auto">
                <QrCode className="h-10 w-10 text-white" />
              </div>
              <p className="text-white/60 text-[10px] mt-1">Scan to verify</p>
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Department</p>
              <p className="font-medium">{profile.department}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Semester</p>
              <p className="font-medium">{profile.semester}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Institutional Email</p>
              <p className="font-medium text-xs">{profile.institutional_email}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Blood Group</p>
              <p className="font-medium">{profile.blood_group}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="mt-4"><Download className="h-3.5 w-3.5 mr-2" />Download ID Card</Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { icon: User, label: 'Full Name', value: profile.name },
              { icon: Mail, label: 'Email', value: profile.email },
              { icon: Phone, label: 'Phone', value: profile.phone },
              { icon: Calendar, label: 'Date of Birth', value: profile.date_of_birth },
              { icon: Shield, label: 'Gender', value: profile.gender },
              { icon: MapPin, label: 'Address', value: profile.address },
            ].map((field, i) => (
              <div key={i} className="flex items-center gap-3">
                <field.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">{field.label}</p>
                  <p className="text-sm font-medium">{field.value}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Academic Info + Guardian */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Academic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Program</span>
                <span className="font-medium">{profile.program}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Department</span>
                <span className="font-medium">{profile.department}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Roll Number</span>
                <span className="font-mono font-medium">{profile.roll_number}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Semester</span>
                <span className="font-medium">{profile.semester}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Enrollment Date</span>
                <span className="font-medium">{profile.enrollment_date}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Guardian Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Guardian Name</span>
                <span className="font-medium">{profile.guardian_name}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Guardian Phone</span>
                <span className="font-medium">{profile.guardian_phone}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
