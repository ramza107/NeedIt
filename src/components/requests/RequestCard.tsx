import Link from 'next/link';
import { StatusBadge } from '@/components/ui/Badge';
import { formatBudget, formatRelativeTime } from '@/lib/utils';
import { Camera, MapPin } from 'lucide-react';

interface RequestCardProps {
  request: {
    id: string;
    title: string;
    description: string;
    status: string;
    city?: string | null;
    budget_min?: number | null;
    budget_max?: number | null;
    created_at: string;
    category?: { name?: string; icon?: string } | null;
    images?: { image_url: string }[] | null;
  };
  compact?: boolean;
  href?: string;
}

export function RequestCard({ request, compact = false, href }: RequestCardProps) {
  const linkHref = href ?? `/requests/${request.id}`;

  return (
    <Link href={linkHref} className="block h-full group">
      <article className="card-product h-full flex flex-col bg-card overflow-hidden">
        <div className={`${compact ? 'h-36' : 'h-44'} bg-muted-bg flex items-center justify-center overflow-hidden`}>
          {request.images?.[0] ? (
            <img
              src={request.images[0].image_url}
              alt=""
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <Camera className="h-10 w-10 text-muted/40" />
          )}
        </div>
        <div className="p-3 flex-1 flex flex-col">
          <h3 className="text-sm text-foreground line-clamp-2 group-hover:text-link leading-snug mb-1">
            {request.title}
          </h3>
          {!compact && (
            <p className="text-xs text-muted line-clamp-2 mb-2 flex-1">{request.description}</p>
          )}
          <div className="mt-auto space-y-1">
            <p className="text-base font-medium text-foreground">
              {formatBudget(request.budget_min ?? null, request.budget_max ?? null)}
            </p>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs text-muted flex items-center gap-1">
                {request.category?.icon} {request.category?.name}
              </span>
              <StatusBadge status={request.status} />
            </div>
            {request.city && (
              <p className="text-xs text-muted flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {request.city}
              </p>
            )}
            <p className="text-[11px] text-muted">{formatRelativeTime(request.created_at)}</p>
          </div>
        </div>
      </article>
    </Link>
  );
}
