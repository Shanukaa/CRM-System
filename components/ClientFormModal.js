'use client';
import { useState } from 'react';
import Modal from './Modal';
import { GENDERS, CLIENT_STATUSES } from '@/lib/constants';

export default function ClientFormModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    clientName: initial?.['client name'] || '',
    phone: initial?.phone || '',
    gender: initial?.gender || GENDERS[0],
    language: initial?.language || '',
    status: initial?.status || CLIENT_STATUSES[0],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const url = initial ? `/api/clients/${initial.ID}` : '/api/clients';
      const method = initial ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={initial ? 'Edit Client' : 'Add Client'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Client Name" value={form.clientName} onChange={(v) => set('clientName', v)} required />
        <Field label="Phone" value={form.phone} onChange={(v) => set('phone', v)} required />
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Gender</label>
          <select value={form.gender} onChange={(e) => set('gender', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
            {GENDERS.map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>
        <Field label="Language" value={form.language} onChange={(v) => set('language', v)} />
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <select value={form.status} onChange={(e) => set('status', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
            {CLIENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        {error && <p className="text-xs text-rose-500">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          <button disabled={saving} type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, value, onChange, required }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
    </div>
  );
}
