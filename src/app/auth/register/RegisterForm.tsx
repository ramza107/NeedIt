'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { APP_NAME } from '@/lib/constants';
import { BrandLogo } from '@/components/layout/BrandLogo';

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') === 'maker' ? 'maker' : 'buyer';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'maker'>(defaultRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        role,
      });

      if (role === 'maker') {
        router.push('/maker/setup');
      } else {
        router.push('/dashboard');
      }
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-10 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-3">
            <BrandLogo size="md" href="/" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create account</h1>
          <p className="text-sm text-muted mt-1">Join {APP_NAME} — it&apos;s free</p>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center py-4">
              <p className="text-muted mb-4">Check your email to confirm your account.</p>
              <Button href="/auth/login" className="font-bold">Sign in</Button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`rounded border-2 p-3 text-left text-sm ${
                    role === 'buyer'
                      ? 'border-accent bg-accent-light'
                      : 'border-border hover:border-muted'
                  }`}
                >
                  <p className="font-bold">Buyer</p>
                  <p className="text-xs text-muted mt-0.5">I need something made</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('maker')}
                  className={`rounded border-2 p-3 text-left text-sm ${
                    role === 'maker'
                      ? 'border-accent bg-accent-light'
                      : 'border-border hover:border-muted'
                  }`}
                >
                  <p className="font-bold">Maker</p>
                  <p className="text-xs text-muted mt-0.5">I make custom items</p>
                </button>
              </div>

              <Input label="Your name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />

              {error && (
                <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
              )}

              <Button type="submit" className="w-full font-bold" loading={loading}>
                Create your {APP_NAME} account
              </Button>

              <p className="text-center text-sm text-muted pt-2 border-t border-border">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-link hover:underline font-medium">Sign in</Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
