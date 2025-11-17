
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function ReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const [status, setStatus] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');
  const visitId = searchParams.get('visitId');
  const plan = searchParams.get('plan');

  useEffect(() => {
    if (!sessionId || !firestore || !user) {
        if (!sessionId) setError('Invalid session ID.');
        if (!firestore) setError('Database connection not available.');
        if (!user) setError('User not authenticated.');
        return;
    }
    
    if (!visitId && !plan) {
      setError('No visit or plan ID provided for confirmation.');
      return;
    }

    fetch(`/api/session-status?session_id=${sessionId}`)
      .then((res) => res.json())
      .then(async (data) => {
        if (data.error) {
            setError(data.error);
            setStatus('error');
            return;
        }

        setStatus(data.status);
        setCustomerEmail(data.customer_email);
        
        if (data.status === 'complete') {
            if (visitId) { // Handle one-time visit payment
                const visitRef = doc(firestore, 'visits', visitId);
                try {
                    await updateDoc(visitRef, {
                        status: 'Waiting',
                        paymentStatus: 'Paid',
                        updatedAt: serverTimestamp(),
                    });
                    toast({ title: "Payment Successful!", description: "You are now in the waiting room." });
                    // This is the "whisk away" moment.
                    router.push(`/app/visit/${user.uid}/${visitId}`);
                } catch (updateError: any) {
                    setError('Failed to update visit status. Please contact support.');
                    setStatus('error');
                }
            } else if (plan) { // Handle subscription payment
                const userRef = doc(firestore, 'users', user.uid);
                try {
                   await setDoc(userRef, { 
                       isGoldMember: true, 
                       goldMemberSince: serverTimestamp(),
                       subscriptionPlan: plan,
                    }, { merge: true });
                   toast({ title: "Upgrade Successful!", description: "Welcome to Zuma Gold!" });
                   router.push(`/app/billing`);
                } catch (updateError: any) {
                    setError('Failed to update your membership status. Please contact support.');
                    setStatus('error');
                }
            }
        }
      })
      .catch(err => {
        setError('Failed to retrieve payment status.');
        setStatus('error');
      });
  }, [sessionId, visitId, plan, router, toast, firestore, user]);

  if (status === 'complete') {
    return (
      <div className='text-center'>
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Payment Successful!</h1>
        <p className="text-muted-foreground mt-2">
            Thank you, {customerEmail}. You are being whisked away to the waiting room...
        </p>
        <Loader2 className="h-8 w-8 animate-spin mx-auto mt-6" />
      </div>
    );
  }

  if (status === 'open') {
    const tryAgainPath = plan ? `/app/billing` : `/checkout?visitId=${visitId}`;
    return (
       <div className='text-center'>
        <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Payment Incomplete</h1>
        <p className="text-muted-foreground mt-2">
            Your payment was not completed. You can close this window and try again.
        </p>
        <Button asChild className="mt-6">
            <Link href={tryAgainPath}>Try Again</Link>
        </Button>
      </div>
    );
  }

  if (status === 'error' || error) {
      return (
         <div className='text-center'>
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold">An Error Occurred</h1>
            <p className="text-destructive-foreground bg-destructive/20 p-2 rounded-md mt-2">
               {error || "An unknown error occurred while processing your payment."}
            </p>
            <Button asChild className="mt-6">
                <Link href="/app">Return to Dashboard</Link>
            </Button>
        </div>
      )
  }

  return (
    <div className='text-center'>
        <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Verifying Payment...</h1>
        <p className="text-muted-foreground mt-2">
            Please wait while we confirm your payment status. Do not close this window.
        </p>
    </div>
  );
}

export default function ReturnPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center p-4 bg-secondary">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">Payment Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<Loader2 className="h-16 w-16 animate-spin mx-auto" />}>
                        <ReturnContent />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}
