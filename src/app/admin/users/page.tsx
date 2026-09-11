import Link from 'next/link';
import { requireAdmin, createServiceClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatRelativeTime } from '@/lib/utils';
import { ArrowLeft, Ban, Pencil } from 'lucide-react';

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const roleFilter = params.role || '';
  const q = (params.q || '').trim().toLowerCase();

  const supabase = createServiceClient();
  let query = supabase
    .from('profiles')
    .select('*, maker_profiles(id, business_name, phone, contact_person)')
    .order('created_at', { ascending: false })
    .limit(100);

  if (roleFilter === 'buyer' || roleFilter === 'maker' || roleFilter === 'admin') {
    query = query.eq('role', roleFilter);
  }

  const { data: usersRaw } = await query;
  let users = usersRaw || [];

  if (q) {
    users = users.filter((u) => {
      const maker = Array.isArray(u.maker_profiles) ? u.maker_profiles[0] : u.maker_profiles;
      const hay = `${u.full_name || ''} ${u.email || ''} ${maker?.business_name || ''} ${maker?.phone || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        Admin
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users &amp; profiles</h1>
          <p className="text-sm text-muted mt-1">Edit, block, or delete any account</p>
        </div>
        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={params.q || ''}
            placeholder="Search name, email, company..."
            className="rounded-full border border-border bg-card px-4 py-2 text-sm w-64"
          />
          <button type="submit" className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold">
            Search
          </button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { label: 'All', href: '/admin/users' },
          { label: 'Buyers', href: '/admin/users?role=buyer' },
          { label: 'Makers', href: '/admin/users?role=maker' },
          { label: 'Admins', href: '/admin/users?role=admin' },
        ].map((chip) => {
          const active =
            (!roleFilter && chip.label === 'All') ||
            (roleFilter === 'buyer' && chip.label === 'Buyers') ||
            (roleFilter === 'maker' && chip.label === 'Makers') ||
            (roleFilter === 'admin' && chip.label === 'Admins');
          return (
            <Link
              key={chip.href}
              href={chip.href}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${
                active ? 'bg-primary text-primary-foreground' : 'bg-muted-bg text-foreground hover:bg-border'
              }`}
            >
              {chip.label}
            </Link>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {users.map((user) => {
            const maker = Array.isArray(user.maker_profiles) ? user.maker_profiles[0] : user.maker_profiles;
            return (
              <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground truncate">
                      {maker?.business_name || user.full_name}
                    </p>
                    <Badge>{user.role}</Badge>
                    {user.is_blocked && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                        <Ban className="h-3 w-3" />
                        Blocked
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted truncate">
                    {user.email}
                    {maker?.phone ? ` · ${maker.phone}` : ''}
                    {maker?.contact_person ? ` · ${maker.contact_person}` : ''}
                  </p>
                  <p className="text-[11px] text-muted mt-0.5">Joined {formatRelativeTime(user.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted-bg"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                  <Link
                    href={`/profile/${user.id}`}
                    className="inline-flex items-center rounded-full px-3 py-1.5 text-sm text-link hover:underline"
                  >
                    View
                  </Link>
                </div>
              </div>
            );
          })}
          {users.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-muted">No users found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
