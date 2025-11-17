
'use client';

import {
  DashboardShell,
  DashboardHeader,
  DashboardHeaderTitle,
  DashboardContent,
  DashboardHeaderActions,
} from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, MoreVertical } from "lucide-react";

const scheduledAppointments = [
    { time: '10:00 AM', patient: 'Liam Johnson', reason: 'Follow-up' },
    { time: '11:30 AM', patient: 'Olivia Brown', reason: 'Medication Refill' },
    { time: '02:00 PM', patient: 'James Wilson', reason: 'New Patient' },
];


export default function ProviderSchedulePage() {

  return (
    <DashboardShell>
      <DashboardHeader>
        <DashboardHeaderTitle>My Schedule</DashboardHeaderTitle>
        <DashboardHeaderActions>
            <div className="hidden md:flex items-center gap-2">
                <CheckCircle className="text-green-500"/>
                <span className="text-sm text-muted-foreground">Google Calendar Synced</span>
            </div>
            <Button>Schedule New</Button>
        </DashboardHeaderActions>
      </DashboardHeader>
      <DashboardContent>
        <div className="grid gap-6 md:grid-cols-[1fr_350px] lg:grid-cols-[1fr_400px]">
            <Card>
                <CardHeader>
                    <CardTitle>Calendar</CardTitle>
                    <CardDescription>Your synced schedule. Click on a date to view appointments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Calendar
                        mode="single"
                        selected={new Date()}
                        className="p-0 [&_td]:w-full [&_td]:h-12 [&_th]:w-full"
                    />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Appointments for Today</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {scheduledAppointments.map(apt => (
                        <div key={apt.patient} className="flex items-start justify-between p-3 rounded-lg bg-secondary">
                            <div>
                                <p className="font-semibold">{apt.patient}</p>
                                <p className="text-sm text-muted-foreground">{apt.reason}</p>
                            </div>
                            <div className="text-right">
                                <Badge variant="outline">{apt.time}</Badge>
                                <Button variant="ghost" size="icon" className="h-8 w-8 mt-1">
                                    <MoreVertical className="h-4 w-4"/>
                                </Button>
                            </div>
                        </div>
                    ))}
                     {scheduledAppointments.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">No appointments scheduled for today.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </DashboardContent>
    </DashboardShell>
  );
}
