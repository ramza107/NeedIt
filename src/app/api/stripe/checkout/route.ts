import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCheckoutSession, isStripeConfigured } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Set STRIPE_SECRET_KEY in environment variables.' },
        { status: 503 }
      );
    }

    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: order } = await supabase
      .from('orders')
      .select('*, request:requests(title)')
      .eq('id', orderId)
      .eq('buyer_id', user.id)
      .single();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await createCheckoutSession({
      orderId: order.id,
      price: order.price,
      title: order.request?.title || 'Wahrly Custom Order',
      buyerEmail: user.email!,
      successUrl: `${origin}/orders/${orderId}?payment=success`,
      cancelUrl: `${origin}/orders/${orderId}?payment=cancelled`,
    });

    await supabase.from('orders').update({
      stripe_checkout_session_id: session.id,
      payment_status: 'processing',
    }).eq('id', orderId);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
