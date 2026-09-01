import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Avatar, StarRating } from '@/components/ui/Avatar';
import { makerProfilePath, getMakerProfile } from '@/lib/makers';
import { Hammer } from 'lucide-react';

export default async function MakersPage() {
  const supabase = await createClient();
  const { data: makers } = await supabase
    .from('maker_profiles')
    .select('*, profile:profiles(id, full_name, avatar_url, rating, review_count)')
    .order('rating', { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6 sm:py-8">
      <div className="bg-card rounded border border-border p-4 sm:p-6 mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Hammer className="h-6 w-6 text-accent" />
          Makers &amp; craftspeople
        </h1>
        <p className="text-sm text-muted mt-1">
          Browse maker profiles, portfolios, and reviews before you post a request.
        </p>
      </div>

      {makers && makers.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {makers.map((maker) => {
            const href = makerProfilePath(maker);
            const profile = getMakerProfile(maker);
            const name = maker.business_name || profile?.full_name || 'Maker';

            if (!href) {
              return (
                <div key={maker.id} className="card-product p-4 bg-card opacity-60">
                  <p className="font-bold text-sm">{name}</p>
                  <p className="text-xs text-muted mt-1">Profile unavailable</p>
                </div>
              );
            }

            return (
              <Link key={maker.id} href={href} className="card-product p-4 hover:bg-muted-bg bg-card">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar
                    src={profile?.avatar_url}
                    name={name}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate text-link">{name}</p>
                    <p className="text-xs text-muted">{maker.city}</p>
                  </div>
                </div>
                <StarRating rating={maker.rating} count={maker.review_count} />
                <p className="text-xs text-muted mt-1">{maker.completed_orders} orders completed</p>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-card rounded border border-border text-center py-16 px-4">
          <Hammer className="h-12 w-12 text-muted/40 mx-auto mb-3" />
          <p className="font-bold text-foreground mb-1">No maker profiles yet</p>
          <p className="text-sm text-muted">
            Makers can create a profile and advertise on the homepage from their dashboard.
          </p>
        </div>
      )}
    </div>
  );
}
