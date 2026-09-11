import Link from 'next/link';
import { requireAdmin, createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { formatRelativeTime } from '@/lib/utils';
import { ArrowLeft, MessageSquare } from 'lucide-react';

export default async function AdminChatsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from('orders')
    .select(
      `id, status, created_at, price,
       request:requests(title),
       buyer:profiles!orders_buyer_id_fkey(full_name, email),
       maker:profiles!orders_maker_id_fkey(full_name, email),
       messages(id, created_at, content)`
    )
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        Admin
      </Link>
      <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
        <MessageSquare className="h-6 w-6 text-primary" />
        Order chats
      </h1>
      <p className="text-sm text-muted mb-6">
        Open any order to read the full conversation between buyer and maker
      </p>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-foreground">Recent orders with chat</h2>
        </CardHeader>
        <CardContent className="space-y-2">
          {orders?.length ? (
            orders.map((order) => {
              const request = Array.isArray(order.request) ? order.request[0] : order.request;
              const buyer = Array.isArray(order.buyer) ? order.buyer[0] : order.buyer;
              const maker = Array.isArray(order.maker) ? order.maker[0] : order.maker;
              const messageCount = Array.isArray(order.messages) ? order.messages.length : 0;
              const lastMessage = Array.isArray(order.messages)
                ? [...order.messages].sort(
                    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                  )[0]
                : null;

              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block rounded-xl border border-border p-4 hover:bg-muted-bg/50"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {request?.title || 'Order'}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {buyer?.full_name} ↔ {maker?.full_name}
                      </p>
                      {lastMessage && (
                        <p className="text-sm text-muted mt-2 line-clamp-1">
                          Last: {lastMessage.content || '[attachment]'}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <StatusBadge status={order.status} />
                      <p className="text-xs text-muted mt-1">{messageCount} messages</p>
                      <p className="text-[11px] text-muted">{formatRelativeTime(order.created_at)}</p>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <p className="text-sm text-muted py-6 text-center">No orders yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
