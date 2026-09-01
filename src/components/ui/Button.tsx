import Link from 'next/link';
import { cn } from '@/lib/utils';

const variants = {
  primary: 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm',
  secondary: 'bg-stone-100 text-stone-900 hover:bg-stone-200',
  outline: 'border-2 border-stone-300 text-stone-700 hover:border-amber-600 hover:text-amber-700',
  ghost: 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
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
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
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
