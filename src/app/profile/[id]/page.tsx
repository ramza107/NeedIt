import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Avatar, StarRating } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { formatRelativeTime } from '@/lib/utils';
import type { MakerProfile, Profile, Review } from '@/types/database';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (!profile) notFound();

  const { data: makerProfile } = await supabase
    .from('maker_profiles')
    .select('*, categories_data:categories(*)')
    .eq('user_id', id)
    .single();

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, reviewer:profiles!reviews_reviewer_id_fkey(full_name, avatar_url)')
    .eq('reviewed_user_id', id)
    .order('created_at', { ascending: false })
    .limit(10);

  const isMaker = profile.role === 'maker' && makerProfile;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-amber-500 to-orange-500" />
        <CardContent className="relative pt-0 pb-8">
          <div className="flex flex-col sm:flex-row items-start gap-4 -mt-12">
            <Avatar
              src={profile.avatar_url}
              name={profile.full_name}
              size="xl"
              className="border-4 border-white"
            />
            <div className="flex-1 pt-14 sm:pt-12">
              <h1 className="text-2xl font-bold text-stone-900">
                {isMaker ? makerProfile.business_name || profile.full_name : profile.full_name}
              </h1>
              <p className="text-stone-500">{profile.city || profile.location}</p>
              <div className="mt-2 flex items-center gap-4">
                <StarRating rating={profile.rating} count={profile.review_count} />
                <Badge>{profile.role === 'maker' ? 'Maker' : 'Buyer'}</Badge>
              </div>
            </div>
          </div>

          {isMaker && makerProfile.bio && (
            <p className="mt-6 text-stone-700 leading-relaxed">{makerProfile.bio}</p>
          )}

          {isMaker && (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl bg-stone-50 p-4 text-center">
                <p className="text-2xl font-bold text-stone-900">{makerProfile.completed_orders}</p>
                <p className="text-xs text-stone-500">Completed</p>
              </div>
              <div className="rounded-xl bg-stone-50 p-4 text-center">
                <p className="text-2xl font-bold text-stone-900">{makerProfile.on_time_rate}%</p>
                <p className="text-xs text-stone-500">On-time</p>
              </div>
              <div className="rounded-xl bg-stone-50 p-4 text-center">
                <p className="text-2xl font-bold text-stone-900">{makerProfile.completion_rate}%</p>
                <p className="text-xs text-stone-500">Success</p>
              </div>
              <div className="rounded-xl bg-stone-50 p-4 text-center">
                <p className="text-2xl font-bold text-stone-900">{makerProfile.dispute_rate}%</p>
                <p className="text-xs text-stone-500">Disputes</p>
              </div>
            </div>
          )}

          {!isMaker && (
            <div className="mt-6">
              <p className="text-stone-600">{profile.completed_orders} completed orders</p>
            </div>
          )}

          {isMaker && makerProfile.portfolio_urls?.length > 0 && (
            <div className="mt-8">
              <h2 className="font-semibold text-stone-900 mb-4">Portfolio</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {makerProfile.portfolio_urls.map((url: string, i: number) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden">
                    <img src={url} alt={`Work ${i + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {reviews && reviews.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <h2 className="font-semibold text-stone-900">Reviews</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviews.map((review: Review & { reviewer: Profile }) => (
              <div key={review.id} className="border-b border-stone-100 pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar src={review.reviewer?.avatar_url} name={review.reviewer?.full_name || ''} size="sm" />
                  <span className="font-medium text-stone-900">{review.reviewer?.full_name}</span>
                  <span className="text-amber-500">{'★'.repeat(review.rating)}</span>
                  <span className="text-xs text-stone-400">{formatRelativeTime(review.created_at)}</span>
                </div>
                {review.comment && <p className="text-sm text-stone-600">{review.comment}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
