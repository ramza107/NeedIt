'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import type { MakerProfile, Profile } from '@/types/database';
import { Ban, CheckCircle2, Trash2 } from 'lucide-react';

export function AdminUserEditor({
  profile,
  makerProfile,
}: {
  profile: Profile;
  makerProfile: MakerProfile | null;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [email, setEmail] = useState(profile.email || '');
  const [role, setRole] = useState(profile.role);
  const [city, setCity] = useState(profile.city || '');
  const [location, setLocation] = useState(profile.location || '');
  const [blocked, setBlocked] = useState(Boolean(profile.is_blocked));

  const [businessName, setBusinessName] = useState(makerProfile?.business_name || '');
  const [contactPerson, setContactPerson] = useState(makerProfile?.contact_person || '');
  const [phone, setPhone] = useState(makerProfile?.phone || '');
  const [bio, setBio] = useState(makerProfile?.bio || '');
  const [makerCity, setMakerCity] = useState(makerProfile?.city || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function save() {
    setLoading(true);
    setError('');
    setSuccess('');

    const body: Record<string, unknown> = {
      userId: profile.id,
      profile: {
        full_name: fullName,
        email,
        role,
        city,
        location,
        is_blocked: blocked,
      },
    };

    if (role === 'maker' || makerProfile) {
      body.makerProfile = {
        business_name: businessName,
        contact_person: contactPerson,
        phone,
        bio,
        city: makerCity || city,
      };
    }

    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Save failed');
      return;
    }
    setSuccess('Saved');
    router.refresh();
  }

  async function toggleBlock() {
    setLoading(true);
    setError('');
    const next = !blocked;
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: profile.id,
        profile: { is_blocked: next },
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Failed');
      return;
    }
    setBlocked(next);
    setSuccess(next ? 'User blocked' : 'User unblocked');
    router.refresh();
  }

  async function removeUser() {
    if (!confirm(`Delete ${profile.full_name || profile.email}? This cannot be undone.`)) return;
    setLoading(true);
    setError('');
    const res = await fetch(`/api/admin/users?userId=${profile.id}`, { method: 'DELETE' });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Delete failed');
      return;
    }
    router.push('/admin/users');
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-foreground">Account</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value as Profile['role'])}
            options={[
              { value: 'buyer', label: 'Buyer' },
              { value: 'maker', label: 'Maker' },
              { value: 'admin', label: 'Admin' },
            ]}
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
            <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <p className="text-sm text-muted">
            Status:{' '}
            <span className={blocked ? 'text-red-600 font-semibold' : 'text-green-700 font-semibold'}>
              {blocked ? 'Blocked' : 'Active'}
            </span>
          </p>
        </CardContent>
      </Card>

      {(role === 'maker' || makerProfile) && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-foreground">Company profile</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Business name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Contact person"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
              />
              <Input
                label="Phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <Input label="Company city" value={makerCity} onChange={(e) => setMakerCity(e.target.value)} />
            <Textarea label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{success}</div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button onClick={save} loading={loading} className="font-semibold">
          Save changes
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={toggleBlock}
          disabled={loading}
          className="gap-2"
        >
          {blocked ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
          {blocked ? 'Unblock' : 'Block'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={removeUser}
          disabled={loading}
          className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete user
        </Button>
        <Link href={`/profile/${profile.id}`} className="text-sm text-link self-center ml-auto">
          View public profile
        </Link>
      </div>
    </div>
  );
}
