import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  : null;

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed' && supabaseAdmin) {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;

    if (orderId) {
      await supabaseAdmin.from('orders').update({
        status: 'payment_secured',
        payment_status: 'secured',
        stripe_payment_intent_id: session.payment_intent as string,
      }).eq('id', orderId);
    }
  }

  if (event.type === 'payment_intent.payment_failed' && supabaseAdmin) {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata?.order_id;
    if (orderId) {
      await supabaseAdmin.from('orders').update({
        payment_status: 'failed',
      }).eq('id', orderId);
    }
  }

  return NextResponse.json({ received: true });
}
