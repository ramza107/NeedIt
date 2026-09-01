import Link from 'next/link';
import { APP_DOMAIN, APP_NAME } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="mt-auto">
      <div className="bg-header-secondary py-8 text-center">
        <Link
          href="/"
          className="inline-block text-sm text-white hover:underline"
        >
          Back to top
        </Link>
      </div>
      <div className="bg-header text-white py-10">
        <div className="mx-auto max-w-[1500px] px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <h4 className="font-bold mb-3">Get to Know Us</h4>
            <ul className="space-y-2 text-white/80">
              <li><Link href="/" className="hover:underline">About {APP_NAME}</Link></li>
              <li><Link href="/requests" className="hover:underline">How it works</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3">For Buyers</h4>
            <ul className="space-y-2 text-white/80">
              <li><Link href="/auth/register?role=buyer" className="hover:underline">Post a Request</Link></li>
              <li><Link href="/requests" className="hover:underline">Browse Orders</Link></li>
              <li><Link href="/auth/login" className="hover:underline">Your Account</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3">For Makers</h4>
            <ul className="space-y-2 text-white/80">
              <li><Link href="/auth/register?role=maker" className="hover:underline">Become a Maker</Link></li>
              <li><Link href="/requests" className="hover:underline">Find Work</Link></li>
              <li><Link href="/dashboard" className="hover:underline">Maker Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3">Help & Safety</h4>
            <ul className="space-y-2 text-white/80">
              <li><span>Buyer protection</span></li>
              <li><span>Secure payments</span></li>
              <li><span>Dispute resolution</span></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-[1500px] px-6 mt-10 pt-6 border-t border-white/10 text-center text-xs text-white/60">
          © {new Date().getFullYear()} {APP_DOMAIN} — Custom orders marketplace. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
