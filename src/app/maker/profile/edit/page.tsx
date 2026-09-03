import { createClient, getProfile } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { EditMakerProfileForm } from '@/components/makers/EditMakerProfileForm';

export default async function EditMakerProfilePage() {
  const profile = await getProfile();
  if (!profile) redirect('/auth/login');
  if (profile.role !== 'maker') redirect('/dashboard');

  const supabase = await createClient();

  const { data: makerProfile } = await supabase
    .from('maker_profiles')
    .select('*')
    .eq('user_id', profile.id)
    .single();

  if (!makerProfile) redirect('/maker/setup');

  const { data: categories } = await supabase.from('categories').select('*').order('name');

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Edit maker profile</h1>
        <p className="text-sm text-muted mt-1">
          Add photos, portfolio, and business details — this is your public storefront
        </p>
      </div>
      <EditMakerProfileForm
        profile={profile}
        makerProfile={makerProfile}
        categories={categories || []}
      />
    </div>
  );
}
