
'use client';

import { generateSoapNote } from '@/ai/flows/generate-soap-note';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';
import React, { useState, useTransition } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const placeholderHistory = `Patient is a 45-year-old male presenting with a persistent cough for the last 2 weeks. He reports associated fatigue and occasional shortness of breath. Denies fever or chills.
Past Medical History: Hypertension, managed with Lisinopril 10mg daily.
Social History: Non-smoker, drinks socially.
Vitals: BP 130/85, HR 78, Temp 98.6°F, O2 Sat 97% on room air.
`;

export default function SoapNoteClient() {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useUser();
    const [history, setHistory] = useState(placeholderHistory);
    const [soapNote, setSoapNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleGenerate = () => {
        startTransition(async () => {
            setSoapNote('');
            const result = await generateSoapNote({ patientHistory: history });
            if (result.soapNote) {
                setSoapNote(result.soapNote);
            } else {
                toast({
                    variant: "destructive",
                    title: "Error Generating SOAP Note",
                    description: "The AI model could not generate a SOAP note. Please try again.",
                });
            }
        });
    };

    const handleSave = async () => {
        if (!firestore || !user || !soapNote) return;
        setIsSaving(true);
        try {
            await addDoc(collection(firestore, 'medicalRecords'), {
                patientId: 'placeholder_patient_id', // In real app, pass via props
                providerId: user.uid,
                type: 'soap_note',
                data: {
                    soapNote: {
                        fullText: soapNote,
                        // Parse sections if needed
                    }
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                version: 1
            });
            toast({ title: "SOAP Note Saved", description: "Added to patient's medical record." });
            setSoapNote('');
            setHistory('');
        } catch (error) {
            console.error("Error saving note:", error);
            toast({ variant: "destructive", title: "Save Failed", description: "Could not save the note." });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="text-accent" />
                    AI-Generated SOAP Note
                </CardTitle>
                <CardDescription>Generate a preliminary SOAP note from patient history.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="patient-history">Patient History / Transcript</Label>
                    <Textarea
                        id="patient-history"
                        placeholder="Enter patient history or visit transcript..."
                        value={history}
                        onChange={(e) => setHistory(e.target.value)}
                        rows={8}
                    />
                </div>
                <Button onClick={handleGenerate} disabled={isPending || !history} className="w-full">
                    {isPending ? <Loader2 className="animate-spin" /> : 'Generate Note'}
                </Button>
                {(isPending || soapNote) && (
                    <div className="space-y-2">
                        <Label htmlFor="soap-note">Generated SOAP Note (Editable)</Label>
                        <Textarea
                            id="soap-note"
                            placeholder="SOAP Note will appear here..."
                            value={soapNote}
                            onChange={(e) => setSoapNote(e.target.value)}
                            rows={10}
                            disabled={isPending}
                            className="bg-secondary/50"
                        />
                        {isPending && <div className="text-sm text-muted-foreground flex items-center justify-center p-4"><Loader2 className="animate-spin mr-2" />Generating...</div>}
                    </div>
                )}
                {soapNote && !isPending && (
                    <div className="flex gap-2">
                        <Button className="w-full" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <Loader2 className="animate-spin" /> : 'Accept & Save to Chart'}
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => setSoapNote('')}>Clear</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
