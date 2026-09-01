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
