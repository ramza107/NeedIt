import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-muted-bg text-muted border border-border',
  success: 'bg-accent-light text-accent border border-accent/20',
  warning: 'bg-primary-light text-primary border border-primary/20',
  danger: 'bg-red-50 text-red-700 border border-red-200',
  info: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
};

export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: keyof typeof variants }> = {
    open: { label: 'Open', variant: 'success' },
    offers_received: { label: 'Offers Received', variant: 'info' },
    maker_selected: { label: 'Maker Selected', variant: 'warning' },
    payment_pending: { label: 'Payment Pending', variant: 'warning' },
    payment_secured: { label: 'Payment Secured', variant: 'success' },
    in_production: { label: 'In Production', variant: 'info' },
    ready_for_review: { label: 'Ready for Review', variant: 'warning' },
    completed: { label: 'Completed', variant: 'success' },
    paid_to_maker: { label: 'Paid to Maker', variant: 'success' },
    dispute: { label: 'Dispute', variant: 'danger' },
    cancelled: { label: 'Cancelled', variant: 'default' },
    closed: { label: 'Closed', variant: 'default' },
    pending: { label: 'Pending', variant: 'warning' },
    accepted: { label: 'Accepted', variant: 'success' },
    rejected: { label: 'Rejected', variant: 'danger' },
  };

  const { label, variant } = config[status] || { label: status, variant: 'default' as const };
  return <Badge variant={variant}>{label}</Badge>;
}
