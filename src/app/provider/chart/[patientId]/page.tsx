
'use client';

import { useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardContent, DashboardHeader, DashboardHeaderActions, DashboardHeaderTitle, DashboardShell } from "@/components/dashboard-shell";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Edit, FileText, Pill, PlusCircle, Stethoscope, Loader2 } from "lucide-react";
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { differenceInYears } from 'date-fns';

export default function PatientChartPage() {
    const params = useParams();
    const firestore = useFirestore();
    const patientId = params.patientId as string;

    const patientRef = useMemoFirebase(() => 
        firestore && patientId ? doc(firestore, 'users', patientId) : null,
        [firestore, patientId]
    );

    const { data: patient, isLoading } = useDoc(patientRef);
    
    const avatar = PlaceHolderImages.find(p => p.id === 'avatar1');

    const getAge = (dob: string | undefined) => {
        if (!dob) return '';
        try {
            return differenceInYears(new Date(), new Date(dob));
        } catch (e) {
            return '';
        }
    }

    if (isLoading) {
        return (
            <DashboardShell>
                <DashboardHeader>
                    <DashboardHeaderTitle>Loading Patient Chart...</DashboardHeaderTitle>
                </DashboardHeader>
                <DashboardContent>
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-12 w-12 animate-spin" />
                    </div>
                </DashboardContent>
            </DashboardShell>
        );
    }
    
    if (!patient) {
        return (
             <DashboardShell>
                <DashboardHeader>
                    <DashboardHeaderTitle>Patient Not Found</DashboardHeaderTitle>
                </DashboardHeader>
                <DashboardContent>
                    <Card>
                        <CardContent className="pt-6">
                            <p>No patient data could be found for the specified ID.</p>
                        </CardContent>
                    </Card>
                </DashboardContent>
            </DashboardShell>
        );
    }

    const age = getAge(patient.dateOfBirth);

    return (
        <DashboardShell>
            <DashboardHeader className="flex-col items-start gap-4 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        {avatar && <AvatarImage src={avatar.imageUrl} alt={patient.firstName} />}
                        <AvatarFallback className="text-2xl">{`${patient.firstName?.[0] ?? ''}${patient.lastName?.[0] ?? ''}`}</AvatarFallback>
                    </Avatar>
                    <div>
                        <DashboardHeaderTitle>{patient.firstName} {patient.lastName}</DashboardHeaderTitle>
                        <div className="text-muted-foreground flex flex-col sm:flex-row sm:gap-4 text-sm">
                            <span>MRN: {patient.id.substring(0, 8).toUpperCase()}</span>
                            {patient.dateOfBirth && <span>DOB: {patient.dateOfBirth} ({age})</span>}
                            <span>Gender: {patient.gender || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                <DashboardHeaderActions className="w-full md:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto"><Edit className="mr-2"/>Edit Chart</Button>
                    <Button className="w-full sm:w-auto"><Stethoscope className="mr-2"/>Start Visit</Button>
                </DashboardHeaderActions>
            </DashboardHeader>
            <DashboardContent>
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Clinical Notes</CardTitle>
                                <CardDescription>Last updated: 3 hours ago</CardDescription>
                            </CardHeader>
                            <CardContent>
                               <p className="prose prose-sm dark:prose-invert max-w-none">{patient.notes || 'No clinical notes available.'}</p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>Recent History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    {/* This would be populated by a subcollection query */}
                                    <li className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground"/> <span>No recent visits found.</span></li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Vitals</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <dt className="text-muted-foreground">Height</dt>
                                    <dd className="font-medium text-right">{patient.vitals?.height || 'N/A'}</dd>
                                    <dt className="text-muted-foreground">Weight</dt>
                                    <dd className="font-medium text-right">{patient.vitals?.weight || 'N/A'}</dd>
                                    <dt className="text-muted-foreground">BMI</dt>
                                    <dd className="font-medium text-right">{patient.vitals?.bmi || 'N/A'}</dd>
                                    <dt className="text-muted-foreground">Blood Pressure</dt>
                                    <dd className="font-medium text-right">{patient.vitals?.bloodPressure || 'N/A'}</dd>
                                </dl>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex-row items-center justify-between">
                                <CardTitle>Allergies</CardTitle>
                                <Button variant="ghost" size="icon"><PlusCircle className="h-4 w-4"/></Button>
                            </CardHeader>
                            <CardContent>
                                {patient.allergies?.length > 0 ? 
                                    patient.allergies.map((allergy: string) => <Badge key={allergy} variant="destructive" className="mr-1">{allergy}</Badge>) :
                                    <p className="text-sm text-muted-foreground">No known allergies.</p>
                                }
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex-row items-center justify-between">
                                <CardTitle>Medications</CardTitle>
                                <Button variant="ghost" size="icon"><PlusCircle className="h-4 w-4"/></Button>
                            </CardHeader>
                            <CardContent>
                                {patient.medications?.length > 0 ? (
                                    patient.medications.map((med: string) => <Badge key={med} variant="secondary" className="mr-1">{med}</Badge>)
                                ): (
                                    <p className="text-sm text-muted-foreground">No active medications.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DashboardContent>
        </DashboardShell>
    );
}
