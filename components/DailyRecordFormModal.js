'use client';
import { useState } from 'react';
import Modal from './Modal';

export default function DailyRecordFormModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    date: initial?.date ? toDateInputValue(initial.date) : todayStr(),
    messages: initial?.messages ?? '',
    calls: initial?.calls ?? '',
    leads: initial?.leads ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const num = (v) => (v === '' ? 0 : Math.max(0, parseInt(v, 10) || 0));
  const total = num(form.messages) + num(form.calls) + num(form.leads);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const url = initial ? `/api/daily-records/${initial.ID}` : '/api/daily-records';
      const method = initial ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: form.date, messages: num(form.messages), calls: num(form.calls), leads: num(form.leads) }),
      });
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
    <Modal title={initial ? 'Edit Daily Record' : 'Add Daily Record'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
        <NumberField label="Messages" value={form.messages} onChange={(v) => set('messages', v)} />
        <NumberField label="Calls" value={form.calls} onChange={(v) => set('calls', v)} />
        <NumberField label="Leads" value={form.leads} onChange={(v) => set('leads', v)} />
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Total</label>
          <div className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm text-slate-600 font-medium">
            {total} <span className="text-xs font-normal text-slate-400">(Messages + Calls + Leads, calculated automatically)</span>
          </div>
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

function NumberField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      <input
        type="number"
        min="0"
        inputMode="numeric"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
      />
    </div>
  );
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function toDateInputValue(v) {
  const d = new Date(v);
  if (isNaN(d)) return todayStr();
  return d.toISOString().slice(0, 10);
}
