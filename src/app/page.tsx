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
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZGU2OGEiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0tNiA2aC00di0yaDR2MnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-800 mb-6">
              <Hammer className="h-4 w-4" />
              Custom orders marketplace
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 leading-tight tracking-tight">
              What do you want{' '}
              <span className="text-amber-600">made?</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-stone-600 leading-relaxed">
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
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-stone-900 text-center mb-4">How {APP_NAME} works</h2>
          <p className="text-stone-600 text-center mb-12 max-w-2xl mx-auto">
            From idea to finished product — protected every step of the way
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Camera, title: 'Post your idea', desc: 'Upload photos, describe what you need, set your budget' },
              { icon: MessageSquare, title: 'Get offers', desc: 'Skilled makers compete with prices, timelines, and portfolios' },
              { icon: Shield, title: 'Pay securely', desc: 'Funds held safely until you approve the finished work' },
              { icon: CheckCircle2, title: 'Approve & review', desc: 'Accept the result, release payment, leave a review' },
            ].map((step, i) => (
              <Card key={step.title} className="p-6 text-center relative">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="absolute -top-3 -left-3 flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-white text-sm font-bold">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-stone-900 mb-2">{step.title}</h3>
                <p className="text-sm text-stone-600">{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-stone-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-stone-900 mb-8">Popular categories</h2>
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
                className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-medium text-stone-700 hover:border-amber-400 hover:bg-amber-50 transition-colors"
              >
                <span>{cat.icon || '📦'}</span>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Makers */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-stone-900">Recommended Makers</h2>
            <Link href="/requests" className="text-sm font-medium text-amber-700 hover:text-amber-800 flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayMakers
              ? displayMakers.map((maker) => (
                  <Link key={maker.id} href={`/profile/${maker.user_id}`}>
                    <Card className="p-5 hover:shadow-md transition-shadow h-full">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar
                          src={maker.profile?.avatar_url}
                          name={maker.business_name || maker.profile?.full_name || 'Maker'}
                        />
                        <div>
                          <p className="font-semibold text-stone-900">
                            {maker.business_name || maker.profile?.full_name}
                          </p>
                          <p className="text-xs text-stone-500">{maker.city}</p>
                        </div>
                      </div>
                      <StarRating rating={maker.rating} count={maker.review_count} />
                      <p className="text-sm text-stone-600 mt-2">
                        {maker.completed_orders} completed orders
                      </p>
                    </Card>
                  </Link>
                ))
              : DEMO_MAKERS.map((maker) => (
                  <Card key={maker.name} className="p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar name={maker.name} />
                      <div>
                        <p className="font-semibold text-stone-900">{maker.name}</p>
                        <p className="text-xs text-stone-500">{maker.city}</p>
                      </div>
                    </div>
                    <StarRating rating={maker.rating} />
                    <p className="text-sm text-stone-600 mt-2">
                      {maker.orders} completed · {maker.category}
                    </p>
                  </Card>
                ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-20 bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="h-12 w-12 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">Buyer protection built in</h2>
          <p className="text-amber-100 max-w-2xl mx-auto text-lg">
            Your payment is held securely until you review and approve the finished work.
            If something goes wrong, our dispute resolution team is here to help.
          </p>
          <Button href="/auth/register" variant="secondary" size="lg" className="mt-8">
            Get started for free
          </Button>
        </div>
      </section>
    </>
  );
}
