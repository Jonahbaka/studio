import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { adminDb } from '@/lib/firebase-admin';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;

                if (!userId) {
                    console.error('Missing userId in session metadata');
                    break;
                }

                // Update user in Firestore
                await adminDb.collection('users').doc(userId).update({
                    subscription: {
                        status: 'active',
                        plan: 'premium', // You might want to derive this from the price ID
                        stripeCustomerId: session.customer as string,
                        stripeSubscriptionId: session.subscription as string,
                        updatedAt: new Date(),
                    },
                    role: 'patient', // Ensure they are marked as patient (or keep existing)
                });

                console.log(`User ${userId} subscription activated.`);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                // Find user by stripeSubscriptionId and update status
                // This requires querying users by subscriptionId which might need an index
                // For now, we'll log it.
                console.log('Subscription deleted:', subscription.id);
                break;
            }

            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    } catch (error: any) {
        console.error('Error handling webhook event:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
