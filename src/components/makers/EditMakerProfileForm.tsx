'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { uploadPublicFile, fileExt } from '@/lib/upload';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { ImageUpload, MultiImageUpload } from '@/components/makers/ImageUpload';
import type { Category, MakerProfile, Profile } from '@/types/database';

interface Props {
  profile: Profile;
  makerProfile: MakerProfile;
  categories: Category[];
}

export function EditMakerProfileForm({ profile, makerProfile, categories }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [businessName, setBusinessName] = useState(makerProfile.business_name || '');
  const [bio, setBio] = useState(makerProfile.bio || '');
  const [city, setCity] = useState(makerProfile.city || profile.city || '');
  const [location, setLocation] = useState(makerProfile.location || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(makerProfile.categories || []);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [coverUrl, setCoverUrl] = useState(makerProfile.cover_url || '');
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>(makerProfile.portfolio_urls || []);
  const [pendingPortfolio, setPendingPortfolio] = useState<File[]>([]);
  const [pendingPortfolioPreviews, setPendingPortfolioPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function toggleCategory(id: string) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function handleAvatarFile(file: File) {
    try {
      setError('');
      await uploadAvatar(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo');
    }
  }

  async function handleCoverFile(file: File) {
    try {
      setError('');
      await uploadCover(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload cover');
    }
  }

  async function uploadAvatar(file: File) {
    const path = `${profile.id}/avatar.${fileExt(file.name)}`;
    const { url, error: err } = await uploadPublicFile('avatars', path, file);
    if (err) throw new Error(err);
    if (url) setAvatarUrl(url);
  }

  async function uploadCover(file: File) {
    const path = `${profile.id}/cover.${fileExt(file.name)}`;
    const { url, error: err } = await uploadPublicFile('portfolio', path, file);
    if (err) throw new Error(err);
    if (url) setCoverUrl(url);
  }

  function addPortfolioFile(file: File) {
    setPendingPortfolio((prev) => [...prev, file]);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPendingPortfolioPreviews((prev) => [...prev, e.target?.result as string]);
    };
    reader.readAsDataURL(file);
  }

  function removeExistingPortfolio(index: number) {
    setPortfolioUrls((prev) => prev.filter((_, i) => i !== index));
  }

  function removePendingPortfolio(index: number) {
    setPendingPortfolio((prev) => prev.filter((_, i) => i !== index));
    setPendingPortfolioPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const newPortfolioUrls = [...portfolioUrls];
      for (let i = 0; i < pendingPortfolio.length; i++) {
        const file = pendingPortfolio[i];
        const path = `${profile.id}/portfolio/${Date.now()}-${i}.${fileExt(file.name)}`;
        const { url, error: err } = await uploadPublicFile('portfolio', path, file);
        if (err) throw new Error(err);
        if (url) newPortfolioUrls.push(url);
      }

      if (avatarUrl !== profile.avatar_url) {
        const { error: profileErr } = await supabase
          .from('profiles')
          .update({ avatar_url: avatarUrl, city, full_name: profile.full_name })
          .eq('id', profile.id);
        if (profileErr) throw new Error(profileErr.message);
      } else {
        await supabase.from('profiles').update({ city }).eq('id', profile.id);
      }

      const { error: makerErr } = await supabase
        .from('maker_profiles')
        .update({
          business_name: businessName,
          bio,
          city,
          location,
          categories: selectedCategories,
          cover_url: coverUrl || null,
          portfolio_urls: newPortfolioUrls,
        })
        .eq('user_id', profile.id);

      if (makerErr) throw new Error(makerErr.message);

      setSuccess('Profile saved successfully!');
      router.refresh();
      setTimeout(() => router.push(`/profile/${profile.id}`), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  }

  const allPortfolioPreviews = [...portfolioUrls, ...pendingPortfolioPreviews];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="font-bold text-foreground">Photos</h2>
          <p className="text-sm text-muted">Your storefront — buyers see these on your public profile</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <ImageUpload
            label="Profile photo"
            hint="Square photo of you or your logo"
            aspect="avatar"
            previewUrl={avatarUrl}
            onFileSelect={handleAvatarFile}
            onClear={() => setAvatarUrl(null)}
          />
          <ImageUpload
            label="Cover banner"
            hint="Wide banner at the top of your profile (recommended 1200×400)"
            aspect="banner"
            previewUrl={coverUrl}
            onFileSelect={handleCoverFile}
            onClear={() => setCoverUrl('')}
          />
          <MultiImageUpload
            label="Portfolio gallery"
            hint="Show your best work — up to 12 photos"
            previews={allPortfolioPreviews}
            onAdd={addPortfolioFile}
            onRemove={(index) => {
              if (index < portfolioUrls.length) {
                removeExistingPortfolio(index);
              } else {
                removePendingPortfolio(index - portfolioUrls.length);
              }
            }}
            max={12}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-bold text-foreground">Business info</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Business name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
            placeholder="Maria Woodcraft"
          />
          <Textarea
            label="About you"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={5}
            placeholder="Your experience, materials, style, turnaround times..."
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
            <Input label="Area / region" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">Categories you work in</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${
                    selectedCategories.includes(cat.id)
                      ? 'border-accent bg-accent-light text-accent font-medium'
                      : 'border-border text-muted hover:border-muted'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="rounded bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">{success}</div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={loading} className="font-bold">
          Save profile
        </Button>
        <Button type="button" variant="outline" href={`/profile/${profile.id}`}>
          Cancel
        </Button>
        <Button type="button" variant="link" href={`/profile/${profile.id}`}>
          Preview profile
        </Button>
      </div>
    </form>
  );
}
