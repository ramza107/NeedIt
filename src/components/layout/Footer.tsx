import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import { Hammer } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 font-bold text-lg text-stone-900 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600 text-white">
                <Hammer className="h-4 w-4" />
              </div>
              {APP_NAME}
            </div>
            <p className="text-stone-600 text-sm max-w-md">
              Describe what you need — skilled makers compete with offers.
              Payment is protected until you approve the finished work.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-stone-900 mb-3">For Buyers</h4>
            <ul className="space-y-2 text-sm text-stone-600">
              <li><Link href="/auth/register?role=buyer" className="hover:text-amber-700">Create a Request</Link></li>
              <li><Link href="/requests" className="hover:text-amber-700">Browse Requests</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-stone-900 mb-3">For Makers</h4>
            <ul className="space-y-2 text-sm text-stone-600">
              <li><Link href="/auth/register?role=maker" className="hover:text-amber-700">Become a Maker</Link></li>
              <li><Link href="/requests" className="hover:text-amber-700">Find Work</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-stone-200 text-center text-sm text-stone-500">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
