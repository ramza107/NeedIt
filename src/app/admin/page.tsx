import Link from 'next/link';
import { requireAdmin, createServiceClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { MessageSquare, Users, Shield } from 'lucide-react';

export default async function AdminPage() {
  await requireAdmin();
  const supabase = createServiceClient();

  const [
    { count: usersCount },
    { count: makersCount },
    { count: requestsCount },
    { count: ordersCount },
    { data: recentOrders },
    { data: disputes },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('maker_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('requests').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase
      .from('orders')
      .select(
        '*, request:requests(title), buyer:profiles!orders_buyer_id_fkey(full_name), maker:profiles!orders_maker_id_fkey(full_name)'
      )
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('disputes')
      .select('*, order:orders(id, request:requests(title))')
      .eq('status', 'open')
      .limit(10),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Admin
          </h1>
          <p className="text-sm text-muted mt-1">Manage users, read order chats, moderate the marketplace</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold"
          >
            <Users className="h-4 w-4" />
            Users &amp; profiles
          </Link>
          <Link
            href="/admin/chats"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted-bg"
          >
            <MessageSquare className="h-4 w-4" />
            Order chats
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Users', count: usersCount, href: '/admin/users' },
          { label: 'Makers', count: makersCount, href: '/admin/users?role=maker' },
          { label: 'Requests', count: requestsCount, href: '/requests' },
          { label: 'Orders', count: ordersCount, href: '/admin/chats' },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="p-5 text-center hover:border-primary/40 transition-colors">
              <p className="text-3xl font-bold text-foreground">{stat.count || 0}</p>
              <p className="text-sm text-muted">{stat.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-foreground">Recent orders (open chat)</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentOrders?.length ? (
              recentOrders.map((order) => {
                const request = Array.isArray(order.request) ? order.request[0] : order.request;
                const buyer = Array.isArray(order.buyer) ? order.buyer[0] : order.buyer;
                const maker = Array.isArray(order.maker) ? order.maker[0] : order.maker;
                return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex justify-between items-center rounded-lg border border-border p-3 hover:bg-muted-bg/50"
                >
                  <div>
                    <p className="font-medium text-foreground">{request?.title || 'Order'}</p>
                    <p className="text-xs text-muted">
                      {buyer?.full_name} → {maker?.full_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={order.status} />
                    <p className="text-sm font-medium mt-1">{formatCurrency(order.price)}</p>
                  </div>
                </Link>
              );
              })
            ) : (
              <p className="text-sm text-muted">No orders yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-foreground">Open disputes</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {disputes?.length ? (
              disputes.map((d) => {
                const order = Array.isArray(d.order) ? d.order[0] : d.order;
                const request = order
                  ? Array.isArray(order.request)
                    ? order.request[0]
                    : order.request
                  : null;
                return (
                <Link
                  key={d.id}
                  href={order?.id ? `/orders/${order.id}` : '/admin'}
                  className="block rounded-lg border border-red-200 bg-red-50 p-3 hover:bg-red-100/80"
                >
                  <p className="font-medium text-foreground">{request?.title || 'Dispute'}</p>
                  <p className="text-sm text-muted">
                    {d.reason}: {d.description}
                  </p>
                  <p className="text-xs text-muted mt-1">{formatRelativeTime(d.created_at)}</p>
                </Link>
              );
              })
            ) : (
              <p className="text-muted text-sm">No open disputes</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
