import { cn, getInitials } from '@/lib/utils';
import Image from 'next/image';

export function Avatar({
  src,
  name,
  size = 'md',
  className,
}: {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
    xl: 'h-20 w-20 text-xl',
  };

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={80}
        height={80}
        className={cn('rounded-full object-cover border border-border', sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-accent-light text-accent font-bold flex items-center justify-center border border-border',
        sizes[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}

export function StarRating({ rating, count }: { rating: number; count?: number }) {
  return (
    <div className="flex items-center gap-1 text-sm">
      <span className="text-primary-dark">★</span>
      <span className="font-medium text-link">{rating.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-muted">({count})</span>
      )}
    </div>
  );
}
