'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Avatar } from '@/components/ui/Avatar';
import { SearchBar } from '@/components/layout/SearchBar';
import { APP_NAME, POPULAR_CATEGORIES } from '@/lib/constants';
import type { Profile } from '@/types/database';
import { Menu, X, Package, LogOut, User, ChevronDown } from 'lucide-react';
import { RoleSwitcher } from '@/components/layout/RoleSwitcher';

const CATEGORY_LABELS: Record<string, string> = {
  furniture: 'Furniture',
  jewelry: 'Jewelry',
  clothing: 'Clothing',
  art: 'Art',
  gifts: 'Gifts',
  '3d-printing': '3D Printing',
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const requestsMenuRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [requestsMenuOpen, setRequestsMenuOpen] = useState(false);
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
      if (requestsMenuRef.current && !requestsMenuRef.current.contains(event.target as Node)) {
        setRequestsMenuOpen(false);
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

  return (
    <header className="sticky top-0 z-50 bg-header/90 backdrop-blur-md border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-bold">
            {APP_NAME.charAt(0)}
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
            {APP_NAME}
          </span>
        </Link>

        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <SearchBar />
        </div>

        <nav className="hidden md:flex items-center gap-1 ml-auto">
          <div className="relative" ref={requestsMenuRef}>
            <button
              type="button"
              onClick={() => setRequestsMenuOpen(!requestsMenuOpen)}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                pathname === '/requests' || requestsMenuOpen
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground hover:bg-muted-bg'
              }`}
              aria-expanded={requestsMenuOpen}
              aria-haspopup="true"
            >
              Browse
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${requestsMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {requestsMenuOpen && (
              <div className="absolute left-0 top-full mt-2 z-50 min-w-[220px] rounded-2xl border border-border bg-card py-2 shadow-xl text-foreground">
                <Link
                  href="/requests"
                  className="block px-4 py-2.5 text-sm font-semibold hover:bg-muted-bg mx-1 rounded-xl"
                  onClick={() => setRequestsMenuOpen(false)}
                >
                  All Requests
                </Link>
                <div className="px-4 pt-2 pb-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Categories</p>
                </div>
                {POPULAR_CATEGORIES.map((slug) => (
                  <Link
                    key={slug}
                    href={`/requests?category=${slug}`}
                    className="block px-4 py-2 text-sm hover:bg-muted-bg mx-1 rounded-xl"
                    onClick={() => setRequestsMenuOpen(false)}
                  >
                    {CATEGORY_LABELS[slug] || slug}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/makers"
            className="px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted-bg transition-colors"
          >
            Makers
          </Link>

          {profile ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted-bg transition-colors"
              >
                <Avatar src={profile.avatar_url} name={profile.full_name} size="sm" />
                <ChevronDown className="h-3.5 w-3.5 text-muted" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-card py-2 shadow-xl text-foreground z-50">
                  <div className="px-4 py-2 border-b border-border mb-1">
                    <p className="font-semibold text-sm truncate">{profile.full_name}</p>
                    <p className="text-xs text-muted capitalize">{profile.role}</p>
                  </div>
                  <RoleSwitcher profile={profile} onSwitched={() => setUserMenuOpen(false)} />
                  <Link
                    href={`/profile/${profile.id}`}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted-bg mx-1 rounded-xl"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Your Profile
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted-bg mx-1 rounded-xl"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 mx-1 rounded-xl"
                  >
                    <LogOut className="h-4 w-4" />
                    {loggingOut ? 'Signing out...' : 'Sign out'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted-bg transition-colors"
            >
              Sign in
            </Link>
          )}

          <Link
            href={profile?.role === 'buyer' ? '/requests/new' : '/requests'}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted-bg transition-colors"
          >
            <Package className="h-4 w-4" />
            {profile?.role === 'buyer' ? 'Post' : 'Orders'}
          </Link>

          <Link
            href="/auth/register?role=buyer"
            className="ml-1 px-4 py-2 rounded-xl text-sm font-semibold btn-primary"
          >
            Get started
          </Link>
        </nav>

        <button
          className="md:hidden p-2 rounded-xl hover:bg-muted-bg transition-colors ml-auto"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className="md:hidden px-4 pb-3">
        <SearchBar />
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-4 space-y-1">
          {profile ? (
            <>
              <div className="flex items-center gap-3 pb-3 mb-2 border-b border-border">
                <Avatar src={profile.avatar_url} name={profile.full_name} size="sm" />
                <div>
                  <p className="font-semibold">{profile.full_name}</p>
                  <p className="text-xs text-muted capitalize">{profile.role}</p>
                </div>
              </div>
              <RoleSwitcher profile={profile} onSwitched={() => setMobileOpen(false)} />
              <Link href="/dashboard" className="block py-2.5 font-medium rounded-xl px-2 hover:bg-muted-bg" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <Link href="/requests" className="block py-2.5 font-medium rounded-xl px-2 hover:bg-muted-bg" onClick={() => setMobileOpen(false)}>All Requests</Link>
              <Link href="/makers" className="block py-2.5 font-medium rounded-xl px-2 hover:bg-muted-bg" onClick={() => setMobileOpen(false)}>Makers</Link>
              <div className="pl-3 space-y-1 border-l-2 border-border ml-2 my-2">
                {POPULAR_CATEGORIES.map((slug) => (
                  <Link
                    key={slug}
                    href={`/requests?category=${slug}`}
                    className="block py-1.5 text-sm text-muted hover:text-foreground"
                    onClick={() => setMobileOpen(false)}
                  >
                    {CATEGORY_LABELS[slug] || slug}
                  </Link>
                ))}
              </div>
              <button type="button" onClick={handleLogout} className="block py-2.5 text-red-600 font-medium w-full text-left px-2">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="block py-2.5 font-medium rounded-xl px-2 hover:bg-muted-bg" onClick={() => setMobileOpen(false)}>Sign in</Link>
              <Link href="/auth/register" className="block py-2.5 font-medium rounded-xl px-2 hover:bg-muted-bg" onClick={() => setMobileOpen(false)}>Create account</Link>
            </>
          )}
          <div className="pt-3 flex gap-2">
            <Link href="/auth/register?role=buyer" className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold btn-primary" onClick={() => setMobileOpen(false)}>
              Post a request
            </Link>
            <Link href="/auth/register?role=maker" className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold btn-accent" onClick={() => setMobileOpen(false)}>
              I&apos;m a maker
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
