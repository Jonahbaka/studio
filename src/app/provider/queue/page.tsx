
'use client';

import Link from "next/link";
import {
  DashboardShell,
  DashboardHeader,
  DashboardHeaderTitle,
  DashboardContent,
  DashboardHeaderActions
} from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Loader2, Video } from "lucide-react";
import { formatDistanceToNowStrict } from 'date-fns';
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, DocumentData, Query } from "firebase/firestore";
import { useIsMobile } from "@/hooks/use-mobile";

function WaitingRoomContent() {
    const firestore = useFirestore();
    const { user } = useUser();
    const isMobile = useIsMobile();

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
             <div className="flex justify-center items-center h-48">
                <Loader2 className="mx-auto animate-spin text-muted-foreground" />
             </div>
        );
    }
    
    if (!waitingRoom || waitingRoom.length === 0) {
        return (
            <div className="text-center py-16">
                <h3 className="text-lg font-semibold">The waiting room is empty.</h3>
            </div>
        );
    }

    if (isMobile) {
        return (
            <div className="space-y-4">
                {waitingRoom.map(patient => {
                    const avatar = PlaceHolderImages.find(p => p.id === 'avatar1');
                    return (
                        <Card key={patient.id}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <Link href={`/provider/chart/${patient.patientId}`} className="flex items-center gap-3 hover:underline">
                                    <Avatar className="h-10 w-10">
                                        {avatar && <AvatarImage src={avatar.imageUrl} alt={patient.patientName} />}
                                        <AvatarFallback>{patient.patientName?.charAt(0) || 'P'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{patient.patientName}</div>
                                        <div className="text-sm text-muted-foreground">{patient.reason}</div>
                                        <Badge variant="outline" className="mt-1">{calculateWaitTime(patient.createdAt)}</Badge>
                                    </div>
                                </Link>
                                <Button asChild size="sm" className="bg-accent hover:bg-accent/90 shrink-0">
                                    <Link href={`/app/visit/${patient.patientId}/${patient.id}`}>
                                        <Video className="mr-2 h-4 w-4"/>
                                        Start
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        )
    }
    
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Reason for Visit</TableHead>
                    <TableHead>Wait Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
               {waitingRoom.map(patient => {
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
                            <TableCell>{patient.reason}</TableCell>
                            <TableCell>
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
                })}
            </TableBody>
        </Table>
    );
}

export default function ProviderQueuePage() {

    return (
        <DashboardShell>
            <DashboardHeader>
                <DashboardHeaderTitle>Virtual Waiting Room</DashboardHeaderTitle>
                <DashboardHeaderActions>
                    <Button variant="outline">Start Walk-in Visit</Button>
                </DashboardHeaderActions>
            </DashboardHeader>
            <DashboardContent>
                <Card>
                    <CardHeader>
                        <CardTitle>Patients Awaiting Consultation</CardTitle>
                        <CardDescription>
                            This is a real-time view of patients in the queue.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <WaitingRoomContent />
                    </CardContent>
                </Card>
            </DashboardContent>
        </DashboardShell>
    );
}
