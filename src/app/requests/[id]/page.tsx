import { createClient, getProfile } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Avatar, StarRating } from '@/components/ui/Avatar';
import { MakeOfferForm, SelectOfferButton } from '@/components/offers/OfferActions';
import { formatBudget, formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RequestDetailPage({ params }: Props) {
  const { id } = await params;
  const profile = await getProfile();
  const supabase = await createClient();

  const { data: request, error: requestError } = await supabase
    .from('requests')
    .select(`
      *,
      category:categories(*),
      images:request_images(*),
      buyer:profiles(*),
      offers(*, maker:profiles(*, maker_profile:maker_profiles(*)))
    `)
    .eq('id', id)
    .single();

  if (requestError) {
    console.error('Request fetch error:', requestError.message);
  }

  if (!request) notFound();

  const isOwner = profile?.id === request.buyer_id;
  const isMaker = profile?.role === 'maker';
  const existingOffer = request.offers?.find((o: { maker_id: string }) => o.maker_id === profile?.id);
  const canMakeOffer = isMaker && !isOwner && request.status === 'open' && !existingOffer;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <StatusBadge status={request.status} />
              <span className="text-sm text-muted">{request.category?.icon} {request.category?.name}</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">{request.title}</h1>
            <p className="text-muted mt-1">Posted {formatRelativeTime(request.created_at)} by {request.buyer?.full_name}</p>
          </div>

          {request.images?.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {request.images.map((img: { id: string; image_url: string }) => (
                <div key={img.id} className="aspect-square rounded-xl overflow-hidden bg-muted-bg">
                  <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <Card>
            <CardContent className="pt-6">
              <p className="text-foreground/80 whitespace-pre-wrap leading-relaxed">{request.description}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <p className="text-sm text-muted">Budget</p>
              <p className="font-semibold text-foreground">{formatBudget(request.budget_min, request.budget_max)}</p>
            </Card>
            {request.deadline && (
              <Card className="p-4 text-center">
                <p className="text-sm text-muted">Deadline</p>
                <p className="font-semibold text-foreground">{formatDate(request.deadline)}</p>
              </Card>
            )}
            {request.city && (
              <Card className="p-4 text-center">
                <p className="text-sm text-muted">Location</p>
                <p className="font-semibold text-foreground">{request.city}</p>
              </Card>
            )}
            <Card className="p-4 text-center">
              <p className="text-sm text-muted">Delivery</p>
              <p className="font-semibold text-foreground capitalize">{request.delivery_type}</p>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          {canMakeOffer && profile && (
            <MakeOfferForm requestId={request.id} makerId={profile.id} />
          )}

          {existingOffer && (
            <Card className="p-4">
              <p className="text-sm text-muted">Your offer</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(existingOffer.price)}</p>
              <p className="text-sm text-muted">{existingOffer.estimated_days} days</p>
              <StatusBadge status={existingOffer.status} />
            </Card>
          )}

          {isOwner && request.offers?.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-foreground">
                  Offers ({request.offers.length})
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {request.offers
                  .filter((o: { status: string }) => o.status === 'pending' || o.status === 'accepted')
                  .sort((a: { price: number }, b: { price: number }) => a.price - b.price)
                  .map((offer: {
                    id: string;
                    maker_id: string;
                    price: number;
                    estimated_days: number;
                    message: string;
                    status: string;
                    maker: {
                      full_name: string;
                      avatar_url: string | null;
                      rating: number;
                      maker_profile?: {
                        completed_orders: number;
                        completion_rate: number;
                        on_time_rate: number;
                      } | {
                        completed_orders: number;
                        completion_rate: number;
                        on_time_rate: number;
                      }[] | null;
                    };
                  }) => {
                    const makerProfile = Array.isArray(offer.maker?.maker_profile)
                      ? offer.maker.maker_profile[0]
                      : offer.maker?.maker_profile;
                    return (
                    <div key={offer.id} className="rounded-xl border border-border p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar src={offer.maker?.avatar_url} name={offer.maker?.full_name || 'Maker'} />
                        <div>
                          <p className="font-semibold text-foreground">{offer.maker?.full_name}</p>
                          <StarRating rating={offer.maker?.rating || 0} />
                        </div>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-2xl font-bold text-foreground">{formatCurrency(offer.price)}</span>
                        <span className="text-sm text-muted">{offer.estimated_days} days</span>
                      </div>
                      {makerProfile && (
                        <div className="text-xs text-muted space-y-0.5 mb-3">
                          <p>{makerProfile.completed_orders} completed orders</p>
                          <p>{makerProfile.on_time_rate}% on-time · {makerProfile.completion_rate}% success</p>
                        </div>
                      )}
                      {offer.message && (
                        <p className="text-sm text-muted mb-3">{offer.message}</p>
                      )}
                      {request.status !== 'maker_selected' && offer.status === 'pending' && (
                        <SelectOfferButton
                          offerId={offer.id}
                          requestId={request.id}
                          makerId={offer.maker_id}
                          price={offer.price}
                          estimatedDays={offer.estimated_days}
                          buyerId={request.buyer_id}
                        />
                      )}
                    </div>
                    );
                  })}
              </CardContent>
            </Card>
          )}

          {isOwner && (!request.offers || request.offers.length === 0) && (
            <Card className="p-6 text-center">
              <p className="text-muted">Waiting for offers from makers...</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
