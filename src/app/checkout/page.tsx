
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/shared/logo';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const visitId = searchParams.get('visitId');
  const plan = searchParams.get('plan');

  useEffect(() => {
    if (!visitId && !plan) {
      const errorMsg = 'No visit or plan provided. Cannot initiate payment.';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMsg,
      });
      setLoadingError(errorMsg);
      return;
    }

    fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ visitId, plan }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          const errorMsg = data.error || 'An unknown error occurred.';
          toast({
            variant: 'destructive',
            title: 'Error Creating Payment Session',
            description: errorMsg,
          });
          setLoadingError(errorMsg);
        }
      })
      .catch(() => {
        const errorMsg = 'Could not connect to the server to start payment.';
        toast({
          variant: 'destructive',
          title: 'Network Error',
          description: errorMsg,
        });
        setLoadingError(errorMsg);
      });
  }, [toast, visitId, plan]);

  if (loadingError) {
      return (
         <div className="text-center text-destructive">
            <p>Could not initialize checkout.</p>
            <p className="text-sm">{loadingError}</p>
        </div>
      )
  }

  if (!clientSecret) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Preparing your secure checkout...</p>
        </div>
    );
  }

  return (
    <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
      <EmbeddedCheckout className='w-full' />
    </EmbeddedCheckoutProvider>
  );
}


export default function CheckoutPage() {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 bg-secondary">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4">
                        <Logo />
                    </div>
                    <CardTitle>Secure Checkout</CardTitle>
                    <CardDescription>Complete your payment securely below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                             <p className="mt-4 text-sm text-muted-foreground">Loading payment options...</p>
                        </div>
                    }>
                        <CheckoutForm />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
