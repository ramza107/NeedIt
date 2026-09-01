import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-stone-100 text-stone-700',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
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
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
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
