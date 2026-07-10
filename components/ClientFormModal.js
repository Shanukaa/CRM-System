'use client';
import { useState } from 'react';
import Modal from './Modal';
import { GENDERS, PLATFORMS, CLIENT_STATUSES, COUNTRY_CODES } from '@/lib/constants';

function splitPhone(phone) {
  if (!phone) return { countryCode: COUNTRY_CODES[0].code, localNumber: '' };
  const trimmed = phone.trim();
  const match = COUNTRY_CODES.slice().sort((a, b) => b.code.length - a.code.length).find((c) => trimmed.startsWith(c.code));
  if (match) {
    return { countryCode: match.code, localNumber: trimmed.slice(match.code.length).replace(/\D/g, '') };
  }
  return { countryCode: COUNTRY_CODES[0].code, localNumber: trimmed.replace(/\D/g, '') };
}

export default function ClientFormModal({ initial, onClose, onSaved }) {
  const initialPhone = splitPhone(initial?.phone);
  const [form, setForm] = useState({
    clientName: initial?.['client name'] || '',
    countryCode: initialPhone.countryCode,
    localNumber: initialPhone.localNumber,
    gender: initial?.gender || GENDERS[0],
    language: initial?.language || '',
    platform: initial?.platform || PLATFORMS[0],
    status: initial?.status || CLIENT_STATUSES[0],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function setLocalNumber(v) {
    set('localNumber', v.replace(/\D/g, '').slice(0, 12));
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        clientName: form.clientName,
        phone: `${form.countryCode} ${form.localNumber}`.trim(),
        gender: form.gender,
        language: form.language,
        platform: form.platform,
        status: form.status,
      };
      const url = initial ? `/api/clients/${initial.ID}` : '/api/clients';
      const method = initial ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
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
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Phone</label>
          <div className="flex gap-2">
            <select
              value={form.countryCode}
              onChange={(e) => set('countryCode', e.target.value)}
              className="border border-slate-200 rounded-xl px-2 py-2 text-sm w-28 shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>{c.code} {c.country}</option>
              ))}
            </select>
            <input
              required
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="771234567"
              value={form.localNumber}
              onChange={(e) => setLocalNumber(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">Numbers only — no spaces, dashes, or symbols.</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Gender</label>
          <select value={form.gender} onChange={(e) => set('gender', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm">
            {GENDERS.map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>
        <Field label="Language" value={form.language} onChange={(v) => set('language', v)} />
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Registered Platform</label>
          <select value={form.platform} onChange={(e) => set('platform', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm">
            {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
          <select value={form.status} onChange={(e) => set('status', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm">
            {CLIENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
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

function Field({ label, value, onChange, required }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      <input
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
      />
    </div>
  );
}
