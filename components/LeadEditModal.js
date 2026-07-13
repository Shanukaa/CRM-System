'use client';
import { useState } from 'react';
import Modal from './Modal';

export default function LeadEditModal({ row, fields, tableSlug, checkboxFields = [], onClose, onSaved }) {
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((f) => [f.key, row[f.key] || ''])));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      for (const f of fields) {
        if (values[f.key] === (row[f.key] || '')) continue;
        const res = await fetch(`/api/leads/${tableSlug}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ row: row._row, field: f.key, value: values[f.key] }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Failed to save ${f.label}`);
        }
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`Edit Lead — ${row.full_name || ''}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        {fields.map((f) => {
          const isCheckbox = checkboxFields.includes(f.key);
          return (
            <div key={f.key}>
              {isCheckbox ? (
                <label className="flex items-center gap-2.5 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={String(values[f.key]).toUpperCase() === 'TRUE'}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.checked ? 'TRUE' : 'FALSE' }))}
                    className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
                  />
                  {f.label}
                </label>
              ) : (
                <>
                  <label className="block text-xs font-medium text-slate-500 mb-1">{f.label}</label>
                  <input
                    value={values[f.key]}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                  />
                </>
              )}
            </div>
          );
        })}
        {error && <p className="text-xs text-rose-500">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
          <button disabled={saving} type="submit" className="px-4 py-2 text-sm bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl hover:shadow-lift transition-shadow disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
