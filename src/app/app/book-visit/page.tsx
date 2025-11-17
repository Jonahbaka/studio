'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DashboardShell,
  DashboardHeader,
  DashboardHeaderTitle,
  DashboardContent,
} from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';


export default function BookVisitPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleStartAiVisit = async () => {
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'Authentication Error', description: 'Please log in again.' });
            return;
        }
        if (!reason) {
            toast({ variant: 'destructive', title: 'Reason Required', description: 'Please tell us why you need help today.' });
            return;
        }

        setIsSubmitting(true);

        try {
            const visitsCollection = collection(firestore, 'visits');
            const visitData = {
                patientId: user.uid,
                patientName: user.displayName || user.email || 'Unknown User',
                reason: reason,
                details: details,
                status: 'AI In Progress',
                createdAt: serverTimestamp(),
                participants: {
                    [user.uid]: true,
                }
            };
            
            const docRef = await addDoc(visitsCollection, visitData);

            toast({
                title: 'AI Consultation Started!',
                description: "You can now chat with our AI assistant.",
            });
            router.push(`/app/visit/ai/${docRef.id}`);

        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Booking Failed',
                description: error.message || 'Could not start your consultation. Check permissions or try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardShell>
            <DashboardHeader>
                <DashboardHeaderTitle>AI Symptom Checker</DashboardHeaderTitle>
                <CardDescription>Start a conversation with our AI assistant to get instant advice.</CardDescription>
            </DashboardHeader>
            <DashboardContent>
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Start a New AI Consultation</CardTitle>
                        <CardDescription>Tell us why you need help today. Our AI will listen and guide you.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="reason">What is your primary symptom or concern?</Label>
                             <Input 
                                id="reason" 
                                placeholder="e.g., Sore throat, headache, can't sleep..." 
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="details">Additional details (optional)</Label>
                            <Textarea 
                                id="details" 
                                placeholder="Please provide any additional information that might be helpful for the AI assistant." 
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                rows={5}
                            />
                        </div>
                        <Button onClick={handleStartAiVisit} disabled={isSubmitting || !reason} className="w-full">
                            {isSubmitting ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <>
                                <Sparkles className="mr-2" /> Start AI Consultation
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                            You will be connected to an AI assistant. This is not a substitute for medical advice.
                        </p>
                    </CardContent>
                </Card>
            </DashboardContent>
        </DashboardShell>
    );
}
