import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
    try {
        const { priceId, userId, consultationId } = await req.json();

        if (!userId || !priceId) {
            return NextResponse.json({ error: 'Missing userId or priceId' }, { status: 400 });
        }

        // Mock payment for test environment
        if (priceId === 'price_consultation_mock') {
            const mockUrl = `${req.nextUrl.origin}/consultation/room?success=true&session_id=mock_session_${Date.now()}&consultationId=${consultationId}`;
            return NextResponse.json({ url: mockUrl });
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'payment', // One-time payment
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${req.nextUrl.origin}/consultation/room?success=true&session_id={CHECKOUT_SESSION_ID}&consultationId=${consultationId}`,
            cancel_url: `${req.nextUrl.origin}/consultation/payment?canceled=true`,
            metadata: {
                userId,
                consultationId,
                type: 'consultation'
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe Consultation Checkout Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
