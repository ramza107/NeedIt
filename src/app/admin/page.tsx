import { createClient, getProfile } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';

export default async function AdminPage() {
  const profile = await getProfile();
  if (!profile || profile.role !== 'admin') redirect('/dashboard');

  const supabase = await createClient();

  const [
    { count: usersCount },
    { count: makersCount },
    { count: requestsCount },
    { count: ordersCount },
    { data: recentOrders },
    { data: disputes },
    { data: reports },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('maker_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('requests').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase
      .from('orders')
      .select('*, request:requests(title), buyer:profiles!orders_buyer_id_fkey(full_name), maker:profiles!orders_maker_id_fkey(full_name)')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('disputes')
      .select('*, order:orders(request:requests(title))')
      .eq('status', 'open')
      .limit(10),
    supabase
      .from('reports')
      .select('*')
      .eq('status', 'pending')
      .limit(10),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-foreground mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Users', count: usersCount },
          { label: 'Makers', count: makersCount },
          { label: 'Requests', count: requestsCount },
          { label: 'Orders', count: ordersCount },
        ].map((stat) => (
          <Card key={stat.label} className="p-5 text-center">
            <p className="text-3xl font-bold text-foreground">{stat.count || 0}</p>
            <p className="text-sm text-muted">{stat.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-foreground">Recent Orders</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentOrders?.map((order) => (
              <div key={order.id} className="flex justify-between items-center rounded-lg border border-border p-3">
                <div>
                  <p className="font-medium text-foreground">{order.request?.title}</p>
                  <p className="text-xs text-muted">
                    {order.buyer?.full_name} → {order.maker?.full_name}
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge status={order.status} />
                  <p className="text-sm font-medium mt-1">{formatCurrency(order.price)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-foreground">Open Disputes</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {disputes?.length ? disputes.map((d) => (
              <div key={d.id} className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="font-medium text-foreground">{d.order?.request?.title}</p>
                <p className="text-sm text-muted">{d.reason}: {d.description}</p>
                <p className="text-xs text-muted mt-1">{formatRelativeTime(d.created_at)}</p>
              </div>
            )) : (
              <p className="text-muted text-sm">No open disputes</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
