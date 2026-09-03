import Link from 'next/link';
import { cn } from '@/lib/utils';

const variants = {
  primary: 'btn-primary font-semibold hover:brightness-[1.03] active:scale-[0.99]',
  secondary: 'bg-card text-foreground border border-border hover:bg-muted-bg shadow-sm rounded-full',
  accent: 'btn-accent font-semibold hover:brightness-[1.03] active:scale-[0.99]',
  outline: 'border border-border bg-card text-foreground hover:bg-muted-bg rounded-full',
  ghost: 'text-foreground hover:bg-muted-bg rounded-full',
  link: 'text-link hover:text-primary-hover p-0',
  danger: 'bg-red-600 text-white hover:bg-red-700 border border-red-700 rounded-full',
};

const sizes = {
  sm: 'px-3.5 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-sm',
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
    'inline-flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed',
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
