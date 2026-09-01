import { cn } from '@/lib/utils';

export function Card({
  className,
  children,
  hover = false,
  product = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean; product?: boolean }) {
  return (
    <div
      className={cn(
        product ? 'card-product' : 'bg-card border border-border rounded',
        !product && 'shadow-sm',
        hover && 'hover:shadow-md transition-shadow',
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
    <div className={cn('px-4 py-3 border-b border-border bg-muted-bg', className)}>
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
  return <div className={cn('px-4 py-4', className)}>{children}</div>;
}
