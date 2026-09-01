'use client';

import Link from 'next/link';
import { OrderActions as OrderActionsClient } from '@/components/orders/OrderActions';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Avatar, StarRating } from '@/components/ui/Avatar';
import { ORDER_STATUS_LABELS, ORDER_STATUS_STEPS } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';
import type { Order, Profile } from '@/types/database';

export function OrderDetailClient({
  order,
  currentUserId,
  isBuyer,
  isMaker,
}: {
  order: Order & {
    request?: { title: string; description: string };
    buyer?: Profile;
    maker?: Profile;
  };
  currentUserId: string;
  isBuyer: boolean;
  isMaker: boolean;
}) {
  const participants: Record<string, Profile> = {};
  if (order.buyer) participants[order.buyer.id] = order.buyer;
  if (order.maker) participants[order.maker.id] = order.maker;

  const currentStepIndex = ORDER_STATUS_STEPS.indexOf(
    order.status as typeof ORDER_STATUS_STEPS[number]
  );

  const reviewedUserId = isBuyer ? order.maker_id : order.buyer_id;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <StatusBadge status={order.status} />
          <h1 className="text-2xl font-bold text-foreground mt-2">{order.request?.title}</h1>
          <p className="text-muted mt-1">{order.request?.description}</p>
        </div>

        {/* Status timeline */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-foreground">Order Progress</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ORDER_STATUS_STEPS.map((step, i) => {
                const isComplete = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                return (
                  <div key={step} className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        isComplete
                          ? 'bg-primary text-white'
                          : 'bg-muted-bg text-muted'
                      }`}
                    >
                      {isComplete ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                    </div>
                    <span
                      className={`text-sm ${
                        isCurrent ? 'font-semibold text-foreground' : isComplete ? 'text-foreground/80' : 'text-muted'
                      }`}
                    >
                      {ORDER_STATUS_LABELS[step]}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {order.completion_photos?.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-foreground">Completed Work</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {order.completion_photos.map((url, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden">
                    <img src={url} alt={`Completion ${i + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="font-semibold text-foreground mb-3">Chat</h2>
          <ChatPanel
            orderId={order.id}
            currentUserId={currentUserId}
            participants={participants}
          />
        </div>
      </div>

      <div className="space-y-6">
        <Card className="p-5">
          <p className="text-sm text-muted">Order Total</p>
          <p className="text-3xl font-bold text-foreground">{formatCurrency(order.price)}</p>
          <div className="mt-3 text-sm text-muted space-y-1">
            <p>Platform fee: {formatCurrency(order.platform_fee)}</p>
            <p>Maker receives: {formatCurrency(order.maker_payout)}</p>
            <p>Payment: <StatusBadge status={order.payment_status} /></p>
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-muted mb-3">{isBuyer ? 'Your Maker' : 'Buyer'}</p>
          {isBuyer && order.maker ? (
            <Link
              href={`/profile/${order.maker_id}`}
              className="flex items-center gap-3 group rounded-lg -m-1 p-1 hover:bg-muted-bg transition-colors"
            >
              <Avatar
                src={order.maker.avatar_url}
                name={order.maker.full_name || ''}
              />
              <div>
                <p className="font-semibold text-link group-hover:text-accent-hover group-hover:underline">
                  {order.maker.full_name}
                </p>
                <StarRating rating={order.maker.rating || 0} />
                <p className="text-xs text-muted mt-0.5">View maker profile</p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar
                src={order.buyer?.avatar_url}
                name={order.buyer?.full_name || ''}
              />
              <div>
                <p className="font-semibold">{order.buyer?.full_name}</p>
                <StarRating rating={order.buyer?.rating || 0} />
              </div>
            </div>
          )}
        </Card>

        <OrderActionsClient
          orderId={order.id}
          status={order.status}
          paymentStatus={order.payment_status}
          isBuyer={isBuyer}
          isMaker={isMaker}
          userId={currentUserId}
          price={order.price}
          reviewedUserId={reviewedUserId}
        />
      </div>
    </div>
  );
}
