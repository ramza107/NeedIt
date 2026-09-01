'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import type { Category } from '@/types/database';

export default function MakerSetupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, [supabase]);

  function toggleCategory(id: string) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const { error: insertError } = await supabase.from('maker_profiles').insert({
      user_id: user.id,
      business_name: businessName,
      bio,
      city,
      location,
      categories: selectedCategories,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    await supabase.from('profiles').update({ role: 'maker', city }).eq('id', user.id);
    router.push('/dashboard');
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold text-stone-900">Set Up Your Maker Profile</h1>
          <p className="text-stone-600 text-sm">Tell buyers about your skills and experience</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Business name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              placeholder="Maria Woodcraft"
            />
            <Textarea
              label="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Describe your skills, experience, and what you create..."
            />
            <div className="grid grid-cols-2 gap-4">
              <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
              <Input label="Area" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Categories</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${
                      selectedCategories.includes(cat.id)
                        ? 'border-amber-600 bg-amber-50 text-amber-800'
                        : 'border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}
            <Button type="submit" className="w-full" loading={loading}>
              Complete Setup
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
