import { createClient, getProfile } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { OrderDetailClient } from '@/components/orders/OrderDetail';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string }>;
}

export default async function OrderPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { payment } = await searchParams;
  const profile = await getProfile();
  if (!profile) redirect('/auth/login');

  const supabase = await createClient();

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      request:requests(title, description),
      buyer:profiles!orders_buyer_id_fkey(*),
      maker:profiles!orders_maker_id_fkey(*)
    `)
    .eq('id', id)
    .single();

  if (!order) notFound();

  const isBuyer = profile.id === order.buyer_id;
  const isMaker = profile.id === order.maker_id;
  const isAdmin = profile.role === 'admin';

  if (!isBuyer && !isMaker && !isAdmin) notFound();

  if (payment === 'success' && order.status === 'payment_pending') {
    await supabase.from('orders').update({
      status: 'payment_secured',
      payment_status: 'secured',
    }).eq('id', id);

    await supabase.from('messages').insert({
      order_id: id,
      sender_id: profile.id,
      content: 'Payment secured! The maker can now start working on your order.',
      is_system: true,
    });

    order.status = 'payment_secured';
    order.payment_status = 'secured';
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {payment === 'success' && (
        <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-accent">
          Payment successful! Your funds are held securely until you approve the work.
        </div>
      )}
      {payment === 'cancelled' && (
        <div className="mb-6 rounded-xl bg-primary-light border border-primary/20 px-4 py-3 text-primary">
          Payment was cancelled. You can try again when ready.
        </div>
      )}
      <OrderDetailClient
        order={order}
        currentUserId={profile.id}
        isBuyer={isBuyer}
        isMaker={isMaker}
      />
    </div>
  );
}
