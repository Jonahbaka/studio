
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const getOrCreateProduct = async (name: string) => {
    const products = await stripe.products.list({ limit: 1, active: true });
    let product = products.data.find(p => p.name === name);
    if (!product) {
        product = await stripe.products.create({ name });
    }
    return product;
};

const getOrCreatePrice = async (productId: string, amount: number, interval?: Stripe.Price.Recurring.Interval) => {
    const prices = await stripe.prices.list({ product: productId, active: true });
    let price = prices.data.find(p => p.unit_amount === amount && p.recurring?.interval === interval);
    if (!price) {
        price = await stripe.prices.create({
            product: productId,
            unit_amount: amount,
            currency: 'usd',
            ...(interval && { recurring: { interval } }),
        });
    }
    return price;
};


const handleSubscription = async (plan: string, returnUrl: string) => {
    try {
        const product = await getOrCreateProduct('Zuma Gold Membership');
        const amount = plan === 'yearly' ? 12000 : 2500;
        const interval = plan === 'yearly' ? 'year' : 'month';
        const price = await getOrCreatePrice(product.id, amount, interval);
        
        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            line_items: [{ price: price.id, quantity: 1 }],
            mode: 'subscription',
            return_url: returnUrl,
            metadata: {
                subscription_plan: plan,
            }
        });

        return NextResponse.json({ clientSecret: session.client_secret });
    } catch (error) {
        console.error('Error creating subscription session:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: `Stripe Error: ${errorMessage}` }, { status: 500 });
    }
};

const handleOneTimePayment = async (visitId: string | null, returnUrl: string, appointmentData?: any) => {
     try {
        const product = await getOrCreateProduct(`ZumaTeledoc Consultation`);
        const price = await getOrCreatePrice(product.id, 4900);
        
        const metadata: Record<string, string> = {};
        if (visitId) {
          metadata.visitId = visitId;
        }
        if (appointmentData) {
          metadata.appointment = 'true';
          metadata.providerId = appointmentData.providerId;
          metadata.scheduledAt = appointmentData.scheduledAt;
          metadata.callType = appointmentData.callType;
          metadata.reasonForVisit = appointmentData.reasonForVisit;
        }
        
        const session = await stripe.checkout.sessions.create({
          ui_mode: 'embedded',
          line_items: [{ price: price.id, quantity: 1 }],
          mode: 'payment',
          return_url: returnUrl,
          metadata: metadata
        });

        return NextResponse.json({ clientSecret: session.client_secret });
      } catch (error) {
        console.error('Error creating one-time payment session:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
      }
}


export async function POST(request: Request) {
  const { visitId, plan, appointment } = await request.json();

  if (!visitId && !plan && !appointment) {
      return NextResponse.json({ error: 'A Visit ID, Subscription Plan, or Appointment is required' }, { status: 400 });
  }
  
  const baseUrl = request.headers.get('origin') || 'http://localhost:3000';
  const returnUrl = `${baseUrl}/return?session_id={CHECKOUT_SESSION_ID}${visitId ? `&visitId=${visitId}` : ''}${plan ? `&plan=${plan}` : ''}${appointment ? `&appointment=true` : ''}`;


  if (plan) {
    return handleSubscription(plan, returnUrl);
  }

  if (visitId || appointment) {
    return handleOneTimePayment(visitId || null, returnUrl, appointment);
  }
  
  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}
