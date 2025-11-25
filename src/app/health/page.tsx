'use client';

import { useEffect, useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, Activity, Pill, Download } from 'lucide-react';
import { MedicalRecord } from '@/types/schema';
import { format } from 'date-fns';

export default function HealthPortalPage() {
    const firestore = useFirestore();
    const { user } = useUser();
    const [records, setRecords] = useState<MedicalRecord[]>([]);

    useEffect(() => {
        const fetchRecords = async () => {
            if (!firestore || !user) return;
            const q = query(collection(firestore, 'medicalRecords'), where('patientId', '==', user.uid), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            setRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
        };
        fetchRecords();
    }, [firestore, user]);

    const soapNotes = records.filter(r => r.type === 'soap_note');
    const labs = records.filter(r => r.type === 'lab_result');
    const prescriptions = records.filter(r => r.type === 'prescription');

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Health Portal</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent Visits</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{soapNotes.length}</div>
                        <p className="text-xs text-muted-foreground">Last visit: {soapNotes[0] ? format(new Date(soapNotes[0].createdAt), 'MMM d') : 'N/A'}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lab Results</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{labs.length}</div>
                        <p className="text-xs text-muted-foreground">{labs.filter(l => !l.data.viewed).length} new results</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Meds</CardTitle>
                        <Pill className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{prescriptions.length}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="records" className="w-full">
                <TabsList>
                    <TabsTrigger value="records">Visit Records</TabsTrigger>
                    <TabsTrigger value="labs">Lab Results</TabsTrigger>
                    <TabsTrigger value="medications">Medications</TabsTrigger>
                </TabsList>

                <TabsContent value="records" className="space-y-4">
                    {soapNotes.map(note => (
                        <Card key={note.id}>
                            <CardHeader>
                                <CardTitle>Visit Summary - {format(new Date(note.createdAt), 'PPP')}</CardTitle>
                                <CardDescription>Dr. {note.providerId}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-2">
                                    <div><span className="font-semibold">Assessment:</span> {note.data.soapNote?.assessment}</div>
                                    <div><span className="font-semibold">Plan:</span> {note.data.soapNote?.plan}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="labs" className="space-y-4">
                    {labs.map(lab => (
                        <Card key={lab.id}>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>{lab.data.testName || 'Lab Result'}</CardTitle>
                                    <CardDescription>{format(new Date(lab.createdAt), 'PPP')}</CardDescription>
                                </div>
                                <Button variant="outline" size="sm">
                                    <Download className="mr-2 h-4 w-4" /> Download PDF
                                </Button>
                            </CardHeader>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    );
}
