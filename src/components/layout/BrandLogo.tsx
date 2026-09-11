import Image from 'next/image';
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

const sizes = {
  sm: { box: 'h-8 w-8', img: 32 },
  md: { box: 'h-9 w-9', img: 36 },
  lg: { box: 'h-12 w-12', img: 48 },
} as const;

export function BrandLogo({
  size = 'md',
  withWordmark = true,
  href = '/',
  className,
}: {
  size?: keyof typeof sizes;
  withWordmark?: boolean;
  href?: string | null;
  className?: string;
}) {
  const s = sizes[size];
  const content = (
    <>
      <span className={cn('relative shrink-0 overflow-hidden rounded-2xl', s.box)}>
        <Image
          src="/logo-256.png"
          alt=""
          width={s.img}
          height={s.img}
          className="h-full w-full object-cover"
          priority={size !== 'sm'}
        />
      </span>
      {withWordmark && (
        <span className="font-display text-xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
          {APP_NAME}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn('flex shrink-0 items-center gap-2.5 group', className)}>
        {content}
      </Link>
    );
  }

  return <div className={cn('flex shrink-0 items-center gap-2.5', className)}>{content}</div>;
}
