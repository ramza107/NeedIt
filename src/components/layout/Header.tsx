'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Avatar } from '@/components/ui/Avatar';
import { SearchBar } from '@/components/layout/SearchBar';
import { APP_NAME, POPULAR_CATEGORIES } from '@/lib/constants';
import type { Profile } from '@/types/database';
import { Menu, X, MapPin, Package, LogOut, User, ChevronDown } from 'lucide-react';
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
    <header className="sticky top-0 z-50">
      {/* Main bar */}
      <div className="bg-header text-white">
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-3 py-2 sm:px-4">
          <Link href="/" className="flex shrink-0 items-center gap-1 px-2 py-1 hover:outline hover:outline-1 hover:outline-white rounded">
            <span className="text-xl font-bold tracking-tight">{APP_NAME}</span>
            <span className="hidden sm:inline text-[10px] text-white/70 leading-tight">.com</span>
          </Link>

          <div className="hidden sm:flex items-center gap-1 shrink-0 text-xs hover:outline hover:outline-1 hover:outline-white rounded px-2 py-1 cursor-default">
            <MapPin className="h-4 w-4" />
            <div>
              <p className="text-white/70">Deliver to</p>
              <p className="font-bold">United States</p>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-3xl">
            <SearchBar />
          </div>

          <div className="hidden md:flex items-center gap-1 ml-auto">
            {profile ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 px-2 py-1 hover:outline hover:outline-1 hover:outline-white rounded text-left"
                >
                  <div>
                    <p className="text-xs text-white/70">Hello, {profile.full_name.split(' ')[0]}</p>
                    <p className="text-sm font-bold flex items-center gap-0.5">
                      Account <ChevronDown className="h-3 w-3" />
                    </p>
                  </div>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-1 w-56 rounded border border-border bg-card py-1 shadow-lg text-foreground z-50">
                    <RoleSwitcher profile={profile} onSwitched={() => setUserMenuOpen(false)} />
                    <Link
                      href={`/profile/${profile.id}`}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted-bg"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Your Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted-bg"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      {loggingOut ? 'Signing out...' : 'Sign out'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="px-2 py-1 hover:outline hover:outline-1 hover:outline-white rounded">
                <p className="text-xs text-white/70">Hello, sign in</p>
                <p className="text-sm font-bold">Account</p>
              </Link>
            )}

            <Link
              href={profile ? '/dashboard' : '/auth/register'}
              className="flex items-center gap-1 px-2 py-1 hover:outline hover:outline-1 hover:outline-white rounded"
            >
              <div>
                <p className="text-xs text-white/70">Your</p>
                <p className="text-sm font-bold">Orders</p>
              </div>
            </Link>

            <Link
              href={profile?.role === 'buyer' ? '/requests/new' : '/requests'}
              className="flex items-center gap-1 px-2 py-1 hover:outline hover:outline-1 hover:outline-white rounded"
            >
              <Package className="h-7 w-7" />
              <span className="font-bold text-sm hidden lg:inline">
                {profile?.role === 'buyer' ? 'Post Request' : 'Browse'}
              </span>
            </Link>
          </div>

          <button
            className="md:hidden p-2 hover:outline hover:outline-1 hover:outline-white rounded"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile search */}
        <div className="md:hidden px-3 pb-2">
          <SearchBar />
        </div>
      </div>

      {/* Category nav */}
      <div className="bg-header-secondary text-white text-sm">
        <div className="mx-auto flex max-w-[1500px] items-center gap-1 px-3 py-1.5 sm:px-4">
          <div className="relative" ref={requestsMenuRef}>
            <button
              type="button"
              onClick={() => setRequestsMenuOpen(!requestsMenuOpen)}
              className={`flex items-center gap-1 shrink-0 px-2 py-1 rounded hover:outline hover:outline-1 hover:outline-white font-medium ${
                pathname === '/requests' || requestsMenuOpen ? 'bg-white/10' : ''
              }`}
              aria-expanded={requestsMenuOpen}
              aria-haspopup="true"
            >
              All Requests
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${requestsMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {requestsMenuOpen && (
              <div className="absolute left-0 top-full mt-1 z-50 min-w-[220px] rounded border border-border bg-card py-1 shadow-lg text-foreground">
                <Link
                  href="/requests"
                  className="block px-4 py-2.5 text-sm font-semibold hover:bg-muted-bg border-b border-border"
                  onClick={() => setRequestsMenuOpen(false)}
                >
                  All Requests
                </Link>
                <div className="px-4 pt-2 pb-1">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Categories</p>
                </div>
                {POPULAR_CATEGORIES.map((slug) => (
                  <Link
                    key={slug}
                    href={`/requests?category=${slug}`}
                    className="block px-4 py-2 text-sm hover:bg-muted-bg"
                    onClick={() => setRequestsMenuOpen(false)}
                  >
                    {CATEGORY_LABELS[slug] || slug}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/auth/register?role=buyer"
              className="shrink-0 px-2 py-1 rounded hover:outline hover:outline-1 hover:outline-white whitespace-nowrap font-medium text-primary"
            >
              + Post a Request
            </Link>
            <Link
              href="/auth/register?role=maker"
              className="shrink-0 px-2 py-1 rounded hover:outline hover:outline-1 hover:outline-white whitespace-nowrap"
            >
              Become a Maker
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-b border-border px-4 py-3 space-y-2 text-foreground">
          {profile ? (
            <>
              <div className="flex items-center gap-3 pb-2 border-b border-border">
                <Avatar src={profile.avatar_url} name={profile.full_name} size="sm" />
                <div>
                  <p className="font-bold">{profile.full_name}</p>
                  <p className="text-xs text-muted capitalize">{profile.role}</p>
                </div>
              </div>
              <RoleSwitcher profile={profile} onSwitched={() => setMobileOpen(false)} />
              <Link href="/dashboard" className="block py-2 font-medium" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <Link href="/requests" className="block py-2 font-medium" onClick={() => setMobileOpen(false)}>All Requests</Link>
              <div className="pl-3 space-y-1 border-l-2 border-border ml-1">
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
              <button type="button" onClick={handleLogout} className="block py-2 text-red-600 font-medium w-full text-left">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="block py-2 font-medium" onClick={() => setMobileOpen(false)}>Sign in</Link>
              <Link href="/auth/register" className="block py-2 font-medium" onClick={() => setMobileOpen(false)}>Create account</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
