
'use client';

import { assistWithDiagnosis } from '@/ai/flows/assist-with-diagnosis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { BrainCircuit, Loader2 } from 'lucide-react';
import React, { useState, useTransition } from 'react';

const placeholderSymptoms = `Persistent cough, fatigue, shortness of breath.`;
const placeholderHistory = `45 y/o male, HTN on Lisinopril. Non-smoker.`;

export default function DiagnosisClient() {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const [symptoms, setSymptoms] = useState(placeholderSymptoms);
    const [history, setHistory] = useState(placeholderHistory);
    const [diagnoses, setDiagnoses] = useState('');

    const handleGenerate = () => {
        startTransition(async () => {
            setDiagnoses('');
            try {
                const result = await assistWithDiagnosis({ symptoms, patientHistory: history });
                if (result.potentialDiagnoses) {
                    setDiagnoses(result.potentialDiagnoses);
                } else {
                    throw new Error("AI did not return the expected 'potentialDiagnoses' field.");
                }
            } catch (error: any) {
                console.error("Error during diagnosis assistance:", error);
                toast({
                    variant: "destructive",
                    title: "Error Assisting with Diagnosis",
                    description: error.message || "The AI model could not provide suggestions. Please try again.",
                });
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="text-accent" />
                    AI Diagnosis Assist
                </CardTitle>
                <CardDescription>Get a differential diagnosis based on patient data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="symptoms">Symptoms</Label>
                    <Textarea
                        id="symptoms"
                        placeholder="e.g., Fever, cough, sore throat"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        rows={3}
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="patient-history-dx">Relevant History</Label>
                    <Textarea
                        id="patient-history-dx"
                        placeholder="e.g., 52 y/o F, smoker, hx of asthma"
                        value={history}
                        onChange={(e) => setHistory(e.target.value)}
                        rows={2}
                    />
                </div>
                <Button onClick={handleGenerate} disabled={isPending || !symptoms} className="w-full">
                    {isPending ? <Loader2 className="animate-spin" /> : 'Get Suggestions'}
                </Button>
                {(isPending || diagnoses) && (
                    <div className="space-y-2">
                        <Label htmlFor="potential-diagnoses">Potential Diagnoses</Label>
                        <div
                            id="potential-diagnoses"
                            className="prose prose-sm prose-p:text-foreground dark:prose-invert min-h-[100px] w-full rounded-md border bg-secondary/50 px-3 py-2"
                        >
                            {isPending ? (
                                <div className="text-sm text-muted-foreground flex items-center justify-center p-4">
                                    <Loader2 className="animate-spin mr-2" />Analyzing...
                                </div>
                            ) : (
                                <pre className='text-wrap bg-transparent p-0 m-0 font-body'>{diagnoses}</pre>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">For clinical support purposes only. Not a substitute for professional medical judgment.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
