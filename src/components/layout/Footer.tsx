import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import { Zap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="glow-line" />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg btn-gradient">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-display text-lg font-bold">{APP_NAME}</span>
            </div>
            <p className="text-muted text-sm max-w-md leading-relaxed">
              Describe what you need — skilled makers compete with offers.
              Payment is protected until you approve the finished work.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-xs uppercase tracking-widest text-muted">For Buyers</h4>
            <ul className="space-y-2.5 text-sm text-muted">
              <li>
                <Link href="/auth/register?role=buyer" className="hover:text-primary transition-colors">
                  Create a Request
                </Link>
              </li>
              <li>
                <Link href="/requests" className="hover:text-primary transition-colors">
                  Browse Requests
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-xs uppercase tracking-widest text-muted">For Makers</h4>
            <ul className="space-y-2.5 text-sm text-muted">
              <li>
                <Link href="/auth/register?role=maker" className="hover:text-primary transition-colors">
                  Become a Maker
                </Link>
              </li>
              <li>
                <Link href="/requests" className="hover:text-primary transition-colors">
                  Find Work
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
