import { createClient, getProfile } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { formatBudget, formatDate, formatRelativeTime } from '@/lib/utils';
import { MapPin, Calendar, Camera, Plus } from 'lucide-react';

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function RequestsPage({ searchParams }: Props) {
  const { category: categorySlug } = await searchParams;
  const profile = await getProfile();
  const supabase = await createClient();

  let query = supabase
    .from('requests')
    .select('*, category:categories(*), images:request_images(*), buyer:profiles(full_name, city)')
    .order('created_at', { ascending: false });

  if (profile?.role === 'buyer') {
    query = query.eq('buyer_id', profile.id);
  } else if (profile?.role !== 'admin') {
    query = query.in('status', ['open', 'offers_received']);
  }

  if (categorySlug) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).single();
    if (cat) query = query.eq('category_id', cat.id);
  }

  const { data: requests } = await query.limit(50);

  const isBuyer = profile?.role === 'buyer';
  const isMaker = profile?.role === 'maker';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isBuyer ? 'My Requests' : isMaker ? 'New Requests' : 'Browse Requests'}
          </h1>
          <p className="text-muted">
            {isMaker ? 'Find custom orders matching your skills' : 'Track your custom order requests'}
          </p>
        </div>
        {isBuyer && (
          <Button href="/requests/new" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Request
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests?.map((req) => (
          <Link key={req.id} href={`/requests/${req.id}`}>
            <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
              {req.images?.[0] ? (
                <div className="h-48 bg-muted-bg overflow-hidden">
                  <img src={req.images[0].image_url} alt="" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                  <Camera className="h-10 w-10 text-amber-300" />
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-foreground line-clamp-2">{req.title}</h3>
                  <StatusBadge status={req.status} />
                </div>
                <p className="text-sm text-muted line-clamp-2 mb-3 flex-1">{req.description}</p>
                <div className="space-y-1.5 text-sm text-muted">
                  <div className="flex items-center gap-1.5">
                    <span>{req.category?.icon}</span>
                    {req.category?.name}
                  </div>
                  {req.city && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {req.city}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 font-medium text-foreground/80">
                    💰 {formatBudget(req.budget_min, req.budget_max)}
                  </div>
                  {req.deadline && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(req.deadline)}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted mt-3">{formatRelativeTime(req.created_at)}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {!requests?.length && (
        <div className="text-center py-16">
          <p className="text-muted mb-4">No requests found.</p>
          {isBuyer && <Button href="/requests/new">Create your first request</Button>}
        </div>
      )}
    </div>
  );
}
