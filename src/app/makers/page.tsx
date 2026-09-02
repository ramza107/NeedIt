import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Avatar, StarRating } from '@/components/ui/Avatar';
import { makerProfilePath, getMakerProfile } from '@/lib/makers';
import { POPULAR_CATEGORIES } from '@/lib/constants';
import { Building2 } from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  furniture: 'Furniture',
  jewelry: 'Jewelry',
  clothing: 'Clothing',
  art: 'Art',
  gifts: 'Gifts',
  '3d-printing': '3D Printing',
};

export default async function MakersPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const categorySlug = params.category || '';
  const query = (params.q || '').trim().toLowerCase();

  const supabase = await createClient();

  const { data: allCategories } = await supabase.from('categories').select('id, name, slug, icon');
  const categories = allCategories || [];
  const selectedCategory = categorySlug
    ? categories.find((c) => c.slug === categorySlug)
    : null;

  let makersQuery = supabase
    .from('maker_profiles')
    .select('*, profile:profiles(id, full_name, avatar_url, rating, review_count)')
    .order('rating', { ascending: false })
    .limit(100);

  if (selectedCategory) {
    makersQuery = makersQuery.contains('categories', [selectedCategory.id]);
  }

  const { data: makersRaw } = await makersQuery;
  let makers = makersRaw || [];

  if (query) {
    makers = makers.filter((m) => {
      const profile = getMakerProfile(m);
      const hay = `${m.business_name || ''} ${profile?.full_name || ''} ${m.bio || ''} ${m.city || ''}`.toLowerCase();
      return hay.includes(query);
    });
  }

  const chipCategories = categories.filter((c) => POPULAR_CATEGORIES.includes(c.slug));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <div className="section-panel p-5 sm:p-7 mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-foreground flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          {selectedCategory
            ? `${selectedCategory.name} manufacturers`
            : 'Manufacturers & makers'}
        </h1>
        <p className="text-sm text-muted mt-1">
          {selectedCategory
            ? `Companies that produce ${selectedCategory.name.toLowerCase()}. Browse profiles, portfolios, and reviews.`
            : 'Discover companies that make custom products. Filter by category or search by name.'}
        </p>

        <div className="flex flex-wrap gap-2 mt-5">
          <Link
            href="/makers"
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !selectedCategory
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted-bg text-foreground hover:bg-border'
            }`}
          >
            All
          </Link>
          {chipCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/makers?category=${cat.slug}`}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory?.slug === cat.slug
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted-bg text-foreground hover:bg-border'
              }`}
            >
              {cat.icon} {cat.name || CATEGORY_LABELS[cat.slug] || cat.slug}
            </Link>
          ))}
        </div>
      </div>

      {makers.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {makers.map((maker) => {
            const href = makerProfilePath(maker);
            const profile = getMakerProfile(maker);
            const name = maker.business_name || profile?.full_name || 'Manufacturer';

            if (!href) {
              return (
                <div key={maker.id} className="card-product p-4 bg-card opacity-60">
                  <p className="font-semibold text-sm">{name}</p>
                  <p className="text-xs text-muted mt-1">Profile unavailable</p>
                </div>
              );
            }

            return (
              <Link key={maker.id} href={href} className="card-product p-4 hover:bg-muted-bg/50 bg-card">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar src={profile?.avatar_url} name={name} size="sm" />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate text-link">{name}</p>
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
        <div className="section-panel text-center py-16 px-4">
          <Building2 className="h-12 w-12 text-muted/40 mx-auto mb-3" />
          <p className="font-semibold text-foreground mb-1">
            {selectedCategory
              ? `No ${selectedCategory.name.toLowerCase()} manufacturers yet`
              : 'No manufacturer profiles yet'}
          </p>
          <p className="text-sm text-muted mb-4">
            Companies can create a profile and appear in this directory.
          </p>
          <Link href="/auth/register?role=maker" className="btn-primary inline-flex px-5 py-2.5 text-sm font-semibold">
            List your company
          </Link>
        </div>
      )}
    </div>
  );
}
