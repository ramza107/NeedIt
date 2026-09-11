import Stripe from 'stripe';
import { PLATFORM_FEE_PERCENT } from './constants';

let stripeInstance: Stripe | null = null;

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }
  return stripeInstance;
}

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}

export async function createCheckoutSession({
  orderId,
  price,
  title,
  buyerEmail,
  successUrl,
  cancelUrl,
}: {
  orderId: string;
  price: number;
  title: string;
  buyerEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const stripe = getStripe();
  const platformFee = Math.round(price * (PLATFORM_FEE_PERCENT / 100) * 100);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: buyerEmail,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: title,
            description: `Wahrly custom order — funds held securely until you approve the work`,
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      metadata: {
        order_id: orderId,
        platform_fee: platformFee.toString(),
      },
    },
    metadata: {
      order_id: orderId,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}
