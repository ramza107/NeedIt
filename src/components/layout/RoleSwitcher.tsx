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
    <div className="border-b border-stone-100 px-3 py-2">
      <p className="px-1 pb-2 text-xs font-medium uppercase tracking-wide text-stone-400">
        Account mode
      </p>
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-stone-100 p-1">
        <button
          type="button"
          onClick={() => switchRole('buyer')}
          disabled={loading !== null}
          className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium transition-colors ${
            profile.role === 'buyer'
              ? 'bg-white text-amber-700 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          {loading === 'buyer' ? '...' : 'Buyer'}
        </button>
        <button
          type="button"
          onClick={() => switchRole('maker')}
          disabled={loading !== null}
          className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium transition-colors ${
            profile.role === 'maker'
              ? 'bg-white text-amber-700 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Hammer className="h-3.5 w-3.5" />
          {loading === 'maker' ? '...' : 'Maker'}
        </button>
      </div>
    </div>
  );
}
