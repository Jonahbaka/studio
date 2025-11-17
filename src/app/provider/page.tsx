
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Calendar, CheckCircle, MoreVertical, Video, Loader2 } from "lucide-react";
import Link from "next/link";
import SoapNoteClient from "./soap-note-client";
import DiagnosisClient from "./diagnosis-client";
import DispenseClient from "./dispense-client";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, DocumentData, Query } from "firebase/firestore";
import { formatDistanceToNowStrict } from 'date-fns';


const scheduledAppointments = [
    { time: '11:30 AM', patient: 'Olivia Brown', reason: 'Medication Refill' },
    { time: '02:00 PM', patient: 'James Wilson', reason: 'New Patient' },
];

function WaitingRoomContent() {
    const firestore = useFirestore();
    const { user } = useUser();

    // **FIX**: Query is only created when firestore and user are available.
    const waitingRoomQuery = useMemoFirebase(
      () => (firestore && user) ? query(collection(firestore, 'visits'), where('status', '==', 'Waiting')) : null,
      [firestore, user]
    );

    const { data: waitingRoom, isLoading } = useCollection(waitingRoomQuery as Query<DocumentData> | null);

    function calculateWaitTime(createdAt: any) {
        if (!createdAt?.toDate) return '...';
        return formatDistanceToNowStrict(createdAt.toDate(), { addSuffix: true });
    }
    
    if (isLoading) {
        return (
           <TableRow>
               <TableCell colSpan={4} className="h-24 text-center">
                   <Loader2 className="mx-auto animate-spin text-muted-foreground" />
               </TableCell>
           </TableRow>
       );
   }
   
   if (waitingRoom && waitingRoom.length > 0) {
       return waitingRoom.map(patient => {
           const avatar = PlaceHolderImages.find(p => p.id === 'avatar1');
           return (
               <TableRow key={patient.id}>
                   <TableCell>
                       <Link href={`/provider/chart/${patient.patientId}`} className="flex items-center gap-3 hover:underline">
                           <Avatar className="h-9 w-9">
                               {avatar && <AvatarImage src={avatar.imageUrl} alt={patient.patientName} />}
                               <AvatarFallback>{patient.patientName?.charAt(0) || 'P'}</AvatarFallback>
                           </Avatar>
                           <div className="font-medium">{patient.patientName}</div>
                       </Link>
                   </TableCell>
                   <TableCell className="hidden md:table-cell">{patient.reason}</TableCell>
                   <TableCell className="hidden sm:table-cell">
                       <Badge variant="outline">{calculateWaitTime(patient.createdAt)}</Badge>
                   </TableCell>
                   <TableCell className="text-right">
                       <Button asChild size="sm" className="bg-accent hover:bg-accent/90">
                           <Link href={`/app/visit/${patient.patientId}/${patient.id}`}>
                               <Video className="mr-2 h-4 w-4"/>
                               Start Visit
                           </Link>
                       </Button>
                   </TableCell>
               </TableRow>
           )
       })
   }
   
   return (
       <TableRow>
           <TableCell colSpan={4} className="h-24 text-center">
               The waiting room is empty.
           </TableCell>
       </TableRow>
   );
}


export default function ProviderDashboardPage() {
    
    return (
        <DashboardShell>
            <DashboardHeader>
                <DashboardHeaderTitle>Provider Dashboard</DashboardHeaderTitle>
                 <DashboardHeaderActions>
                    <div className="hidden md:flex items-center gap-2">
                        <CheckCircle className="text-green-500"/>
                        <span className="text-sm text-muted-foreground">Google Calendar Synced</span>
                    </div>
                    <Button variant="outline" className="hidden sm:inline-flex">Start Walk-in Visit</Button>
                </DashboardHeaderActions>
            </DashboardHeader>
            <DashboardContent>
                <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
                     <Card>
                        <CardHeader>
                            <CardTitle>Virtual Waiting Room</CardTitle>
                             <CardDescription>
                                Patients currently waiting for a consultation.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Patient</TableHead>
                                        <TableHead className="hidden md:table-cell">Reason</TableHead>
                                        <TableHead className="hidden sm:table-cell">Wait Time</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <WaitingRoomContent />
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                     <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Today's Schedule</CardTitle>
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
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/provider/schedule">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        View Full Schedule
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                     </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <SoapNoteClient />
                    <DiagnosisClient />
                    <DispenseClient />
                </div>
            </DashboardContent>
        </DashboardShell>
    );
}
