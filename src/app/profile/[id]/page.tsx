import { createClient, getProfile } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Avatar, StarRating } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { MakerPublicProfile } from '@/components/makers/MakerPublicProfile';
import type { Category, Profile } from '@/types/database';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const currentUser = await getProfile();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (!profile) {
    const { data: makerByRowId } = await supabase
      .from('maker_profiles')
      .select('user_id')
      .eq('id', id)
      .single();

    if (makerByRowId?.user_id) {
      redirect(`/profile/${makerByRowId.user_id}`);
    }

    notFound();
  }

  const { data: makerProfile } = await supabase
    .from('maker_profiles')
    .select('*')
    .eq('user_id', id)
    .single();

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, reviewer:profiles!reviews_reviewer_id_fkey(full_name, avatar_url)')
    .eq('reviewed_user_id', id)
    .order('created_at', { ascending: false })
    .limit(20);

  const isMaker = profile.role === 'maker' && makerProfile;

  if (isMaker) {
    let makerCategories: Category[] = [];
    if (makerProfile.categories?.length) {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .in('id', makerProfile.categories);
      makerCategories = data || [];
    }

    return (
      <MakerPublicProfile
        profile={profile}
        makerProfile={makerProfile}
        categories={makerCategories}
        reviews={reviews || []}
        isOwner={currentUser?.id === profile.id}
      />
    );
  }

  // Buyer profile (simple)
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar src={profile.avatar_url} name={profile.full_name} size="lg" />
            <div>
              <h1 className="text-xl font-bold text-foreground">{profile.full_name}</h1>
              <p className="text-muted text-sm">{profile.city || profile.location}</p>
              <div className="mt-2 flex items-center gap-3">
                <StarRating rating={profile.rating} count={profile.review_count} />
                <Badge>Buyer</Badge>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted">{profile.completed_orders} completed orders</p>
        </CardContent>
      </Card>
    </div>
  );
}
