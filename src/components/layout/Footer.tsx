import Link from 'next/link';
import { APP_DOMAIN, APP_NAME } from '@/lib/constants';
import { BrandLogo } from '@/components/layout/BrandLogo';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <h4 className="font-semibold mb-4 text-foreground">About</h4>
            <ul className="space-y-2.5 text-muted">
              <li><Link href="/" className="hover:text-primary transition-colors">About {APP_NAME}</Link></li>
              <li><Link href="/requests" className="hover:text-primary transition-colors">How it works</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">For Buyers</h4>
            <ul className="space-y-2.5 text-muted">
              <li><Link href="/makers" className="hover:text-primary transition-colors">Browse Manufacturers</Link></li>
              <li><Link href="/requests" className="hover:text-primary transition-colors">Custom Requests</Link></li>
              <li><Link href="/auth/login" className="hover:text-primary transition-colors">Your Account</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">For Makers</h4>
            <ul className="space-y-2.5 text-muted">
              <li><Link href="/auth/register?role=maker" className="hover:text-primary transition-colors">List your Company</Link></li>
              <li><Link href="/makers" className="hover:text-primary transition-colors">Manufacturer Directory</Link></li>
              <li><Link href="/requests" className="hover:text-primary transition-colors">Find Requests</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Trust & Safety</h4>
            <ul className="space-y-2.5 text-muted">
              <li>Buyer protection</li>
              <li>Secure payments</li>
              <li>Dispute resolution</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <BrandLogo size="sm" href="/" />
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} {APP_DOMAIN} — Made truly, for you
          </p>
        </div>
      </div>
    </footer>
  );
}
