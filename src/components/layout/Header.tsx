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
    <header className="sticky top-0 z-50 border-b border-border/60 bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25 transition-transform group-hover:scale-105">
            <Hammer className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-semibold text-foreground tracking-tight">
            {APP_NAME}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-primary-light text-primary'
                  : 'text-muted hover:text-foreground hover:bg-muted-bg'
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
                className="flex items-center gap-2.5 rounded-xl border border-transparent px-2 py-1.5 hover:border-border hover:bg-muted-bg/60 transition-all"
              >
                <Avatar src={profile.avatar_url} name={profile.full_name} size="sm" />
                <span className="text-sm font-medium text-foreground/80">{profile.full_name}</span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-border bg-card py-1.5 shadow-xl shadow-foreground/5">
                  <RoleSwitcher profile={profile} onSwitched={() => setUserMenuOpen(false)} />
                  <Link
                    href={`/profile/${profile.id}`}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted-bg transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User className="h-4 w-4 text-muted" />
                    My Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
          className="md:hidden p-2.5 rounded-xl text-muted hover:bg-muted-bg hover:text-foreground transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-primary-light text-primary'
                  : 'text-foreground/80 hover:bg-muted-bg'
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {!profile ? (
            <div className="flex gap-2 pt-3">
              <Button href="/auth/login" variant="outline" size="sm" className="flex-1">
                Log in
              </Button>
              <Button href="/auth/register" size="sm" className="flex-1">
                Get Started
              </Button>
            </div>
          ) : (
            <div className="pt-3 space-y-1 border-t border-border mt-3">
              <RoleSwitcher profile={profile} onSwitched={() => setMobileOpen(false)} />
              <Link
                href={`/profile/${profile.id}`}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted-bg"
                onClick={() => setMobileOpen(false)}
              >
                <User className="h-4 w-4" />
                My Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
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
