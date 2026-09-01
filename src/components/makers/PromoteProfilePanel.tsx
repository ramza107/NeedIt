'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Megaphone, Eye, EyeOff } from 'lucide-react';
import type { MakerProfile } from '@/types/database';

const HEADLINE_MAX = 120;

export function PromoteProfilePanel({ makerProfile }: { makerProfile: MakerProfile }) {
  const router = useRouter();
  const [isPromoted, setIsPromoted] = useState(makerProfile.is_promoted ?? false);
  const [headline, setHeadline] = useState(makerProfile.promo_headline || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from('maker_profiles')
      .update({
        is_promoted: isPromoted,
        promo_headline: headline.trim() || null,
        promoted_at: isPromoted ? new Date().toISOString() : null,
      })
      .eq('user_id', makerProfile.user_id);

    if (updateError) {
      if (updateError.message.includes('is_promoted') || updateError.code === '42703') {
        setError('Database not fully configured yet. Ask admin to run setup or try again in a few minutes.');
      } else {
        setError(updateError.message);
      }
      setLoading(false);
      return;
    }

    setSuccess(isPromoted ? 'Your ad is live on the homepage!' : 'Promotion turned off.');
    router.refresh();
    setLoading(false);
  }

  return (
    <Card className="border-accent/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-accent" />
          <div>
            <h2 className="font-bold text-foreground">Advertise on homepage</h2>
            <p className="text-sm text-muted">
              Show a sponsored mini profile to thousands of buyers visiting {isPromoted ? '— currently live' : '— free during beta'}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer rounded border border-border p-4 hover:bg-muted-bg transition-colors">
            <input
              type="checkbox"
              checked={isPromoted}
              onChange={(e) => setIsPromoted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border text-accent focus:ring-accent"
            />
            <div>
              <p className="font-bold text-foreground flex items-center gap-2">
                {isPromoted ? (
                  <><Eye className="h-4 w-4 text-accent" /> Show my profile on homepage</>
                ) : (
                  <><EyeOff className="h-4 w-4 text-muted" /> Hide from homepage</>
                )}
              </p>
              <p className="text-xs text-muted mt-1">
                Your card appears in the &quot;Sponsored makers&quot; section with photo, rating, and a short pitch.
              </p>
            </div>
          </label>

          <Textarea
            label="Ad headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value.slice(0, HEADLINE_MAX))}
            placeholder="e.g. Custom furniture & woodwork — 10+ years experience, fast turnaround"
            rows={3}
            disabled={!isPromoted}
          />
          <p className="text-xs text-muted -mt-2">
            {headline.length}/{HEADLINE_MAX} characters · Leave empty to use your bio
          </p>

          {error && (
            <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
          )}
          {success && (
            <div className="rounded bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-800">{success}</div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" loading={loading} className="font-bold">
              {isPromoted ? 'Update promotion' : 'Save settings'}
            </Button>
            <Button type="button" variant="outline" href="/maker/profile/edit">
              Edit photos &amp; bio
            </Button>
            <Button type="button" variant="link" href={`/profile/${makerProfile.user_id}`}>
              Preview public profile
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
