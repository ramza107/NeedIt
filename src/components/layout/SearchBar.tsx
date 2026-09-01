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
      <div className="flex w-full rounded overflow-hidden">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search custom orders — furniture, jewelry, 3D print..."
          className="flex-1 min-w-0 px-4 py-2 text-sm text-foreground bg-card border-0 focus:outline-none focus:ring-2 focus:ring-primary-dark"
        />
        <button
          type="submit"
          className="flex items-center justify-center px-4 bg-primary-dark hover:bg-[#e47911] transition-colors"
          aria-label="Search"
        >
          <Search className="h-5 w-5 text-foreground" />
        </button>
      </div>
    </form>
  );
}
