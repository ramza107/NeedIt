import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin, createServiceClient } from '@/lib/supabase/server';
import { AdminUserEditor } from '@/components/admin/AdminUserEditor';
import { ArrowLeft } from 'lucide-react';

export default async function AdminUserEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single();
  if (!profile) notFound();

  const { data: makerProfile } = await supabase
    .from('maker_profiles')
    .select('*')
    .eq('user_id', id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/admin/users" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        All users
      </Link>
      <h1 className="text-2xl font-bold text-foreground mb-1">Edit profile</h1>
      <p className="text-sm text-muted mb-6">{profile.email}</p>
      <AdminUserEditor profile={profile} makerProfile={makerProfile} />
    </div>
  );
}
