import { createClient, getProfile } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { RequestCard } from '@/components/requests/RequestCard';
import { Plus } from 'lucide-react';

interface Props {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function RequestsPage({ searchParams }: Props) {
  const { category: categorySlug, q } = await searchParams;
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

  if (q?.trim()) {
    query = query.or(`title.ilike.%${q.trim()}%,description.ilike.%${q.trim()}%`);
  }

  const { data: requests } = await query.limit(50);

  const isBuyer = profile?.role === 'buyer';
  const isMaker = profile?.role === 'maker';

  const pageTitle = q
    ? `Results for "${q}"`
    : isBuyer
      ? 'My Requests'
      : isMaker
        ? 'Browse Open Orders'
        : 'All Custom Orders';

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-4 sm:py-6">
      <div className="bg-card rounded border border-border p-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">{pageTitle}</h1>
            <p className="text-sm text-muted">
              {requests?.length ?? 0} {requests?.length === 1 ? 'result' : 'results'}
              {categorySlug ? ` in ${categorySlug}` : ''}
            </p>
          </div>
          {isBuyer && (
            <Button href="/requests/new" className="gap-2 font-bold">
              <Plus className="h-4 w-4" />
              Post a Request
            </Button>
          )}
          {!profile && (
            <Button href="/auth/register?role=buyer" className="font-bold">
              Post what you need
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {requests?.map((req) => (
          <RequestCard key={req.id} request={req} />
        ))}
      </div>

      {!requests?.length && (
        <div className="bg-card rounded border border-border text-center py-16 px-4">
          <p className="text-muted mb-4">No orders found.</p>
          {isBuyer ? (
            <Button href="/requests/new" className="font-bold">Create your first request</Button>
          ) : (
            <Button href="/auth/register?role=buyer" className="font-bold">Post a request</Button>
          )}
        </div>
      )}
    </div>
  );
}
