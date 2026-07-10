'use client';
import { useEffect, useRef, useState } from 'react';
import { Settings2 } from 'lucide-react';

export default function TableSettingsMenu({ allColumns, visible, onChange, onReset }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function toggle(key) {
    if (visible.includes(key)) onChange(visible.filter((k) => k !== key));
    else onChange([...visible, key]);
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-xl hover:bg-slate-50">
        <Settings2 size={16} /> Columns
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-20 p-3">
          <p className="text-xs font-semibold text-slate-500 mb-2">Visible columns</p>
          <div className="max-h-56 overflow-auto space-y-1.5">
            {allColumns.map((col) => (
              <label key={col.key} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={visible.includes(col.key)}
                  onChange={() => toggle(col.key)}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-400"
                />
                {col.label}
              </label>
            ))}
          </div>
          <button onClick={onReset} className="mt-3 text-xs text-brand-600 hover:underline">
            Reset to default
          </button>
        </div>
      )}
    </div>
  );
}
