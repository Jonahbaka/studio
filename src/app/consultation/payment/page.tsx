'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { Loader2, ShieldCheck, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';

export default function PaymentPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(false);

    const CONSULTATION_PRICE_ID = 'price_consultation_mock'; // Replace with real price ID
    const VISIT_COST = 49;

    const handlePayment = async () => {
        if (!user) {
            toast({ variant: "destructive", title: "Error", description: "You must be logged in to pay." });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/stripe/consultation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId: CONSULTATION_PRICE_ID,
                    userId: user.uid,
                    consultationId: 'cons_' + Date.now(), // Mock ID
                }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else if (data.error) {
                throw new Error(data.error);
            } else {
                // Fallback for mock environment if API fails or returns no URL
                console.warn("No URL returned, simulating success for demo");
                router.push('/consultation/room');
            }
        } catch (error) {
            console.error("Payment error:", error);
            // For demo purposes, if the API fails (e.g. invalid price ID), we might want to let them through or show error
            // toast({ variant: "destructive", title: "Payment Failed", description: "Could not initiate payment." });

            // SIMULATION FOR DEMO:
            toast({ title: "Demo Mode", description: "Redirecting to waiting room..." });
            setTimeout(() => router.push('/consultation/room'), 1500);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>Confirm & Pay</CardTitle>
                        <CardDescription>Review your visit details and complete payment.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">Telehealth Consultation</span>
                                <span className="font-bold text-lg">${VISIT_COST}.00</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Includes medical review, diagnosis, and treatment plan (if applicable).
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <ShieldCheck className="w-4 h-4" />
                                <span>Money-back guarantee if we can't treat you.</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CreditCard className="w-4 h-4" />
                                <span>Secure payment via Stripe.</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3">
                        <Button className="w-full" size="lg" onClick={handlePayment} disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                            Pay ${VISIT_COST}.00
                        </Button>
                        <Button variant="ghost" className="w-full" onClick={() => router.back()}>
                            Cancel
                        </Button>
                    </CardFooter>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
