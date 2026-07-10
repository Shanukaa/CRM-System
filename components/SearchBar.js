'use client';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  const [local, setLocal] = useState(value);

  useEffect(() => setLocal(value), [value]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (local !== value) onChange(local);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-brand-200"
      />
    </div>
  );
}
