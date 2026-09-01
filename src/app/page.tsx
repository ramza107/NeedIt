import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Avatar, StarRating } from '@/components/ui/Avatar';
import { APP_NAME, APP_TAGLINE, POPULAR_CATEGORIES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/server';
import {
  ArrowRight,
  Camera,
  Shield,
  MessageSquare,
  Star,
  Hammer,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

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

const DEMO_MAKERS = [
  { name: 'Maria Woodcraft', rating: 4.9, orders: 127, category: 'Furniture', city: 'Las Vegas' },
  { name: 'John Metalworks', rating: 4.7, orders: 54, category: 'Metalwork', city: 'Austin' },
  { name: 'Alex Designs', rating: 5.0, orders: 32, category: 'Jewelry', city: 'Portland' },
  { name: 'Studio Elena', rating: 4.8, orders: 89, category: 'Art', city: 'Denver' },
];

export default async function HomePage() {
  const [makers, categories] = await Promise.all([getFeaturedMakers(), getCategories()]);
  const popularCats = categories.filter((c) => POPULAR_CATEGORIES.includes(c.slug));
  const displayMakers = makers.length > 0 ? makers : null;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-light via-background to-accent-light/40" />
        <div
          className="gradient-orb -top-24 -right-24 h-96 w-96 bg-primary/20"
          aria-hidden
        />
        <div
          className="gradient-orb top-1/2 -left-32 h-80 w-80 bg-accent/15"
          aria-hidden
        />
        <div className="absolute inset-0 texture-grain opacity-60" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/70 backdrop-blur-sm px-4 py-2 text-sm font-medium text-primary mb-8 shadow-sm">
              <Sparkles className="h-4 w-4" />
              Custom orders marketplace
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold text-foreground leading-[1.1] tracking-tight">
              What do you want{' '}
              <span className="text-primary italic">made?</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted leading-relaxed max-w-2xl">
              {APP_TAGLINE}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button href="/auth/register?role=buyer" size="lg" className="gap-2">
                <Camera className="h-5 w-5" />
                Post a Request
              </Button>
              <Button href="/auth/register?role=maker" variant="outline" size="lg">
                Become a Maker
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-muted">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                Secure payments
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-accent" />
                Verified makers
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-accent" />
                Buyer protection
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Simple process</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground">
              How {APP_NAME} works
            </h2>
            <p className="text-muted mt-4 max-w-2xl mx-auto text-lg">
              From idea to finished product — protected every step of the way
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Camera, title: 'Post your idea', desc: 'Upload photos, describe what you need, set your budget' },
              { icon: MessageSquare, title: 'Get offers', desc: 'Skilled makers compete with prices, timelines, and portfolios' },
              { icon: Shield, title: 'Pay securely', desc: 'Funds held safely until you approve the finished work' },
              { icon: CheckCircle2, title: 'Approve & review', desc: 'Accept the result, release payment, leave a review' },
            ].map((step, i) => (
              <Card key={step.title} hover className="p-7 text-center relative group">
                <div className="absolute -top-3.5 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-md shadow-primary/30">
                  {i + 1}
                </div>
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary transition-transform group-hover:scale-110">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-muted-bg/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-foreground mb-8">
            Popular categories
          </h2>
          <div className="flex flex-wrap gap-3">
            {(popularCats.length > 0 ? popularCats : [
              { slug: 'furniture', name: 'Furniture', icon: '🪑' },
              { slug: 'jewelry', name: 'Jewelry', icon: '💎' },
              { slug: 'clothing', name: 'Clothing', icon: '👕' },
              { slug: 'art', name: 'Art', icon: '🎨' },
              { slug: 'gifts', name: 'Gifts', icon: '🎁' },
              { slug: '3d-printing', name: '3D Printing', icon: '🖨️' },
            ]).map((cat) => (
              <Link
                key={cat.slug}
                href={`/requests?category=${cat.slug}`}
                className="inline-flex items-center gap-2.5 rounded-2xl border border-border bg-card px-5 py-3.5 text-sm font-medium text-foreground/80 hover:border-primary/40 hover:bg-primary-light/50 hover:text-primary transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <span className="text-lg">{cat.icon || '📦'}</span>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Makers */}
      <section className="py-24 bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">Top talent</p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-foreground">
                Recommended Makers
              </h2>
            </div>
            <Link
              href="/requests"
              className="text-sm font-semibold text-primary hover:text-primary-hover flex items-center gap-1.5 transition-colors"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayMakers
              ? displayMakers.map((maker) => (
                  <Link key={maker.id} href={`/profile/${maker.user_id}`}>
                    <Card hover className="p-6 h-full">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar
                          src={maker.profile?.avatar_url}
                          name={maker.business_name || maker.profile?.full_name || 'Maker'}
                        />
                        <div>
                          <p className="font-semibold text-foreground">
                            {maker.business_name || maker.profile?.full_name}
                          </p>
                          <p className="text-xs text-muted">{maker.city}</p>
                        </div>
                      </div>
                      <StarRating rating={maker.rating} count={maker.review_count} />
                      <p className="text-sm text-muted mt-3">
                        {maker.completed_orders} completed orders
                      </p>
                    </Card>
                  </Link>
                ))
              : DEMO_MAKERS.map((maker) => (
                  <Card key={maker.name} hover className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar name={maker.name} />
                      <div>
                        <p className="font-semibold text-foreground">{maker.name}</p>
                        <p className="text-xs text-muted">{maker.city}</p>
                      </div>
                    </div>
                    <StarRating rating={maker.rating} />
                    <p className="text-sm text-muted mt-3">
                      {maker.orders} completed · {maker.category}
                    </p>
                  </Card>
                ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="relative overflow-hidden py-24 bg-foreground text-primary-foreground">
        <div className="gradient-orb top-0 right-0 h-64 w-64 bg-primary/30" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/20 mb-8">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-5">
            Buyer protection built in
          </h2>
          <p className="text-primary-foreground/70 max-w-2xl mx-auto text-lg leading-relaxed">
            Your payment is held securely until you review and approve the finished work.
            If something goes wrong, our dispute resolution team is here to help.
          </p>
          <Button href="/auth/register" variant="secondary" size="lg" className="mt-10">
            Get started for free
          </Button>
        </div>
      </section>
    </>
  );
}
