import { NextResponse } from 'next/server';
import { getProfile, createServiceClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const profile = await getProfile();
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orderId = new URL(request.url).searchParams.get('orderId');
  if (!orderId) {
    return NextResponse.json({ error: 'orderId required' }, { status: 400 });
  }

  const service = createServiceClient();
  const { data, error } = await service
    .from('messages')
    .select('*, sender:profiles(*)')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ messages: data || [] });
}
