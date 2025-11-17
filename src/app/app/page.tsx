
'use client';

import Link from "next/link";
import {
  DashboardShell,
  DashboardHeader,
  DashboardHeaderTitle,
  DashboardContent,
  DashboardHeaderActions,
} from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Pill, MessageSquare, ArrowRight } from "lucide-react";
import { useUser } from "@/firebase";

export default function PatientDashboard() {
  const { user } = useUser();
  const firstName = user?.displayName?.split(' ')[0] || 'User';

  return (
    <DashboardShell>
      <DashboardHeader>
        <DashboardHeaderTitle>Welcome, {firstName}!</DashboardHeaderTitle>
        <DashboardHeaderActions>
            <Button asChild>
                <Link href="/app/book-visit">Book New Visit</Link>
            </Button>
        </DashboardHeaderActions>
      </DashboardHeader>
      <DashboardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Appointment
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">No appointments</div>
              <p className="text-xs text-muted-foreground">
                You have no upcoming appointments.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">No recent orders</div>
              <p className="text-xs text-muted-foreground">
                You have no recent orders.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">No new messages</div>
              <p className="text-xs text-muted-foreground">You have no unread messages.</p>
            </CardContent>
          </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Your Treatment Plan</CardTitle>
                <CardDescription>Follow your personalized plan for best results.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center justify-between p-4 rounded-md bg-secondary">
                  <div>
                      <h4 className="font-semibold">No active treatment plans</h4>
                      <p className="text-sm text-muted-foreground">Book a visit to get started.</p>
                  </div>
                  <Button variant="ghost" asChild>
                      <Link href="/app/book-visit">Book a Visit <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
              </div>
            </CardContent>
        </Card>
      </DashboardContent>
    </DashboardShell>
  );
}
