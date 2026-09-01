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
  CheckCircle2,
  Zap,
  Users,
  TrendingUp,
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

const STATS = [
  { value: '500+', label: 'Active makers' },
  { value: '2.4k', label: 'Orders completed' },
  { value: '4.8★', label: 'Average rating' },
];

export default async function HomePage() {
  const [makers, categories] = await Promise.all([getFeaturedMakers(), getCategories()]);
  const popularCats = categories.filter((c) => POPULAR_CATEGORIES.includes(c.slug));
  const displayMakers = makers.length > 0 ? makers : null;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden mesh-bg">
        <div className="absolute inset-0 grid-pattern opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary-light px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary mb-8">
                <Zap className="h-3.5 w-3.5" />
                Marketplace
              </div>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-[1.05] tracking-tight">
                What do you want{' '}
                <span className="bg-gradient-to-r from-primary via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                  made?
                </span>
              </h1>
              <p className="mt-6 text-lg text-muted leading-relaxed max-w-lg">
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
            </div>

            {/* Bento stats */}
            <div className="grid grid-cols-2 gap-4">
              {STATS.map((stat, i) => (
                <Card
                  key={stat.label}
                  hover
                  className={`p-6 ${i === 0 ? 'col-span-2' : ''}`}
                >
                  <p className="font-display text-3xl sm:text-4xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted mt-1">{stat.label}</p>
                </Card>
              ))}
              <Card hover className="col-span-2 p-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-light">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Buyer protection</p>
                  <p className="text-sm text-muted">Payment held until you approve</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Process</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
                How {APP_NAME} works
              </h2>
            </div>
            <p className="text-muted max-w-md">
              From idea to finished product — protected every step of the way
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { icon: Camera, title: 'Post your idea', desc: 'Upload photos, describe what you need, set your budget' },
              { icon: MessageSquare, title: 'Get offers', desc: 'Makers compete with prices, timelines, and portfolios' },
              { icon: Shield, title: 'Pay securely', desc: 'Funds held safely until you approve the finished work' },
              { icon: CheckCircle2, title: 'Approve & review', desc: 'Accept the result, release payment, leave a review' },
            ].map((step, i) => (
              <Card key={step.title} hover className="p-6 group">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary transition-transform group-hover:scale-110">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="font-display text-2xl font-bold text-muted/25">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-muted-bg border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-8">
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
                className="inline-flex items-center gap-2.5 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground/80 hover:border-primary/50 hover:bg-primary-light hover:text-primary transition-all duration-200"
              >
                <span>{cat.icon || '📦'}</span>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Makers */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-accent mb-2 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Top talent
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayMakers
              ? displayMakers.map((maker) => (
                  <Link key={maker.id} href={`/profile/${maker.user_id}`}>
                    <Card hover className="p-5 h-full">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar
                          src={maker.profile?.avatar_url}
                          name={maker.business_name || maker.profile?.full_name || 'Maker'}
                        />
                        <div>
                          <p className="font-semibold text-foreground text-sm">
                            {maker.business_name || maker.profile?.full_name}
                          </p>
                          <p className="text-xs text-muted">{maker.city}</p>
                        </div>
                      </div>
                      <StarRating rating={maker.rating} count={maker.review_count} />
                      <p className="text-xs text-muted mt-3 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-accent" />
                        {maker.completed_orders} orders
                      </p>
                    </Card>
                  </Link>
                ))
              : DEMO_MAKERS.map((maker) => (
                  <Card key={maker.name} hover className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar name={maker.name} />
                      <div>
                        <p className="font-semibold text-foreground text-sm">{maker.name}</p>
                        <p className="text-xs text-muted">{maker.city}</p>
                      </div>
                    </div>
                    <StarRating rating={maker.rating} />
                    <p className="text-xs text-muted mt-3">
                      {maker.orders} orders · {maker.category}
                    </p>
                  </Card>
                ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-border">
        <div className="absolute inset-0 mesh-bg opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl btn-gradient mb-8 shadow-xl shadow-primary/30">
            <Star className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold mb-5">
            Ready to create something{' '}
            <span className="bg-gradient-to-r from-primary to-pink-400 bg-clip-text text-transparent">
              unique?
            </span>
          </h2>
          <p className="text-muted max-w-xl mx-auto text-lg mb-10">
            Join thousands of buyers and makers. Post your first request in under 2 minutes.
          </p>
          <Button href="/auth/register" size="lg">
            Get started for free
          </Button>
        </div>
      </section>
    </>
  );
}
