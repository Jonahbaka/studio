'use client';

import { useEffect, useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Video, Calendar, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Appointment } from '@/types/schema';

export default function AppointmentsPage() {
    const firestore = useFirestore();
    const { user } = useUser();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firestore || !user) return;

        const q = query(
            collection(firestore, 'appointments'),
            where('patientId', '==', user.uid),
            orderBy('scheduledAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedAppointments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                scheduledAt: doc.data().scheduledAt?.toDate(),
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate(),
            } as Appointment));
            setAppointments(fetchedAppointments);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [firestore, user]);

    const upcoming = appointments.filter(a => ['scheduled', 'in-progress'].includes(a.status) && a.scheduledAt > new Date());
    const past = appointments.filter(a => ['completed', 'cancelled', 'no-show'].includes(a.status) || a.scheduledAt <= new Date());

    const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
        <Card className="mb-4">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            {appointment.type === 'video' && <Video className="h-4 w-4 text-blue-500" />}
                            {appointment.reasonForVisit}
                        </CardTitle>
                        <CardDescription>
                            {format(appointment.scheduledAt, 'PPP')} at {format(appointment.scheduledAt, 'p')}
                        </CardDescription>
                    </div>
                    <Badge variant={appointment.status === 'scheduled' ? 'default' : 'secondary'}>
                        {appointment.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {appointment.durationMinutes} mins
                    </div>
                    <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        Video Consultation
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                {appointment.status === 'scheduled' && (
                    <>
                        <Button variant="outline" size="sm">Reschedule</Button>
                        <Button size="sm" asChild>
                            <Link href={`/appointments/${appointment.id}`}>Join Call</Link>
                        </Button>
                    </>
                )}
            </CardFooter>
        </Card>
    );

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
                <Button asChild>
                    <Link href="/appointments/book">Book New Appointment</Link>
                </Button>
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList>
                    <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
                    <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="upcoming" className="mt-4">
                    {upcoming.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No upcoming appointments.
                        </div>
                    ) : (
                        upcoming.map(apt => <AppointmentCard key={apt.id} appointment={apt} />)
                    )}
                </TabsContent>
                <TabsContent value="past" className="mt-4">
                    {past.map(apt => <AppointmentCard key={apt.id} appointment={apt} />)}
                </TabsContent>
            </Tabs>
        </div>
    );
}
