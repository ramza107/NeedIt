import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import { Hammer } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-foreground text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Hammer className="h-4 w-4" />
              </div>
              <span className="font-display text-lg font-semibold">{APP_NAME}</span>
            </div>
            <p className="text-primary-foreground/70 text-sm max-w-md leading-relaxed">
              Describe what you need — skilled makers compete with offers.
              Payment is protected until you approve the finished work.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4 text-sm uppercase tracking-wider">For Buyers</h4>
            <ul className="space-y-2.5 text-sm text-primary-foreground/70">
              <li>
                <Link href="/auth/register?role=buyer" className="hover:text-primary-foreground transition-colors">
                  Create a Request
                </Link>
              </li>
              <li>
                <Link href="/requests" className="hover:text-primary-foreground transition-colors">
                  Browse Requests
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4 text-sm uppercase tracking-wider">For Makers</h4>
            <ul className="space-y-2.5 text-sm text-primary-foreground/70">
              <li>
                <Link href="/auth/register?role=maker" className="hover:text-primary-foreground transition-colors">
                  Become a Maker
                </Link>
              </li>
              <li>
                <Link href="/requests" className="hover:text-primary-foreground transition-colors">
                  Find Work
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-primary-foreground/10 text-center text-sm text-primary-foreground/50">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
