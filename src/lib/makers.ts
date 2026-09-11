import type { MakerProfile, Profile } from '@/types/database';

type MakerWithProfile = MakerProfile & {
  profile?: Profile | Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'rating' | 'review_count'> | Array<
    Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'rating' | 'review_count'>
  > | null;
};

export function getMakerProfile(
  maker: MakerWithProfile
): Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'rating' | 'review_count'> | null {
  const profile = maker.profile;
  if (Array.isArray(profile)) return profile[0] ?? null;
  return profile ?? null;
}

export function getMakerUserId(maker: MakerWithProfile): string | null {
  if (maker.user_id) return maker.user_id;
  return getMakerProfile(maker)?.id ?? null;
}

export function makerProfilePath(maker: MakerWithProfile): string | null {
  const userId = getMakerUserId(maker);
  return userId ? `/profile/${userId}` : null;
}

export type MakerCardData = {
  id: string;
  business_name: string | null;
  bio: string | null;
  city: string | null;
  rating: number;
  review_count: number;
  completed_orders: number;
  categories: string[];
  portfolio_thumb: string | null;
  href: string | null;
  name: string;
  avatar_url: string | null;
  is_promoted: boolean;
};

export function toMakerCardData(maker: MakerWithProfile): MakerCardData {
  const profile = getMakerProfile(maker);
  return {
    id: maker.id,
    business_name: maker.business_name,
    bio: maker.bio,
    city: maker.city,
    rating: maker.rating,
    review_count: maker.review_count,
    completed_orders: maker.completed_orders,
    categories: maker.categories || [],
    portfolio_thumb: maker.portfolio_urls?.[0] || null,
    href: makerProfilePath(maker),
    name: maker.business_name || profile?.full_name || 'Manufacturer',
    avatar_url: profile?.avatar_url ?? null,
    is_promoted: Boolean(maker.is_promoted),
  };
}
