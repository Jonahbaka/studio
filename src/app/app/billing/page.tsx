
'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DashboardShell,
  DashboardHeader,
  DashboardHeaderTitle,
  DashboardContent,
} from "@/components/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, CreditCard, Loader2, Star, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";

const goldFeatures = [
    '50% off on one treatment purchase',
    'Priority support from our team',
    'Exclusive access to new treatments',
    'Lower-cost prescription renewals'
]

export default function BillingPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isProcessing, setIsProcessing] = useState(false);
  
  const visitIdForPayment = searchParams.get('visitId');

  const userProfileRef = useMemoFirebase(() =>
    firestore && user ? doc(firestore, 'users', user.uid) : null,
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  // This is a placeholder for a real Stripe integration.
  const handlePayment = async (plan?: 'monthly' | 'yearly') => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: "Error", description: 'You must be logged in to make a payment.'});
      return;
    }

    setIsProcessing(true);
    
    if (visitIdForPayment) {
        // Redirect to the new checkout page for one-time visit payment
        router.push(`/checkout?visitId=${visitIdForPayment}`);
        return; 
    }
    
    if (plan) {
        // Redirect to checkout for Gold membership subscription
        router.push(`/checkout?plan=${plan}`);
        return;
    }

    // Fallback for the old logic, should not be hit with new UI
    console.log("Simulating payment processing for Gold membership for user:", user.uid);
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
        const userRef = doc(firestore, 'users', user.uid);
        await setDoc(userRef, { isGoldMember: true, goldMemberSince: new Date() }, { merge: true });
        toast({
            title: "Upgrade Successful!",
            description: "Welcome to Zuma Gold! Your benefits are now active.",
        });
    } catch (error: any) {
        toast({ variant: 'destructive', title: "Payment Failed", description: error.message || 'Could not process your payment.'});
    } finally {
        setIsProcessing(false);
    }
  }

  const isLoading = isProfileLoading && !userProfile;
  
  const ConsultationPaymentCard = () => (
    <Card className="flex flex-col border-primary shadow-primary/20 shadow-lg">
        <CardHeader>
            <CardTitle>Consultation Fee</CardTitle>
            <CardDescription>Finalize payment to enter the waiting room and see a doctor.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
             <div className="p-6 my-4 bg-secondary rounded-lg flex items-center justify-between">
                <span className="font-medium text-lg">One-time Fee</span>
                <span className="font-bold text-2xl text-primary">$49.00</span>
            </div>
             <p className="text-sm text-muted-foreground">Your visit reason has been recorded. Click below to pay and connect with a provider.</p>
        </CardContent>
        <CardFooter>
             <Button onClick={() => handlePayment()} disabled={isProcessing} size="lg" className="w-full">
                {isProcessing ? <Loader2 className="animate-spin" /> : (
                    <>
                        <CreditCard className="mr-2" /> Pay $49.00 & Enter Waiting Room
                    </>
                )}
            </Button>
        </CardFooter>
    </Card>
  );

  if (visitIdForPayment) {
      return (
        <DashboardShell>
            <DashboardHeader>
                <DashboardHeaderTitle>Finalize Payment</DashboardHeaderTitle>
            </DashboardHeader>
            <DashboardContent>
                <div className="max-w-md mx-auto">
                    <ConsultationPaymentCard />
                </div>
            </DashboardContent>
        </DashboardShell>
      )
  }


  return (
    <DashboardShell>
      <DashboardHeader>
        <DashboardHeaderTitle>Billing & Membership</DashboardHeaderTitle>
      </DashboardHeader>
      <DashboardContent>
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>Your Current Plan</CardTitle>
                    <CardDescription>Manage your membership status and view history.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-24">
                      <Loader2 className="animate-spin" />
                    </div>
                  ) : userProfile?.isGoldMember ? (
                      <div className="p-6 rounded-lg bg-yellow-400/10 border border-yellow-500/30 text-center">
                          <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-yellow-300">You are a Gold Member!</h3>
                          <p className="text-yellow-400/80 text-sm">Your benefits are active. Member since {userProfile.goldMemberSince?.toDate().toLocaleDateString()}</p>
                      </div>
                  ) : (
                      <div className="p-6 rounded-lg bg-secondary text-center">
                          <h3 className="text-xl font-bold">Standard Plan</h3>
                          <p className="text-muted-foreground text-sm">Upgrade to Gold for exclusive benefits.</p>
                      </div>
                  )}
                </CardContent>
                 <CardFooter>
                    <p className="text-xs text-muted-foreground">For support, please <Link href="/contact" className="underline">contact us</Link>.</p>
                </CardFooter>
            </Card>

            <Card className="flex flex-col border-accent shadow-accent/20 shadow-lg">
                <CardHeader className="relative text-center bg-accent/10 p-6">
                    <Star className="w-10 h-10 mx-auto text-accent mb-2"/>
                    <CardTitle className="text-2xl">Zuma Gold</CardTitle>
                    <CardDescription className="text-accent-foreground/80">Unlock exclusive savings on low-cost prescription meds.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 p-6 space-y-4">
                    <ul className="space-y-3 text-sm">
                       {goldFeatures.map((feature, i) => (
                           <li key={i} className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span>{feature}</span>
                           </li>
                       ))}
                    </ul>
                </CardContent>
                <CardFooter className="flex-col gap-4 p-6 border-t">
                    <div className="w-full space-y-2">
                        <Button onClick={() => handlePayment('monthly')} disabled={isProcessing || userProfile?.isGoldMember} size="lg" className="w-full bg-primary hover:bg-primary/90">
                            {isProcessing ? <Loader2 className="animate-spin" /> : (userProfile?.isGoldMember ? 'You are a Gold Member' : 'Upgrade Monthly - $25/mo')}
                        </Button>
                        <Button onClick={() => handlePayment('yearly')} disabled={isProcessing || userProfile?.isGoldMember} size="lg" className="w-full bg-accent hover:bg-accent/90">
                            {isProcessing ? <Loader2 className="animate-spin" /> : (userProfile?.isGoldMember ? 'You are a Gold Member' : 'Upgrade Yearly - $120/yr (Save 60%)')}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Billed as $120/year or $25/month.</p>
                </CardFooter>
            </Card>
        </div>
      </DashboardContent>
    </DashboardShell>
  );
}
