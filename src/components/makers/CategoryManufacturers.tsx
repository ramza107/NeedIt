'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Avatar, StarRating } from '@/components/ui/Avatar';
import type { MakerCardData } from '@/lib/makers';
import { ArrowRight, Building2 } from 'lucide-react';

type CategoryOption = {
  id: string;
  slug: string;
  name: string;
  icon?: string | null;
};

const FALLBACK_META: Record<string, { icon: string; desc: string }> = {
  furniture: { icon: '🪑', desc: 'Tables, shelves, decor' },
  jewelry: { icon: '💎', desc: 'Rings, necklaces, custom' },
  clothing: { icon: '👕', desc: 'Tailored & handmade' },
  art: { icon: '🎨', desc: 'Paintings, sculptures' },
  gifts: { icon: '🎁', desc: 'Personalized gifts' },
  '3d-printing': { icon: '🖨️', desc: 'Prototypes & parts' },
};

export function CategoryManufacturers({
  categories,
  makers,
}: {
  categories: CategoryOption[];
  makers: MakerCardData[];
}) {
  const [selectedSlug, setSelectedSlug] = useState(categories[0]?.slug || 'furniture');

  const selected = categories.find((c) => c.slug === selectedSlug) || categories[0];

  const filtered = useMemo(() => {
    if (!selected) return makers;
    return makers.filter((m) => m.categories.includes(selected.id));
  }, [makers, selected]);

  return (
    <div className="section-panel p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display text-2xl font-semibold text-foreground">Browse manufacturers</h2>
          <p className="text-sm text-muted mt-1">
            Pick a category to see companies that produce it
          </p>
        </div>
        <Link
          href={selected ? `/makers?category=${selected.slug}` : '/makers'}
          className="text-sm text-link hover:text-primary-hover font-medium flex items-center gap-1"
        >
          View all in category <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {categories.map((cat) => {
          const meta = FALLBACK_META[cat.slug] || { icon: '📦', desc: 'Custom production' };
          const active = cat.slug === selectedSlug;
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => setSelectedSlug(cat.slug)}
              className={`card-product p-4 text-center transition-all ${
                active
                  ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                  : 'hover:bg-muted-bg/50'
              }`}
            >
              <span className="text-3xl block mb-2">{cat.icon || meta.icon}</span>
              <p className="font-semibold text-sm text-foreground">{cat.name}</p>
              <p className="text-xs text-muted mt-0.5">{meta.desc}</p>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="font-display text-lg font-semibold text-foreground">
            {selected.icon || FALLBACK_META[selected.slug]?.icon} {selected.name} manufacturers
          </h3>
          <span className="text-xs text-muted">{filtered.length} found</span>
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filtered.slice(0, 8).map((maker) => {
            if (!maker.href) {
              return (
                <div key={maker.id} className="card-product p-4 opacity-60">
                  <p className="font-semibold text-sm">{maker.name}</p>
                  <p className="text-xs text-muted mt-1">Profile unavailable</p>
                </div>
              );
            }

            return (
              <Link key={maker.id} href={maker.href} className="card-product p-4 hover:bg-muted-bg/50 block">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar src={maker.avatar_url} name={maker.name} size="sm" />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate text-link">{maker.name}</p>
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
        <div className="rounded-2xl border border-dashed border-border bg-muted-bg/50 p-8 text-center">
          <Building2 className="h-10 w-10 text-muted/40 mx-auto mb-3" />
          <p className="font-semibold text-foreground mb-1">
            No {selected?.name.toLowerCase() || ''} manufacturers yet
          </p>
          <p className="text-sm text-muted mb-4 max-w-md mx-auto">
            Be the first company in this category, or post a custom request for makers to respond.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/auth/register?role=maker" className="btn-primary px-5 py-2.5 text-sm font-semibold">
              List your company
            </Link>
            <Link href="/requests/new" className="px-5 py-2.5 text-sm font-semibold rounded-full border border-border bg-card hover:bg-muted-bg">
              Post a request
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
