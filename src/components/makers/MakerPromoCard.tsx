import Link from 'next/link';
import { Avatar, StarRating } from '@/components/ui/Avatar';
import type { MakerProfile } from '@/types/database';
import { MapPin, Megaphone } from 'lucide-react';

export function MakerPromoCard({
  maker,
}: {
  maker: MakerProfile & { profile?: { full_name: string; avatar_url: string | null } | null };
}) {
  const name = maker.business_name || maker.profile?.full_name || 'Maker';
  const headline = maker.promo_headline || maker.bio?.slice(0, 100) || 'Custom orders & handmade work';
  const portfolioThumb = maker.portfolio_urls?.[0];

  return (
    <Link
      href={`/profile/${maker.user_id}`}
      className="block h-full group"
    >
      <article className="card-product h-full flex flex-col bg-card overflow-hidden relative">
        <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-muted-bg text-muted border border-border">
          <Megaphone className="h-2.5 w-2.5" />
          Sponsored
        </span>

        <div className="h-28 bg-muted-bg flex items-center justify-center overflow-hidden">
          {portfolioThumb ? (
            <img
              src={portfolioThumb}
              alt=""
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <Avatar src={maker.profile?.avatar_url} name={name} size="lg" />
          )}
        </div>

        <div className="p-3 flex-1 flex flex-col">
          <div className="flex items-start gap-2 mb-2">
            <Avatar src={maker.profile?.avatar_url} name={name} size="sm" />
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-link line-clamp-1 group-hover:text-accent-hover">
                {name}
              </h3>
              {maker.city && (
                <p className="text-[11px] text-muted flex items-center gap-0.5 mt-0.5">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {maker.city}
                </p>
              )}
            </div>
          </div>

          <p className="text-xs text-foreground/80 line-clamp-2 mb-2 flex-1 leading-relaxed">
            {headline}
          </p>

          <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-border">
            <StarRating rating={maker.rating} count={maker.review_count} />
            <span className="text-[11px] text-muted whitespace-nowrap">
              {maker.completed_orders} orders
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
