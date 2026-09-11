import { NextResponse } from 'next/server';
import { createClient, getProfile, createServiceClient } from '@/lib/supabase/server';

async function assertAdmin() {
  const profile = await getProfile();
  if (!profile || profile.role !== 'admin') {
    return null;
  }
  return profile;
}

export async function PATCH(request: Request) {
  const admin = await assertAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { userId, profile: profilePatch, makerProfile: makerPatch } = body as {
    userId?: string;
    profile?: Record<string, unknown>;
    makerProfile?: Record<string, unknown> | null;
  };

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  if (userId === admin.id && profilePatch?.role && profilePatch.role !== 'admin') {
    return NextResponse.json({ error: 'Cannot remove your own admin role' }, { status: 400 });
  }

  const supabase = await createClient();

  if (profilePatch && Object.keys(profilePatch).length > 0) {
    const allowed = [
      'full_name',
      'email',
      'role',
      'city',
      'location',
      'avatar_url',
      'is_blocked',
    ] as const;
    const clean: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in profilePatch) clean[key] = profilePatch[key];
    }
    const { error } = await supabase.from('profiles').update(clean).eq('id', userId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  if (makerPatch === null) {
    await supabase.from('maker_profiles').delete().eq('user_id', userId);
  } else if (makerPatch && Object.keys(makerPatch).length > 0) {
    const allowed = [
      'business_name',
      'bio',
      'city',
      'location',
      'phone',
      'contact_person',
      'categories',
      'portfolio_urls',
      'cover_url',
      'is_promoted',
      'promo_headline',
    ] as const;
    const clean: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in makerPatch) clean[key] = makerPatch[key];
    }

    const { data: existing } = await supabase
      .from('maker_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase.from('maker_profiles').update(clean).eq('user_id', userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      const { error } = await supabase.from('maker_profiles').insert({ user_id: userId, ...clean });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const admin = await assertAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }
  if (userId === admin.id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
  }

  try {
    const service = createServiceClient();
    // Deleting auth user cascades to profiles / related rows when FKs are set
    const { error } = await service.auth.admin.deleteUser(userId);
    if (error) {
      // Fallback: soft-delete / hard-delete profile row
      const supabase = await createClient();
      await supabase.from('maker_profiles').delete().eq('user_id', userId);
      const { error: profileErr } = await supabase.from('profiles').delete().eq('id', userId);
      if (profileErr) {
        return NextResponse.json({ error: error.message || profileErr.message }, { status: 400 });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Delete failed' },
      { status: 500 }
    );
  }
}
