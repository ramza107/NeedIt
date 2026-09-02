'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';

export function SearchBar({ className = '', defaultValue = '' }: { className?: string; defaultValue?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/requests?q=${encodeURIComponent(q)}` : '/requests');
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-1 ${className}`}>
      <div className="flex w-full items-center rounded-xl border border-border bg-muted-bg/60 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all overflow-hidden">
        <Search className="h-4 w-4 text-muted ml-3 shrink-0" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search orders — furniture, jewelry, 3D print..."
          className="flex-1 min-w-0 px-3 py-2.5 text-sm text-foreground bg-transparent border-0 focus:outline-none"
        />
      </div>
    </form>
  );
}
