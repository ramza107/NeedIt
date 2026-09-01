import { createClient, getProfile } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';
import { Plus, Package, MessageSquare, TrendingUp } from 'lucide-react';
import { PromoteProfilePanel } from '@/components/makers/PromoteProfilePanel';

export default async function DashboardPage() {
  const profile = await getProfile();
  if (!profile) redirect('/auth/login');

  const supabase = await createClient();

  if (profile.role === 'maker') {
    const { data: makerProfile } = await supabase
      .from('maker_profiles')
      .select('*')
      .eq('user_id', profile.id)
      .single();

    if (!makerProfile) redirect('/maker/setup');

    const [{ data: openRequests }, { data: myOffers }, { data: myOrders }] = await Promise.all([
      supabase
        .from('requests')
        .select('*, category:categories(*), images:request_images(*)')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('offers')
        .select('*, request:requests(title)')
        .eq('maker_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('orders')
        .select('*, request:requests(title), buyer:profiles!orders_buyer_id_fkey(full_name)')
        .eq('maker_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Maker Dashboard</h1>
            <p className="text-muted">Welcome back, {makerProfile.business_name || profile.full_name}</p>
          </div>
          <Button href="/requests">Browse Requests</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary-light p-3"><TrendingUp className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-sm text-muted">Completed Orders</p>
                <p className="text-2xl font-bold">{makerProfile.completed_orders}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-accent-light p-3"><Package className="h-5 w-5 text-accent" /></div>
              <div>
                <p className="text-sm text-muted">Active Orders</p>
                <p className="text-2xl font-bold">{myOrders?.filter((o) => !['completed', 'paid_to_maker', 'cancelled'].includes(o.status)).length || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-muted-bg p-3"><MessageSquare className="h-5 w-5 text-foreground/70" /></div>
              <div>
                <p className="text-sm text-muted">Rating</p>
                <p className="text-2xl font-bold">★ {makerProfile.rating.toFixed(1)}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mb-8">
          <PromoteProfilePanel makerProfile={makerProfile} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-foreground">New Requests</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              {openRequests?.length ? openRequests.map((req) => (
                <Link key={req.id} href={`/requests/${req.id}`} className="block rounded-xl border border-border p-4 hover:bg-muted-bg transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-foreground">{req.title}</p>
                      <p className="text-sm text-muted">{req.city} · {req.category?.name}</p>
                    </div>
                    <span className="text-sm text-muted">{formatRelativeTime(req.created_at)}</span>
                  </div>
                </Link>
              )) : (
                <p className="text-muted text-sm">No open requests right now.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-semibold text-foreground">My Orders</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              {myOrders?.length ? myOrders.map((order) => (
                <Link key={order.id} href={`/orders/${order.id}`} className="block rounded-xl border border-border p-4 hover:bg-muted-bg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-foreground">{order.request?.title}</p>
                      <p className="text-sm text-muted">{order.buyer?.full_name}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                </Link>
              )) : (
                <p className="text-muted text-sm">No orders yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Buyer dashboard
  const [{ data: myRequests }, { data: myOrders }] = await Promise.all([
    supabase
      .from('requests')
      .select('*, category:categories(*), offers(count)')
      .eq('buyer_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('orders')
      .select('*, request:requests(title), maker:profiles!orders_maker_id_fkey(full_name)')
      .eq('buyer_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">What do you want made?</h1>
          <p className="text-muted">Welcome back, {profile.full_name}</p>
        </div>
        <Button href="/requests/new" className="gap-2">
          <Plus className="h-4 w-4" />
          Create Request
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="font-semibold text-foreground">My Requests</h2>
            <Link href="/requests" className="text-sm text-primary font-medium hover:text-primary-hover transition-colors">View all</Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {myRequests?.length ? myRequests.map((req) => (
              <Link key={req.id} href={`/requests/${req.id}`} className="block rounded-xl border border-border p-4 hover:bg-muted-bg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-foreground">{req.title}</p>
                    <p className="text-sm text-muted">{req.category?.name}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={req.status} />
                    <p className="text-xs text-muted mt-1">
                      {(req.offers as { count: number }[])?.[0]?.count || 0} offers
                    </p>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="text-center py-8">
                <p className="text-muted mb-4">No requests yet. Post what you want made!</p>
                <Button href="/requests/new" size="sm">Create Request</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-foreground">My Orders</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {myOrders?.length ? myOrders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`} className="block rounded-xl border border-border p-4 hover:bg-muted-bg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-foreground">{order.request?.title}</p>
                    <p className="text-sm text-muted">Maker: {order.maker?.full_name}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={order.status} />
                    <p className="text-sm font-medium mt-1">{formatCurrency(order.price)}</p>
                  </div>
                </div>
              </Link>
            )) : (
              <p className="text-muted text-sm py-4">No orders yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
