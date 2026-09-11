'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ShoppingBag, Hammer } from 'lucide-react';
import type { Profile, UserRole } from '@/types/database';

export function RoleSwitcher({
  profile,
  onSwitched,
}: {
  profile: Profile;
  onSwitched?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<UserRole | null>(null);

  if (profile.role === 'admin') return null;

  async function switchRole(targetRole: 'buyer' | 'maker') {
    if (profile.role === targetRole || loading) return;

    setLoading(targetRole);
    const supabase = createClient();

    const { error } = await supabase
      .from('profiles')
      .update({ role: targetRole })
      .eq('id', profile.id);

    if (error) {
      setLoading(null);
      return;
    }

    if (targetRole === 'maker') {
      const { data: makerProfile } = await supabase
        .from('maker_profiles')
        .select('id')
        .eq('user_id', profile.id)
        .single();

      router.push(makerProfile ? '/dashboard' : '/maker/setup');
    } else {
      router.push('/dashboard');
    }

    router.refresh();
    onSwitched?.();
    setLoading(null);
  }

  return (
    <div className="border-b border-border px-3 py-2">
      <p className="px-1 pb-1.5 text-[10px] font-bold uppercase tracking-wide text-muted">
        Switch mode
      </p>
      <div className="grid grid-cols-2 gap-1 rounded bg-muted-bg p-0.5">
        <button
          type="button"
          onClick={() => switchRole('buyer')}
          disabled={loading !== null}
          className={`flex items-center justify-center gap-1 rounded px-2 py-1.5 text-xs font-bold transition-all ${
            profile.role === 'buyer'
              ? 'bg-card text-accent shadow-sm border border-border'
              : 'text-muted hover:text-foreground'
          }`}
        >
          <ShoppingBag className="h-3 w-3" />
          {loading === 'buyer' ? '...' : 'Buyer'}
        </button>
        <button
          type="button"
          onClick={() => switchRole('maker')}
          disabled={loading !== null}
          className={`flex items-center justify-center gap-1 rounded px-2 py-1.5 text-xs font-bold transition-all ${
            profile.role === 'maker'
              ? 'bg-card text-accent shadow-sm border border-border'
              : 'text-muted hover:text-foreground'
          }`}
        >
          <Hammer className="h-3 w-3" />
          {loading === 'maker' ? '...' : 'Maker'}
        </button>
      </div>
    </div>
  );
}
