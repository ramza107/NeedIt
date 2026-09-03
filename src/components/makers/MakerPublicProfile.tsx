import Link from 'next/link';
import { Avatar, StarRating } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import type { Category, MakerProfile, Profile, Review } from '@/types/database';
import {
  MapPin,
  Hammer,
  CheckCircle2,
  Clock,
  Shield,
  Megaphone,
  Pencil,
  MessageSquare,
  Phone,
  User,
} from 'lucide-react';

interface MakerPublicProfileProps {
  profile: Profile;
  makerProfile: MakerProfile;
  categories: Category[];
  reviews: (Review & { reviewer?: Pick<Profile, 'full_name' | 'avatar_url'> })[];
  isOwner: boolean;
}

export function MakerPublicProfile({
  profile,
  makerProfile,
  categories,
  reviews,
  isOwner,
}: MakerPublicProfileProps) {
  const displayName = makerProfile.business_name || profile.full_name;
  const coverUrl = makerProfile.cover_url || makerProfile.portfolio_urls?.[0];

  return (
    <div className="pb-10">
      {/* Storefront header */}
      <div className="bg-card border-b border-border">
        <div className="relative h-40 sm:h-56 md:h-64 bg-gradient-to-br from-primary via-primary-hover to-primary-dark overflow-hidden">
          {coverUrl && (
            <img src={coverUrl} alt="" className="h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

        <div className="mx-auto max-w-[1100px] px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-4 -mt-14 sm:-mt-16 relative pb-6">
            <Avatar
              src={profile.avatar_url}
              name={displayName}
              size="xl"
              className="border-4 border-card shadow-lg h-28 w-28 sm:h-32 sm:w-32 text-2xl"
            />
            <div className="flex-1 sm:pt-16 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{displayName}</h1>
                    <Badge variant="info" className="gap-1">
                      <Hammer className="h-3 w-3" />
                      Maker
                    </Badge>
                    {makerProfile.is_promoted && (
                      <Badge variant="warning" className="gap-1">
                        <Megaphone className="h-3 w-3" />
                        Sponsored
                      </Badge>
                    )}
                  </div>
                  {(makerProfile.city || profile.city) && (
                    <p className="text-muted flex items-center gap-1.5 text-sm">
                      <MapPin className="h-4 w-4 shrink-0" />
                      {makerProfile.city || profile.city}
                      {makerProfile.location ? ` · ${makerProfile.location}` : ''}
                    </p>
                  )}
                  {(makerProfile.contact_person || makerProfile.phone) && (
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                      {makerProfile.contact_person && (
                        <p className="flex items-center gap-1.5">
                          <User className="h-4 w-4 shrink-0" />
                          {makerProfile.contact_person}
                        </p>
                      )}
                      {makerProfile.phone && (
                        <a
                          href={`tel:${makerProfile.phone.replace(/\s+/g, '')}`}
                          className="flex items-center gap-1.5 text-link hover:text-primary-hover"
                        >
                          <Phone className="h-4 w-4 shrink-0" />
                          {makerProfile.phone}
                        </a>
                      )}
                    </div>
                  )}
                  <div className="mt-2">
                    <StarRating rating={profile.rating} count={profile.review_count} />
                  </div>
                  {makerProfile.promo_headline && (
                    <p className="mt-3 text-sm font-medium text-foreground/90 max-w-2xl">
                      {makerProfile.promo_headline}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {isOwner ? (
                    <Button href="/maker/profile/edit" className="gap-2 font-bold">
                      <Pencil className="h-4 w-4" />
                      Edit profile
                    </Button>
                  ) : (
                    <Button href="/requests" variant="accent" className="font-bold">
                      Browse open orders
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1100px] px-4 sm:px-6 py-6 grid lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          {makerProfile.bio && (
            <Card>
              <CardHeader>
                <h2 className="font-bold text-foreground">About {displayName}</h2>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/85 leading-relaxed whitespace-pre-wrap">{makerProfile.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Portfolio */}
          <Card>
            <CardHeader>
              <h2 className="font-bold text-foreground">Portfolio &amp; work samples</h2>
              <p className="text-sm text-muted mt-0.5">Photos of completed projects and craftsmanship</p>
            </CardHeader>
            <CardContent>
              {makerProfile.portfolio_urls?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {makerProfile.portfolio_urls.map((url, i) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-square rounded overflow-hidden border border-border hover:shadow-md transition-shadow group"
                    >
                      <img
                        src={url}
                        alt={`Work sample ${i + 1}`}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 rounded bg-muted-bg border border-dashed border-border">
                  <Hammer className="h-10 w-10 text-muted/40 mx-auto mb-2" />
                  <p className="text-muted text-sm">No portfolio photos yet</p>
                  {isOwner && (
                    <Button href="/maker/profile/edit" variant="outline" size="sm" className="mt-3">
                      Add photos
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <h2 className="font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-accent" />
                Customer reviews ({profile.review_count})
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar
                        src={review.reviewer?.avatar_url}
                        name={review.reviewer?.full_name || 'Customer'}
                        size="sm"
                      />
                      <div>
                        <p className="font-medium text-sm text-foreground">{review.reviewer?.full_name}</p>
                        <p className="text-xs text-muted">{formatRelativeTime(review.created_at)}</p>
                      </div>
                      <span className="ml-auto text-primary-dark text-sm">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-foreground/80 pl-10">{review.comment}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted text-sm py-4 text-center">No reviews yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-bold text-foreground mb-3">Maker stats</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Completed orders
                </dt>
                <dd className="font-bold">{makerProfile.completed_orders}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  On-time rate
                </dt>
                <dd className="font-bold">{makerProfile.on_time_rate}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Success rate</dt>
                <dd className="font-bold">{makerProfile.completion_rate}%</dd>
              </div>
              {makerProfile.avg_price != null && makerProfile.avg_price > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">Avg. project</dt>
                  <dd className="font-bold">{formatCurrency(makerProfile.avg_price)}</dd>
                </div>
              )}
            </dl>
          </Card>

          {(makerProfile.contact_person || makerProfile.phone) && (
            <Card className="p-4">
              <h3 className="font-bold text-foreground mb-3">Contact</h3>
              <dl className="space-y-2.5 text-sm">
                {makerProfile.contact_person && (
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-muted mt-0.5 shrink-0" />
                    <div>
                      <dt className="text-muted text-xs">Contact person</dt>
                      <dd className="font-medium text-foreground">{makerProfile.contact_person}</dd>
                    </div>
                  </div>
                )}
                {makerProfile.phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-muted mt-0.5 shrink-0" />
                    <div>
                      <dt className="text-muted text-xs">Phone</dt>
                      <dd>
                        <a
                          href={`tel:${makerProfile.phone.replace(/\s+/g, '')}`}
                          className="font-medium text-link hover:text-primary-hover"
                        >
                          {makerProfile.phone}
                        </a>
                      </dd>
                    </div>
                  </div>
                )}
              </dl>
            </Card>
          )}

          {categories.length > 0 && (
            <Card className="p-4">
              <h3 className="font-bold text-foreground mb-3">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/makers?category=${cat.slug}`}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-muted-bg px-3 py-1 text-xs font-medium hover:border-accent hover:bg-accent-light transition-colors"
                  >
                    <span>{cat.icon}</span>
                    {cat.name}
                  </Link>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-4 bg-accent-light/30 border-accent/20">
            <div className="flex gap-3">
              <Shield className="h-8 w-8 text-accent shrink-0" />
              <div>
                <p className="font-bold text-sm text-foreground">Protected orders</p>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Payments on {displayName}&apos;s orders are held securely until buyers approve the finished work.
                </p>
              </div>
            </div>
          </Card>

          {!isOwner && (
            <Button href="/auth/register?role=buyer" className="w-full font-bold">
              Post a custom request
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
