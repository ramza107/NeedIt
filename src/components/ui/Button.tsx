import Link from 'next/link';
import { cn } from '@/lib/utils';

const variants = {
  primary: 'btn-amazon font-medium hover:brightness-[0.98] active:scale-[0.99]',
  secondary: 'bg-card text-foreground border border-border hover:bg-muted-bg shadow-sm',
  orange: 'btn-amazon-orange font-medium hover:brightness-[0.98]',
  outline: 'border border-border bg-card text-foreground hover:bg-muted-bg',
  ghost: 'text-foreground hover:bg-white/10',
  link: 'text-link hover:text-accent-hover hover:underline p-0',
  danger: 'bg-red-600 text-white hover:bg-red-700 border border-red-700',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-2.5 text-sm rounded-lg',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  href?: string;
  loading?: boolean;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  href,
  loading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-50 disabled:cursor-not-allowed',
    variants[variant],
    sizes[size],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
