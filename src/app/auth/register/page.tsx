'use client';

import { Suspense } from 'react';
import RegisterForm from './RegisterForm';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-stone-500">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
