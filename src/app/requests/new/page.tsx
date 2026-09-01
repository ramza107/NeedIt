'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import type { Category } from '@/types/database';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

export default function CreateRequestPage() {
  const router = useRouter();
  const supabase = createClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [deadline, setDeadline] = useState('');
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [deliveryType, setDeliveryType] = useState('either');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      if (data) {
        setCategories(data);
        if (data.length) setCategoryId(data[0].id);
      }
    });
  }, [supabase]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadImages(requestId: string, userId: string) {
    const urls: string[] = [];
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const ext = file.name.split('.').pop();
      const path = `${userId}/${requestId}/${i}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('request-images')
        .upload(path, file, { upsert: true });
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('request-images').getPublicUrl(path);
        urls.push(publicUrl);
      }
    }
    if (urls.length) {
      await supabase.from('request_images').insert(
        urls.map((url, i) => ({ request_id: requestId, image_url: url, sort_order: i }))
      );
    }
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

    const { data: request, error: insertError } = await supabase
      .from('requests')
      .insert({
        buyer_id: user.id,
        category_id: categoryId,
        title,
        description,
        budget_min: budgetMin ? parseFloat(budgetMin) : null,
        budget_max: budgetMax ? parseFloat(budgetMax) : null,
        deadline: deadline || null,
        city,
        location,
        delivery_type: deliveryType,
        status: 'open',
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    if (images.length) {
      await uploadImages(request.id, user.id);
    }

    router.push(`/requests/${request.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold text-stone-900">Create a Request</h1>
          <p className="text-stone-600 text-sm mt-1">
            Describe what you want made — makers will compete with offers
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Custom wooden coffee table"
            />

            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              placeholder="Describe what you want in detail — size, materials, color, style..."
            />

            <Select
              label="Category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              options={categories.map((c) => ({ value: c.id, label: `${c.icon || ''} ${c.name}` }))}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Budget min ($)"
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                placeholder="250"
              />
              <Input
                label="Budget max ($)"
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="400"
              />
            </div>

            <Input
              label="Deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Las Vegas"
              />
              <Input
                label="Location details"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="ZIP or area"
              />
            </div>

            <Select
              label="Delivery"
              value={deliveryType}
              onChange={(e) => setDeliveryType(e.target.value)}
              options={[
                { value: 'either', label: 'Either delivery or pickup' },
                { value: 'delivery', label: 'Delivery required' },
                { value: 'pickup', label: 'Pickup only' },
              ]}
            />

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Photos</label>
              <div className="flex flex-wrap gap-3">
                {previews.map((preview, i) => (
                  <div key={i} className="relative h-24 w-24 rounded-xl overflow-hidden border border-stone-200">
                    <img src={preview} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 hover:border-amber-400 transition-colors">
                  <Upload className="h-5 w-5 text-stone-400" />
                  <span className="text-xs text-stone-500 mt-1">Upload</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                </label>
              </div>
              {previews.length === 0 && (
                <p className="text-xs text-stone-500 mt-2 flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" /> Add reference photos to help makers understand your vision
                </p>
              )}
            </div>

            {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Post Request
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
