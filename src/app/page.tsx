import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { MakerPromoCard } from '@/components/makers/MakerPromoCard';
import { CategoryManufacturers } from '@/components/makers/CategoryManufacturers';
import { toMakerCardData } from '@/lib/makers';
import { APP_NAME, APP_TAGLINE, POPULAR_CATEGORIES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/server';
import {
  ArrowRight,
  Shield,
  MessageSquare,
  CheckCircle2,
  Hammer,
  Building2,
  Megaphone,
  ClipboardList,
  Search,
} from 'lucide-react';

async function getPromotedMakers() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('maker_profiles')
      .select('*, profile:profiles(*)')
      .eq('is_promoted', true)
      .order('promoted_at', { ascending: false })
      .limit(12);
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

async function getManufacturers() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('maker_profiles')
      .select('*, profile:profiles(*)')
      .order('rating', { ascending: false })
      .limit(60);
    return data || [];
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from('categories').select('*');
    return data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [manufacturers, categories, promotedMakers] = await Promise.all([
    getManufacturers(),
    getCategories(),
    getPromotedMakers(),
  ]);

  const popularCats = categories.filter((c) => POPULAR_CATEGORIES.includes(c.slug));
  const categoryOptions = (popularCats.length > 0
    ? popularCats
    : POPULAR_CATEGORIES.map((slug) => ({
        id: slug,
        slug,
        name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        icon: null as string | null,
      }))
  ).map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    icon: c.icon,
  }));

  const makerCards = manufacturers.map(toMakerCardData);

  return (
    <div className="pb-12">
      {/* Brand-first hero — manufacturers first */}
      <section className="hero-gradient text-white">
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-24 lg:py-28">
          <p className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight mb-5 animate-fade-up">
            {APP_NAME}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-medium leading-snug text-white/95 mb-4 max-w-xl animate-fade-up-delay">
            Find manufacturers who make what you need.
          </h1>
          <p className="text-white/75 text-base sm:text-lg mb-9 leading-relaxed max-w-lg animate-fade-up-delay-2">
            {APP_TAGLINE}
          </p>
          <div className="flex flex-wrap gap-3 animate-fade-up-delay-2">
            <Button
              href="/makers"
              size="lg"
              className="gap-2 !bg-[#fffcf7] !text-[#3a342e] hover:!bg-white shadow-lg border border-[#fffcf7]"
            >
              <Building2 className="h-4 w-4" />
              Browse manufacturers
            </Button>
            <Button
              href="/auth/register?role=maker"
              size="lg"
              className="gap-2 !bg-[#3a342e] !text-[#fffcf7] hover:!bg-[#2a2520] shadow-lg border border-[#3a342e]"
            >
              <Hammer className="h-4 w-4" />
              List your company
            </Button>
            <Button
              href="/requests"
              size="lg"
              className="gap-2 !bg-[#fffcf7]/15 !text-[#fffcf7] border-2 border-[#fffcf7]/90 hover:!bg-[#fffcf7]/25 shadow-md backdrop-blur-sm"
            >
              <ClipboardList className="h-4 w-4" />
              Custom requests
            </Button>
          </div>
        </div>
      </section>

      {/* How it works — company-first */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Search, label: 'Browse manufacturers', sub: 'By category & specialty', step: '01' },
              { icon: MessageSquare, label: 'Contact or request', sub: 'Message or post a brief', step: '02' },
              { icon: Shield, label: 'Pay securely', sub: 'Funds held until done', step: '03' },
              { icon: CheckCircle2, label: 'Approve & review', sub: 'Release payment', step: '04' },
            ].map((item) => (
              <div key={item.step} className="flex flex-col gap-2">
                <span className="text-xs font-bold tracking-widest text-primary/50">{item.step}</span>
                <item.icon className="h-5 w-5 text-primary" />
                <p className="font-semibold text-foreground text-sm">{item.label}</p>
                <p className="text-xs text-muted leading-relaxed">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category → manufacturers (interactive) */}
      <section className="mx-auto max-w-6xl px-4 pt-10">
        <CategoryManufacturers categories={categoryOptions} makers={makerCards} />
      </section>

      {/* Sponsored manufacturers */}
      <section className="mx-auto max-w-6xl px-4 pt-8">
        <div className="section-panel p-5 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5 mb-1.5">
                <Megaphone className="h-3.5 w-3.5" />
                Sponsored
              </p>
              <h2 className="font-display text-2xl font-semibold text-foreground">Featured manufacturers</h2>
              <p className="text-sm text-muted mt-1">Companies advertising their production services</p>
            </div>
            <Link
              href="/auth/register?role=maker"
              className="text-sm text-link hover:text-primary-hover font-medium flex items-center gap-1"
            >
              Advertise your company <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {promotedMakers.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
              {promotedMakers.map((maker) => (
                <MakerPromoCard key={maker.id} maker={maker} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-muted-bg/50 p-10 text-center">
              <p className="font-semibold text-foreground mb-1">No sponsored manufacturers yet</p>
              <p className="text-sm text-muted mb-5 max-w-md mx-auto">
                Companies can turn on homepage promotion from their dashboard.
              </p>
              <Button href="/auth/register?role=maker" variant="accent">
                List your company &amp; advertise
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Split: manufacturers vs requests */}
      <section className="mx-auto max-w-6xl px-4 pt-8 grid md:grid-cols-2 gap-5">
        <div className="section-panel p-6 sm:p-7">
          <h2 className="font-display text-xl font-semibold mb-2">Looking for a manufacturer?</h2>
          <p className="text-muted text-sm mb-5 leading-relaxed">
            Browse companies by what they produce — furniture, clothing, jewelry, and more. View portfolios and ratings, then reach out.
          </p>
          <ul className="space-y-2.5 text-sm mb-6">
            <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Filter by production category</li>
            <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Compare portfolios &amp; reviews</li>
            <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Secure payments when you order</li>
          </ul>
          <Button href="/makers">
            Browse manufacturers
          </Button>
        </div>
        <div className="section-panel p-6 sm:p-7 bg-accent-light/40 border-accent/20">
          <h2 className="font-display text-xl font-semibold mb-2">Need something custom?</h2>
          <p className="text-muted text-sm mb-5 leading-relaxed">
            Post a request and let manufacturers send offers. Requests stay available as a separate flow — same protected payments.
          </p>
          <ul className="space-y-2.5 text-sm mb-6">
            <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-accent shrink-0" /> Free to post a request</li>
            <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-accent shrink-0" /> Compare multiple offers</li>
            <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-accent shrink-0" /> Payment protected until approval</li>
          </ul>
          <Button href="/requests" variant="accent">
            Go to requests
          </Button>
        </div>
      </section>

      {/* Trust banner */}
      <section className="mx-auto max-w-6xl px-4 pt-8">
        <div className="section-panel p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left bg-primary/5 border-primary/15">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shrink-0">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-lg font-semibold">Buyer protection on every order</h2>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              Your payment is held securely until you review and approve the finished work. Dispute support included.
            </p>
          </div>
          <Button href="/auth/register" variant="accent" className="shrink-0">
            Get started
          </Button>
        </div>
      </section>
    </div>
  );
}
