import Stripe from 'stripe';

// Lazy initialization - only create Stripe instance when needed at runtime
let stripeInstance: Stripe | null = null;

export const getStripe = (): Stripe => {
    if (!stripeInstance) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is missing. Please set it in your .env.local file.');
        }
        stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2024-06-20',
            typescript: true,
        });
    }
    return stripeInstance;
};

// For backward compatibility
export const stripe = new Proxy({} as Stripe, {
    get: (target, prop) => {
        return getStripe()[prop as keyof Stripe];
    }
});
