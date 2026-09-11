'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Upload, X } from 'lucide-react';

export function MakeOfferForm({
  requestId,
  makerId,
}: {
  requestId: string;
  makerId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [price, setPrice] = useState('');
  const [days, setDays] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: insertError } = await supabase.from('offers').insert({
      request_id: requestId,
      maker_id: makerId,
      price: parseFloat(price),
      estimated_days: parseInt(days),
      message,
      status: 'pending',
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    await supabase
      .from('requests')
      .update({ status: 'offers_received' })
      .eq('id', requestId);

    router.refresh();
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-foreground">Make an Offer</h3>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Your price ($)"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="1"
              step="0.01"
            />
            <Input
              label="Estimated days"
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              required
              min="1"
            />
          </div>
          <Textarea
            label="Message to buyer"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Describe materials, delivery, your experience..."
          />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <Button type="submit" loading={loading} className="w-full">
            Submit Offer
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function SelectOfferButton({
  offerId,
  requestId,
  makerId,
  price,
  estimatedDays,
  buyerId,
}: {
  offerId: string;
  requestId: string;
  makerId: string;
  price: number;
  estimatedDays: number;
  buyerId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleSelect() {
    setLoading(true);

    const { platformFee, makerPayout } = await import('@/lib/utils').then((m) =>
      m.calculateFees(price)
    );

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        request_id: requestId,
        buyer_id: buyerId,
        maker_id: makerId,
        offer_id: offerId,
        price,
        platform_fee: platformFee,
        maker_payout: makerPayout,
        estimated_days: estimatedDays,
        status: 'payment_pending',
        payment_status: 'pending',
      })
      .select()
      .single();

    if (error) {
      setLoading(false);
      return;
    }

    await supabase.from('offers').update({ status: 'accepted' }).eq('id', offerId);
    await supabase.from('offers').update({ status: 'rejected' }).eq('request_id', requestId).neq('id', offerId);
    await supabase.from('requests').update({ status: 'maker_selected' }).eq('id', requestId);

    await supabase.from('messages').insert({
      order_id: order.id,
      sender_id: buyerId,
      content: `Order created! Please proceed with payment to secure this order.`,
      is_system: true,
    });

    router.push(`/orders/${order.id}`);
  }

  return (
    <Button onClick={handleSelect} loading={loading} size="sm">
      Choose This Maker
    </Button>
  );
}
