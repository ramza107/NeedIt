import Link from 'next/link';
import { APP_DOMAIN, APP_NAME } from '@/lib/constants';

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
              <li><Link href="/auth/register?role=buyer" className="hover:text-primary transition-colors">Post a Request</Link></li>
              <li><Link href="/requests" className="hover:text-primary transition-colors">Browse Orders</Link></li>
              <li><Link href="/auth/login" className="hover:text-primary transition-colors">Your Account</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">For Makers</h4>
            <ul className="space-y-2.5 text-muted">
              <li><Link href="/auth/register?role=maker" className="hover:text-primary transition-colors">Become a Maker</Link></li>
              <li><Link href="/requests" className="hover:text-primary transition-colors">Find Work</Link></li>
              <li><Link href="/makers" className="hover:text-primary transition-colors">Maker Directory</Link></li>
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
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden>
                <path d="M4 12.5L10 6l4 4 6-7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 18h16" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.45" />
              </svg>
            </span>
            <span className="font-display font-semibold text-foreground">{APP_NAME}</span>
          </div>
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} {APP_DOMAIN} — Made truly, for you
          </p>
        </div>
      </div>
    </footer>
  );
}
