'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { APP_NAME } from '@/lib/constants';
import type { Profile } from '@/types/database';
import { Menu, X, Hammer, LogOut, User } from 'lucide-react';
import { RoleSwitcher } from '@/components/layout/RoleSwitcher';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const supabaseConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (!supabaseConfigured) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
          setProfile(data);
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data }) => {
          setProfile(data);
        });
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabaseConfigured]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    setMobileOpen(false);
    setProfile(null);
    router.push('/');
    router.refresh();
    setLoggingOut(false);
  }

  const navLinks = profile
    ? [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/requests', label: profile.role === 'maker' ? 'Browse Requests' : 'My Requests' },
        ...(profile.role === 'buyer' ? [{ href: '/requests/new', label: 'Create Request' }] : []),
        ...(profile.role === 'admin' ? [{ href: '/admin', label: 'Admin' }] : []),
      ]
    : [];

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-stone-900">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600 text-white">
            <Hammer className="h-5 w-5" />
          </div>
          {APP_NAME}
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'text-amber-700'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {profile ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-stone-100 transition-colors"
              >
                <Avatar src={profile.avatar_url} name={profile.full_name} size="sm" />
                <span className="text-sm font-medium text-stone-700">{profile.full_name}</span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
                  <RoleSwitcher profile={profile} onSwitched={() => setUserMenuOpen(false)} />
                  <Link
                    href={`/profile/${profile.id}`}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    {loggingOut ? 'Logging out...' : 'Log out'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button href="/auth/login" variant="ghost" size="sm">
                Log in
              </Button>
              <Button href="/auth/register" size="sm">
                Get Started
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 text-stone-600"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-sm font-medium text-stone-700 py-2"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {!profile ? (
            <div className="flex gap-2 pt-2">
              <Button href="/auth/login" variant="outline" size="sm" className="flex-1">
                Log in
              </Button>
              <Button href="/auth/register" size="sm" className="flex-1">
                Get Started
              </Button>
            </div>
          ) : (
            <div className="pt-2 space-y-2 border-t border-stone-100">
              <RoleSwitcher profile={profile} onSwitched={() => setMobileOpen(false)} />
              <Link
                href={`/profile/${profile.id}`}
                className="flex items-center gap-2 text-sm font-medium text-stone-700 py-2"
                onClick={() => setMobileOpen(false)}
              >
                <User className="h-4 w-4" />
                My Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex w-full items-center gap-2 text-sm font-medium text-red-600 py-2"
              >
                <LogOut className="h-4 w-4" />
                {loggingOut ? 'Logging out...' : 'Log out'}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
