import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
// Note: In a real production app, you should use environment variables for the service account
// or rely on Application Default Credentials.
const initFirebaseAdmin = () => {
    if (getApps().length === 0) {
        // For local development without service account, we might skip verification or mock it.
        // However, assuming we have GOOGLE_APPLICATION_CREDENTIALS or similar:
        initializeApp();
    }
};

export async function POST(req: NextRequest) {
    try {
        const { priceId, userId } = await req.json();
        const authHeader = req.headers.get('Authorization');

        if (!userId || !priceId) {
            return NextResponse.json({ error: 'Missing userId or priceId' }, { status: 400 });
        }

        // TODO: Verify the ID token from the Authorization header
        // initFirebaseAdmin();
        // const token = authHeader?.split('Bearer ')[1];
        // if (token) {
        //   const decodedToken = await getAuth().verifyIdToken(token);
        //   if (decodedToken.uid !== userId) {
        //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        //   }
        // }

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${req.nextUrl.origin}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.nextUrl.origin}/billing?canceled=true`,
            metadata: {
                userId,
            },
            // Optional: Add a 50% off coupon if applicable
            discounts: priceId === 'price_annual' ? [{ coupon: '50_OFF_1YR' }] : undefined,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
