import { cn } from '@/lib/utils';

export function Card({
  className,
  children,
  hover = false,
  glass = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean; glass?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-300',
        glass ? 'card-glass' : 'bg-card border border-border',
        hover && 'hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('px-6 py-5 border-b border-border', className)}>
      {children}
    </div>
  );
}

export function CardContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn('px-6 py-5', className)}>{children}</div>;
}
