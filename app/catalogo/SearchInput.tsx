'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useTransition } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchInput({ initialValue }: { initialValue: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialValue);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    if (value === currentSearch) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set('search', value);
      } else {
        params.delete('search');
      }
      params.set('page', '1'); // Reset to page 1 on new search

      startTransition(() => {
        router.push(`/catalogo?${params.toString()}`);
      });
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [value, router, searchParams]);

  return (
    <div className="relative group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors w-5 h-5" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full h-12 pl-12 pr-12 bg-surface-container border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-t-lg font-body-md transition-all outline-none"
        placeholder="Busca ponchos, polleras, chaquetas..."
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary cursor-pointer flex items-center justify-center"
          aria-label="Limpiar búsqueda"
        >
          <X className="w-5 h-5" />
        </button>
      )}
      {isPending && (
        <div className="absolute right-12 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-primary tracking-wider animate-pulse">
          Buscando...
        </div>
      )}
    </div>
  );
}
