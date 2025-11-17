
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const handleSubscription = async (plan: string, returnUrl: string) => {
    let price;
    const productName = 'Zuma Gold Membership';

    try {
        // Check if product exists
        const products = await stripe.products.list({ limit: 1, active: true });
        let product = products.data.find(p => p.name === productName);

        if (!product) {
            product = await stripe.products.create({ name: productName });
        }

        if (plan === 'yearly') {
            price = await stripe.prices.create({
                product: product.id,
                unit_amount: 12000, // $120.00
                currency: 'usd',
                recurring: { interval: 'year' },
            });
        } else { // default to monthly
            price = await stripe.prices.create({
                product: product.id,
                unit_amount: 2500, // $25.00
                currency: 'usd',
                recurring: { interval: 'month' },
            });
        }
        
        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            line_items: [{ price: price.id, quantity: 1 }],
            mode: 'subscription',
            return_url: returnUrl,
            metadata: {
                subscription_plan: plan,
            },
            subscription_data: {
              promotion_code: 'promo_1PTl4RRxu18cI3d12WKy6A1c'
            }
        });

        return NextResponse.json({ clientSecret: session.client_secret });
    } catch (error) {
        console.error('Error creating subscription session:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: `Stripe Error: ${errorMessage}` }, { status: 500 });
    }
};

const handleOneTimePayment = async (visitId: string, returnUrl: string) => {
     try {
        const product = await stripe.products.create({
          name: `ZumaTeledoc Consultation (Visit: ${visitId.substring(0,8)})`,
        });

        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: 4900, // $49.00
          currency: 'usd',
        });
        
        const session = await stripe.checkout.sessions.create({
          ui_mode: 'embedded',
          line_items: [{ price: price.id, quantity: 1 }],
          mode: 'payment',
          return_url: returnUrl,
          metadata: {
            visitId: visitId,
          }
        });

        return NextResponse.json({ clientSecret: session.client_secret });
      } catch (error) {
        console.error('Error creating one-time payment session:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
      }
}


export async function POST(request: Request) {
  const { visitId, plan } = await request.json();

  if (!visitId && !plan) {
      return NextResponse.json({ error: 'A Visit ID or Subscription Plan is required' }, { status: 400 });
  }
  
  // The return_url depends on what is being purchased
  const baseUrl = request.headers.get('origin') || 'http://localhost:3000';
  const returnUrl = `${baseUrl}/return?session_id={CHECKOUT_SESSION_ID}${visitId ? `&visitId=${visitId}` : ''}${plan ? `&plan=${plan}` : ''}`;


  if (plan) {
    return handleSubscription(plan, returnUrl);
  }

  if (visitId) {
    return handleOneTimePayment(visitId, returnUrl);
  }
  
  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}
