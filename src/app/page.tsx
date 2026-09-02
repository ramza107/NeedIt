import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { RequestCard } from '@/components/requests/RequestCard';
import { MakerPromoCard } from '@/components/makers/MakerPromoCard';
import { Avatar, StarRating } from '@/components/ui/Avatar';
import { makerProfilePath, getMakerProfile } from '@/lib/makers';
import { APP_NAME, APP_TAGLINE, POPULAR_CATEGORIES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/server';
import {
  ArrowRight,
  Camera,
  Shield,
  MessageSquare,
  CheckCircle2,
  Hammer,
  Users,
  Megaphone,
  Sparkles,
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

async function getOpenRequests() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('requests')
      .select('*, category:categories(*), images:request_images(*)')
      .in('status', ['open', 'offers_received'])
      .order('created_at', { ascending: false })
      .limit(8);
    return data || [];
  } catch {
    return [];
  }
}

async function getFeaturedMakers() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('maker_profiles')
      .select('*, profile:profiles(*)')
      .order('rating', { ascending: false })
      .limit(4);
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

const DEMO_REQUESTS = [
  { id: '1', title: 'Custom oak dining table for 6 people', description: 'Solid wood, rustic style', status: 'open', budget_min: 800, budget_max: 1500, city: 'Austin', created_at: new Date().toISOString(), category: { name: 'Furniture', icon: '🪑' }, images: [] },
  { id: '2', title: 'Engagement ring — custom design', description: 'White gold with sapphire', status: 'open', budget_min: 500, budget_max: 1200, city: 'NYC', created_at: new Date().toISOString(), category: { name: 'Jewelry', icon: '💎' }, images: [] },
  { id: '3', title: '3D printed drone parts', description: 'Carbon fiber reinforced', status: 'offers_received', budget_min: 50, budget_max: 200, city: 'Seattle', created_at: new Date().toISOString(), category: { name: '3D Printing', icon: '🖨️' }, images: [] },
  { id: '4', title: 'Hand-painted family portrait', description: 'Oil on canvas, 24x36', status: 'open', budget_min: 200, budget_max: 500, city: 'Denver', created_at: new Date().toISOString(), category: { name: 'Art', icon: '🎨' }, images: [] },
];

const CATEGORY_META: Record<string, { icon: string; desc: string }> = {
  furniture: { icon: '🪑', desc: 'Tables, shelves, decor' },
  jewelry: { icon: '💎', desc: 'Rings, necklaces, custom' },
  clothing: { icon: '👕', desc: 'Tailored & handmade' },
  art: { icon: '🎨', desc: 'Paintings, sculptures' },
  gifts: { icon: '🎁', desc: 'Personalized gifts' },
  '3d-printing': { icon: '🖨️', desc: 'Prototypes & parts' },
};

export default async function HomePage() {
  const [requests, makers, categories, promotedMakers] = await Promise.all([
    getOpenRequests(),
    getFeaturedMakers(),
    getCategories(),
    getPromotedMakers(),
  ]);

  const popularCats = categories.filter((c) => POPULAR_CATEGORIES.includes(c.slug));
  const hasRealRequests = requests.length > 0;
  const displayRequests = hasRealRequests ? requests : DEMO_REQUESTS;

  return (
    <div className="pb-12">
      {/* Hero */}
      <section className="hero-gradient border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20 lg:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              Custom orders marketplace
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.1] tracking-tight text-foreground mb-5">
              Can&apos;t find it in a store?<br />
              <span className="text-primary">Get it made.</span>
            </h1>
            <p className="text-muted text-base sm:text-lg mb-8 leading-relaxed max-w-xl">
              {APP_TAGLINE}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button href="/auth/register?role=buyer" size="lg" className="gap-2">
                <Camera className="h-4 w-4" />
                Post what you need
              </Button>
              <Button href="/requests" variant="secondary" size="lg">
                Browse open orders
              </Button>
              <Button href="/auth/register?role=maker" variant="accent" size="lg" className="gap-2">
                <Hammer className="h-4 w-4" />
                I&apos;m a maker
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Camera, label: 'Post your request', sub: 'Describe + set budget', step: '01' },
              { icon: MessageSquare, label: 'Get maker offers', sub: 'Compare prices & reviews', step: '02' },
              { icon: Shield, label: 'Pay securely', sub: 'Funds held until done', step: '03' },
              { icon: CheckCircle2, label: 'Approve & review', sub: 'Release payment', step: '04' },
            ].map((item) => (
              <div key={item.step} className="flex flex-col gap-2">
                <span className="text-xs font-bold text-primary/60">{item.step}</span>
                <item.icon className="h-5 w-5 text-primary" />
                <p className="font-semibold text-foreground text-sm">{item.label}</p>
                <p className="text-xs text-muted leading-relaxed">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsored makers */}
      <section className="mx-auto max-w-6xl px-4 pt-10">
        <div className="section-panel p-5 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5 mb-1.5">
                <Megaphone className="h-3.5 w-3.5" />
                Sponsored
              </p>
              <h2 className="font-display text-2xl font-semibold text-foreground">Featured makers</h2>
              <p className="text-sm text-muted mt-1">Hire skilled craftspeople — view profiles &amp; portfolios</p>
            </div>
            <Link
              href="/auth/register?role=maker"
              className="text-sm text-link hover:text-primary-hover font-medium flex items-center gap-1"
            >
              Advertise your profile <ArrowRight className="h-3.5 w-3.5" />
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
              <p className="font-semibold text-foreground mb-1">No sponsored makers yet</p>
              <p className="text-sm text-muted mb-5 max-w-md mx-auto">
                Makers can turn on homepage promotion from their dashboard.
              </p>
              <Button href="/auth/register?role=maker" variant="accent">
                Create maker account &amp; advertise
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 pt-8">
        <div className="section-panel p-5 sm:p-7">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-5">Browse by category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {(popularCats.length > 0 ? popularCats : POPULAR_CATEGORIES.map((slug) => ({ slug, name: slug, icon: CATEGORY_META[slug]?.icon }))).map((cat) => {
              const meta = CATEGORY_META[cat.slug] || { icon: '📦', desc: 'Custom orders' };
              return (
                <Link
                  key={cat.slug}
                  href={`/requests?category=${cat.slug}`}
                  className="card-product p-4 text-center hover:bg-muted-bg/50 transition-colors"
                >
                  <span className="text-3xl block mb-2">{cat.icon || meta.icon}</span>
                  <p className="font-semibold text-sm text-foreground">{cat.name || cat.slug}</p>
                  <p className="text-xs text-muted mt-0.5">{meta.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open requests */}
      <section className="mx-auto max-w-6xl px-4 pt-8">
        <div className="section-panel p-5 sm:p-7">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground">Open custom orders</h2>
              <p className="text-sm text-muted mt-1">Real requests from buyers — submit your offer</p>
            </div>
            <Link href="/requests" className="text-sm text-link hover:text-primary-hover font-medium flex items-center gap-1">
              See all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {displayRequests.slice(0, 8).map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                compact
                href={hasRealRequests ? undefined : '/auth/register?role=maker'}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Buyers + Makers */}
      <section className="mx-auto max-w-6xl px-4 pt-8 grid md:grid-cols-2 gap-5">
        <div className="section-panel p-6 sm:p-7">
          <h2 className="font-display text-xl font-semibold mb-2">Need something custom?</h2>
          <p className="text-muted text-sm mb-5 leading-relaxed">
            Upload photos, describe your idea, set a budget. Skilled makers will send you offers with price and timeline.
          </p>
          <ul className="space-y-2.5 text-sm mb-6">
            <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Free to post a request</li>
            <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Compare multiple offers</li>
            <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Payment protected until approval</li>
          </ul>
          <Button href="/auth/register?role=buyer">
            Post a request — it&apos;s free
          </Button>
        </div>
        <div className="section-panel p-6 sm:p-7 bg-accent-light/30 border-accent/20">
          <h2 className="font-display text-xl font-semibold mb-2">Are you a maker?</h2>
          <p className="text-muted text-sm mb-5 leading-relaxed">
            Browse open orders in your category. Send offers, get paid when the buyer approves your work.
          </p>
          <ul className="space-y-2.5 text-sm mb-6">
            <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-accent shrink-0" /> New orders daily</li>
            <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-accent shrink-0" /> Build your portfolio & rating</li>
            <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-accent shrink-0" /> Secure payouts</li>
          </ul>
          <Button href="/auth/register?role=maker" variant="accent">
            Start earning as a maker
          </Button>
        </div>
      </section>

      {/* Top makers */}
      {makers.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-8">
          <div className="section-panel p-5 sm:p-7">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-2xl font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Top-rated makers
              </h2>
              <Link href="/makers" className="text-sm text-link hover:text-primary-hover font-medium">View all makers</Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {makers.map((maker) => {
                const href = makerProfilePath(maker);
                const profile = getMakerProfile(maker);
                const name = maker.business_name || profile?.full_name || 'Maker';
                if (!href) return null;

                return (
                <Link key={maker.id} href={href} className="card-product p-4 hover:bg-muted-bg/50">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar
                      src={profile?.avatar_url}
                      name={name}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate text-link">
                        {name}
                      </p>
                      <p className="text-xs text-muted">{maker.city}</p>
                    </div>
                  </div>
                  <StarRating rating={maker.rating} count={maker.review_count} />
                  <p className="text-xs text-muted mt-1">{maker.completed_orders} orders completed</p>
                </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

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
