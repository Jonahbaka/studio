'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';

const PLANS = [
    {
        id: 'monthly',
        name: 'Monthly Care',
        price: '$25',
        period: '/month',
        description: 'Flexible care for your needs.',
        features: ['Unlimited messaging', '2 Video visits/mo', 'Prescription renewals'],
        popular: false
    },
    {
        id: 'yearly',
        name: 'Annual Wellness',
        price: '$150', // 50% off $300 ($25*12)
        period: '/year',
        description: 'Best value for long-term health.',
        features: ['Unlimited messaging', 'Unlimited video visits', 'Priority support', '50% Discount applied'],
        popular: true
    },
    {
        id: 'dev',
        name: 'Developer Test',
        price: '$0',
        period: '/forever',
        description: 'For testing purposes only.',
        features: ['Mock payments', 'Test features'],
        popular: false
    }
];

export default function BillingPage() {
    const { toast } = useToast();
    const { user } = useUser();
    const [loading, setLoading] = useState<string | null>(null);

    const handleSubscribe = async (planId: string) => {
        setLoading(planId);

        // Map internal plan IDs to Stripe Price IDs
        // TODO: Replace with real Stripe Price IDs from your dashboard
        const priceMap: Record<string, string> = {
            'monthly': 'price_1Q...',
            'yearly': 'price_1Q...',
            'dev': 'price_test'
        };

        const stripePriceId = priceMap[planId];

        if (!stripePriceId) {
            toast({ variant: "destructive", title: "Error", description: "Invalid plan selected." });
            setLoading(null);
            return;
        }

        try {
            // Get the current user's ID token (if needed for auth)
            // const token = await user?.getIdToken(); 

            const response = await fetch('/api/stripe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    priceId: stripePriceId,
                    userId: user?.uid
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout session');
            }

            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error: any) {
            console.error(error);
            toast({ variant: "destructive", title: "Checkout Failed", description: error.message });
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Simple, Transparent Pricing</h1>
                <p className="text-muted-foreground">Choose the plan that fits your health journey.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {PLANS.map((plan) => (
                    <Card key={plan.id} className={`relative flex flex-col ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
                        {plan.popular && (
                            <div className="absolute -top-4 left-0 right-0 flex justify-center">
                                <Badge className="px-4 py-1">Most Popular</Badge>
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle>{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="mb-4">
                                <span className="text-4xl font-bold">{plan.price}</span>
                                <span className="text-muted-foreground">{plan.period}</span>
                            </div>
                            <ul className="space-y-2">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm">
                                        <Check className="h-4 w-4 text-green-500" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => handleSubscribe(plan.id)} disabled={!!loading}>
                                {loading === plan.id ? 'Processing...' : 'Subscribe Now'}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <div className="max-w-4xl mx-auto mt-12">
                <h2 className="text-2xl font-bold mb-4">Billing History</h2>
                <Card>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Monthly Care Subscription</p>
                                            <p className="text-sm text-muted-foreground">Nov {22 - i}, 2025</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-medium">$25.00</span>
                                        <Button variant="ghost" size="icon">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
