import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { RequestCard } from '@/components/requests/RequestCard';
import { MakerPromoCard } from '@/components/makers/MakerPromoCard';
import { Avatar, StarRating } from '@/components/ui/Avatar';
import { APP_NAME, APP_TAGLINE, POPULAR_CATEGORIES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/server';
import {
  ArrowRight,
  Camera,
  Shield,
  MessageSquare,
  CheckCircle2,
  Star,
  Hammer,
  Users,
  Megaphone,
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
    <div className="pb-8">
      {/* Hero banner */}
      <section className="bg-gradient-to-r from-[#232f3e] via-[#37475a] to-[#232f3e] text-white">
        <div className="mx-auto max-w-[1500px] px-4 py-10 sm:py-14">
          <div className="max-w-2xl">
            <p className="text-primary font-bold text-sm mb-2 uppercase tracking-wide">
              Custom orders marketplace
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
              Can&apos;t find it in a store?<br />
              <span className="text-primary">Get it made.</span>
            </h1>
            <p className="text-white/80 text-base sm:text-lg mb-6 leading-relaxed">
              {APP_TAGLINE}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button href="/auth/register?role=buyer" size="lg" className="gap-2 font-bold">
                <Camera className="h-4 w-4" />
                Post what you need
              </Button>
              <Button href="/requests" variant="secondary" size="lg" className="font-bold">
                Browse open orders
              </Button>
              <Button href="/auth/register?role=maker" variant="orange" size="lg" className="gap-2 font-bold">
                <Hammer className="h-4 w-4" />
                I&apos;m a maker
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works — immediate clarity */}
      <section className="bg-card border-b border-border">
        <div className="mx-auto max-w-[1500px] px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
            {[
              { icon: Camera, label: '1. Post your request', sub: 'Describe + set budget' },
              { icon: MessageSquare, label: '2. Get maker offers', sub: 'Compare prices & reviews' },
              { icon: Shield, label: '3. Pay securely', sub: 'Funds held until done' },
              { icon: CheckCircle2, label: '4. Approve & review', sub: 'Release payment' },
            ].map((step) => (
              <div key={step.label} className="flex flex-col items-center gap-1 py-2">
                <step.icon className="h-6 w-6 text-accent" />
                <p className="font-bold text-foreground">{step.label}</p>
                <p className="text-xs text-muted">{step.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsored maker ads */}
      <section className="mx-auto max-w-[1500px] px-4 pt-6">
        <div className="bg-card rounded p-4 sm:p-6 border border-border">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted flex items-center gap-1.5 mb-1">
                <Megaphone className="h-3.5 w-3.5" />
                Sponsored
              </p>
              <h2 className="text-xl font-bold text-foreground">Makers advertising their services</h2>
              <p className="text-sm text-muted mt-0.5">Hire skilled craftspeople — view profiles &amp; portfolios</p>
            </div>
            <Link
              href="/auth/register?role=maker"
              className="text-sm text-link hover:underline font-medium"
            >
              Advertise your profile →
            </Link>
          </div>

          {promotedMakers.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
              {promotedMakers.map((maker) => (
                <MakerPromoCard key={maker.id} maker={maker} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: 'Maria Woodcraft', city: 'Austin', headline: 'Custom furniture & wood restoration', rating: 4.9, orders: 127 },
                { name: 'Alex Designs', city: 'Portland', headline: 'Handmade jewelry & engagement rings', rating: 5.0, orders: 32 },
                { name: 'Studio Elena', city: 'Denver', headline: 'Original art commissions & portraits', rating: 4.8, orders: 89 },
              ].map((demo) => (
                <Link
                  key={demo.name}
                  href="/auth/register?role=maker"
                  className="card-product p-4 hover:bg-muted-bg transition-colors"
                >
                  <span className="text-[10px] font-bold uppercase text-muted">Sponsored · Demo</span>
                  <p className="font-bold text-link mt-2">{demo.name}</p>
                  <p className="text-xs text-muted">{demo.city}</p>
                  <p className="text-xs text-foreground/80 mt-2 line-clamp-2">{demo.headline}</p>
                  <p className="text-xs text-muted mt-2">★ {demo.rating} · {demo.orders} orders</p>
                </Link>
              ))}
              <div className="sm:col-span-3 rounded border border-dashed border-border bg-muted-bg p-6 text-center">
                <p className="font-bold text-foreground mb-1">Are you a maker?</p>
                <p className="text-sm text-muted mb-3">
                  Turn on homepage promotion from your dashboard — free during beta.
                </p>
                <Button href="/auth/register?role=maker" variant="orange" className="font-bold">
                  Create maker account &amp; advertise
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Shop by category */}
      <section className="mx-auto max-w-[1500px] px-4 pt-6">
        <div className="bg-card rounded p-4 sm:p-6 border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">Shop by category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {(popularCats.length > 0 ? popularCats : POPULAR_CATEGORIES.map((slug) => ({ slug, name: slug, icon: CATEGORY_META[slug]?.icon }))).map((cat) => {
              const meta = CATEGORY_META[cat.slug] || { icon: '📦', desc: 'Custom orders' };
              return (
                <Link
                  key={cat.slug}
                  href={`/requests?category=${cat.slug}`}
                  className="card-product p-4 text-center hover:bg-muted-bg transition-colors"
                >
                  <span className="text-3xl block mb-2">{cat.icon || meta.icon}</span>
                  <p className="font-bold text-sm text-foreground">{cat.name || cat.slug}</p>
                  <p className="text-xs text-muted mt-0.5">{meta.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open requests — like Amazon product grid */}
      <section className="mx-auto max-w-[1500px] px-4 pt-6">
        <div className="bg-card rounded p-4 sm:p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Open custom orders</h2>
              <p className="text-sm text-muted">Real requests from buyers — submit your offer</p>
            </div>
            <Link href="/requests" className="text-sm text-link hover:text-accent-hover hover:underline font-medium flex items-center gap-1">
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

      {/* Two columns: buyers + makers */}
      <section className="mx-auto max-w-[1500px] px-4 pt-6 grid md:grid-cols-2 gap-6">
        <div className="bg-card rounded p-6 border border-border">
          <h2 className="text-xl font-bold mb-2">Need something custom?</h2>
          <p className="text-muted text-sm mb-4">
            Upload photos, describe your idea, set a budget. Skilled makers will send you offers with price and timeline.
          </p>
          <ul className="space-y-2 text-sm mb-5">
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent shrink-0" /> Free to post a request</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent shrink-0" /> Compare multiple offers</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent shrink-0" /> Payment protected until approval</li>
          </ul>
          <Button href="/auth/register?role=buyer" className="font-bold">
            Post a request — it&apos;s free
          </Button>
        </div>
        <div className="bg-card rounded p-6 border border-border">
          <h2 className="text-xl font-bold mb-2">Are you a maker?</h2>
          <p className="text-muted text-sm mb-4">
            Browse open orders in your category. Send offers, get paid when the buyer approves your work.
          </p>
          <ul className="space-y-2 text-sm mb-5">
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent shrink-0" /> New orders daily</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent shrink-0" /> Build your portfolio & rating</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent shrink-0" /> Secure payouts</li>
          </ul>
          <Button href="/auth/register?role=maker" variant="orange" className="font-bold">
            Start earning as a maker
          </Button>
        </div>
      </section>

      {/* Top makers */}
      {makers.length > 0 && (
        <section className="mx-auto max-w-[1500px] px-4 pt-6">
          <div className="bg-card rounded p-4 sm:p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                Top-rated makers
              </h2>
              <Link href="/requests" className="text-sm text-link hover:underline">View all</Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {makers.map((maker) => (
                <Link key={maker.id} href={`/profile/${maker.user_id || maker.profile?.id}`} className="card-product p-4 hover:bg-muted-bg">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar
                      src={maker.profile?.avatar_url}
                      name={maker.business_name || maker.profile?.full_name || 'Maker'}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate text-link">
                        {maker.business_name || maker.profile?.full_name}
                      </p>
                      <p className="text-xs text-muted">{maker.city}</p>
                    </div>
                  </div>
                  <StarRating rating={maker.rating} count={maker.review_count} />
                  <p className="text-xs text-muted mt-1">{maker.completed_orders} orders completed</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust banner */}
      <section className="mx-auto max-w-[1500px] px-4 pt-6">
        <div className="bg-card rounded p-6 border border-border flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <Shield className="h-12 w-12 text-accent shrink-0" />
          <div className="flex-1">
            <h2 className="text-lg font-bold">Buyer protection on every order</h2>
            <p className="text-sm text-muted mt-1">
              Your payment is held securely until you review and approve the finished work. Dispute support included.
            </p>
          </div>
          <Button href="/auth/register" variant="orange" className="shrink-0 font-bold">
            Get started
          </Button>
        </div>
      </section>
    </div>
  );
}
