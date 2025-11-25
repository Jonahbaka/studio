'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { FileText, Download, Pill, Activity, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function VisitSummaryPage() {
    // Mock data
    const visitData = {
        date: new Date().toLocaleDateString(),
        provider: "Dr. Sarah Smith",
        diagnosis: "Acute Pharyngitis (Sore Throat)",
        treatmentPlan: "Rest, hydration, and completion of prescribed antibiotics. Follow up if symptoms worsen after 3 days.",
        prescriptions: [
            { name: "Amoxicillin 500mg", instructions: "Take 1 capsule every 8 hours for 10 days" },
            { name: "Ibuprofen 400mg", instructions: "Take 1 tablet every 6 hours as needed for pain/fever" }
        ]
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center">
                <Card className="w-full max-w-3xl">
                    <CardHeader className="text-center border-b bg-green-50/50">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl text-green-700">Visit Completed</CardTitle>
                        <CardDescription>
                            Your consultation with {visitData.provider} on {visitData.date} has been finalized.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 p-8">
                        {/* Diagnosis */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-600" /> Diagnosis
                            </h3>
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-900">
                                {visitData.diagnosis}
                            </div>
                        </div>

                        {/* Treatment Plan */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-600" /> Treatment Plan
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                {visitData.treatmentPlan}
                            </p>
                        </div>

                        {/* Prescriptions */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Pill className="w-5 h-5 text-purple-600" /> Prescriptions Sent
                            </h3>
                            <div className="grid gap-3">
                                {visitData.prescriptions.map((rx, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-white border rounded-lg shadow-sm">
                                        <div>
                                            <p className="font-medium text-gray-900">{rx.name}</p>
                                            <p className="text-sm text-gray-500">{rx.instructions}</p>
                                        </div>
                                        <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                            Sent to Pharmacy
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-6 bg-gray-50/50">
                        <Button variant="outline" asChild>
                            <Link href="/app">Return to Dashboard</Link>
                        </Button>
                        <Button className="gap-2">
                            <Download className="w-4 h-4" /> Download Summary PDF
                        </Button>
                    </CardFooter>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
