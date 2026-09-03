'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Textarea, Select } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { DISPUTE_REASONS } from '@/lib/constants';
import { Upload } from 'lucide-react';

export function OrderActions({
  orderId,
  status,
  paymentStatus,
  isBuyer,
  isMaker,
  userId,
  price,
  reviewedUserId,
}: {
  orderId: string;
  status: string;
  paymentStatus: string;
  isBuyer: boolean;
  isMaker: boolean;
  userId: string;
  price: number;
  reviewedUserId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [disputeReason, setDisputeReason] = useState('not_matching');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [completionPhotos, setCompletionPhotos] = useState<File[]>([]);

  async function handlePay() {
    setLoading(true);
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
    }
  }

  async function updateStatus(newStatus: string, extra: Record<string, unknown> = {}) {
    setLoading(true);
    await supabase.from('orders').update({ status: newStatus, ...extra }).eq('id', orderId);
    await supabase.from('messages').insert({
      order_id: orderId,
      sender_id: userId,
      content: `Order status updated to: ${newStatus.replace(/_/g, ' ')}`,
      is_system: true,
    });
    router.refresh();
    setLoading(false);
  }

  async function handleStartProduction() {
    await updateStatus('in_production');
  }

  async function handleUploadCompletion() {
    setLoading(true);
    const urls: string[] = [];
    for (let i = 0; i < completionPhotos.length; i++) {
      const file = completionPhotos[i];
      const path = `${orderId}/${i}-${file.name}`;
      const { error } = await supabase.storage.from('completions').upload(path, file);
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('completions').getPublicUrl(path);
        urls.push(publicUrl);
      }
    }
    await supabase.from('orders').update({
      status: 'ready_for_review',
      completion_photos: urls,
    }).eq('id', orderId);
    await supabase.from('messages').insert({
      order_id: orderId,
      sender_id: userId,
      content: 'Work is ready for your review! Please check the completion photos.',
      is_system: true,
    });
    router.refresh();
    setLoading(false);
  }

  async function handleAccept() {
    setLoading(true);
    await supabase.from('orders').update({
      status: 'completed',
      payment_status: 'released',
    }).eq('id', orderId);

    await fetch('/api/stripe/release', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });

    setShowReview(true);
    setLoading(false);
  }

  async function handleSubmitReview(reviewedUserId: string) {
    setLoading(true);
    await supabase.from('reviews').insert({
      order_id: orderId,
      reviewer_id: userId,
      reviewed_user_id: reviewedUserId,
      rating,
      comment: reviewComment,
    });
    await supabase.from('orders').update({ status: 'paid_to_maker' }).eq('id', orderId);
    router.refresh();
    setShowReview(false);
    setLoading(false);
  }

  async function handleDispute() {
    setLoading(true);
    await supabase.from('disputes').insert({
      order_id: orderId,
      opened_by: userId,
      reason: disputeReason,
      description: disputeDesc,
    });
    await updateStatus('dispute');
    setShowDispute(false);
  }

  return (
    <div className="space-y-4">
      {isBuyer && status === 'payment_pending' && (
        <Button onClick={handlePay} loading={loading} className="w-full" size="lg">
          Pay {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)} Securely
        </Button>
      )}

      {isMaker && status === 'payment_secured' && (
        <Button onClick={handleStartProduction} loading={loading} className="w-full">
          Start Production
        </Button>
      )}

      {isMaker && status === 'in_production' && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Upload Completed Work</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-border p-4 hover:border-primary/40">
              <Upload className="h-5 w-5 text-muted" />
              <span className="text-sm text-muted">Add completion photos</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => setCompletionPhotos(Array.from(e.target.files || []))}
              />
            </label>
            {completionPhotos.length > 0 && (
              <p className="text-sm text-muted">{completionPhotos.length} photo(s) selected</p>
            )}
            <Button onClick={handleUploadCompletion} loading={loading} className="w-full">
              Mark as Ready for Review
            </Button>
          </CardContent>
        </Card>
      )}

      {isBuyer && status === 'ready_for_review' && (
        <div className="space-y-3">
          <Button onClick={handleAccept} loading={loading} className="w-full" size="lg">
            Accept & Release Payment
          </Button>
          <Button onClick={() => setShowDispute(true)} variant="outline" className="w-full">
            Open Dispute
          </Button>
        </div>
      )}

      {showReview && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Leave a Review</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl ${star <= rating ? 'text-accent' : 'text-border'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <Textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share your experience..."
              rows={3}
            />
            <Button
              onClick={() => handleSubmitReview(reviewedUserId)}
              loading={loading}
              className="w-full"
            >
              Submit Review
            </Button>
          </CardContent>
        </Card>
      )}

      {showDispute && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Open Dispute</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select
              label="Reason"
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              options={DISPUTE_REASONS.map((r) => ({ value: r.value, label: r.label }))}
            />
            <Textarea
              label="Description"
              value={disputeDesc}
              onChange={(e) => setDisputeDesc(e.target.value)}
              required
              rows={3}
            />
            <div className="flex gap-2">
              <Button onClick={handleDispute} loading={loading} variant="danger" className="flex-1">
                Submit Dispute
              </Button>
              <Button onClick={() => setShowDispute(false)} variant="ghost" className="flex-1">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
