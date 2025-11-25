'use client';

import { useRouter } from 'next/navigation';
import {
    DashboardShell,
    DashboardHeader,
    DashboardHeaderTitle,
    DashboardContent,
} from "@/components/dashboard-shell";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Stethoscope, Calendar, CreditCard, Video, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function BookVisitPage() {
    const router = useRouter();

    const handleStartConsultation = () => {
        router.push('/consultation/intake');
    };

    return (
        <DashboardShell>
            <DashboardHeader>
                <DashboardHeaderTitle>Book a Consultation</DashboardHeaderTitle>
                <CardDescription>Start a new telehealth visit with a licensed provider.</CardDescription>
            </DashboardHeader>
            <DashboardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                    {/* Step 1 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">1</div>
                                Triage & Intake
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Tell us about your symptoms and medical history. We'll ensure telehealth is right for you.</p>
                        </CardContent>
                    </Card>

                    {/* Step 2 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">2</div>
                                Schedule & Pay
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Select a convenient time slot and complete your payment securely.</p>
                        </CardContent>
                    </Card>

                    {/* Step 3 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">3</div>
                                Video Consultation
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Join the waiting room and connect with your provider via high-quality video.</p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                        <CardTitle>Ready to start?</CardTitle>
                        <CardDescription>
                            Your profile information (demographics, insurance) will be automatically included.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="grid gap-2 sm:grid-cols-2 mb-4">
                            <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CheckCircle2 className="w-4 h-4 text-green-600" /> No waiting rooms
                            </li>
                            <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CheckCircle2 className="w-4 h-4 text-green-600" /> 24/7 Availability
                            </li>
                            <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CheckCircle2 className="w-4 h-4 text-green-600" /> Board-certified providers
                            </li>
                            <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CheckCircle2 className="w-4 h-4 text-green-600" /> Private & Secure
                            </li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button size="lg" onClick={handleStartConsultation} className="w-full sm:w-auto gap-2">
                            Start New Consultation <ArrowRight className="w-4 h-4" />
                        </Button>
                    </CardFooter>
                </Card>
            </DashboardContent>
        </DashboardShell>
    );
}
