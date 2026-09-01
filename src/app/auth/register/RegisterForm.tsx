'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { APP_NAME } from '@/lib/constants';
import { Zap } from 'lucide-react';

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
    <div className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12 overflow-hidden mesh-bg">
      <div className="absolute inset-0 grid-pattern opacity-30" aria-hidden />
      <Card glass className="relative w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl btn-gradient shadow-lg shadow-primary/30">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">Join {APP_NAME}</h1>
              <p className="text-sm text-muted">Create your free account</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center py-4">
              <p className="text-foreground/80 mb-4">Check your email to confirm your account.</p>
              <Button href="/auth/login">Go to Login</Button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                    role === 'buyer'
                      ? 'border-primary bg-primary-light shadow-sm'
                      : 'border-border hover:border-primary/30 hover:bg-muted-bg/50'
                  }`}
                >
                  <p className="font-semibold text-foreground">Buyer</p>
                  <p className="text-xs text-muted mt-1">I need something made</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('maker')}
                  className={`rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                    role === 'maker'
                      ? 'border-primary bg-primary-light shadow-sm'
                      : 'border-border hover:border-primary/30 hover:bg-muted-bg/50'
                  }`}
                >
                  <p className="font-semibold text-foreground">Maker</p>
                  <p className="text-xs text-muted mt-1">I create custom items</p>
                </button>
              </div>

              <Input
                label="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="John Smith"
              />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="At least 6 characters"
              />

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" loading={loading}>
                Create Account
              </Button>

              <p className="text-center text-sm text-muted">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary font-semibold hover:text-primary-hover transition-colors">
                  Log in
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
