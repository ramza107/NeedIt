import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
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
    .select('*')
    .eq('id', orderId)
    .eq('buyer_id', user.id)
    .single();

  if (!order || order.status !== 'completed') {
    return NextResponse.json({ error: 'Invalid order state' }, { status: 400 });
  }

  await supabase.from('orders').update({
    status: 'paid_to_maker',
    payment_status: 'released',
  }).eq('id', orderId);

  return NextResponse.json({ success: true });
}
