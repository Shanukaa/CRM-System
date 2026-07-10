'use client';
import { useEffect, useState } from 'react';
import Modal from './Modal';
import { APPOINTMENT_STATUSES } from '@/lib/constants';

export default function AppointmentFormModal({ initial, onClose, onSaved }) {
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [phoneSuggestions, setPhoneSuggestions] = useState([]);
  const [form, setForm] = useState({
    clientName: initial?.['client name'] || '',
    treatmentName: initial?.['treatment name'] || '',
    phoneNumber: initial?.['phone number'] || '',
    preferredDate: toDateInputValue(initial?.['preferred date']),
    preferredTime: initial?.['preferred time'] || '',
    status: initial?.status || APPOINTMENT_STATUSES[0],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/clients?all=true')
      .then((r) => r.json())
      .then((data) => setClients(data.data || []))
      .finally(() => setClientsLoading(false));
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function selectClient(name) {
    const client = clients.find((c) => c['client name'] === name);
    setForm((f) => ({
      ...f,
      clientName: name,
      phoneNumber: client ? client.phone || '' : '',
    }));
    setPhoneSuggestions([]);
  }

  function handlePhoneChange(value) {
    setForm((f) => ({ ...f, phoneNumber: value }));

    const digits = value.trim();
    if (digits.length < 3) {
      setPhoneSuggestions([]);
      return;
    }

    // Exact match — auto-fill the client name right away.
    const exact = clients.find((c) => c.phone && c.phone.trim() === digits);
    if (exact) {
      setForm((f) => ({ ...f, phoneNumber: value, clientName: exact['client name'] }));
      setPhoneSuggestions([]);
      return;
    }

    // Otherwise show partial matches to pick from.
    const matches = clients.filter((c) => c.phone && c.phone.includes(digits)).slice(0, 5);
    setPhoneSuggestions(matches);
  }

  function pickSuggestion(client) {
    setForm((f) => ({ ...f, clientName: client['client name'], phoneNumber: client.phone }));
    setPhoneSuggestions([]);
  }

  const phoneMatchedClient = clients.find((c) => c.phone && c.phone.trim() === form.phoneNumber.trim());

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const url = initial ? `/api/appointments/${initial.ID}` : '/api/appointments';
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
    <Modal title={initial ? 'Edit Appointment' : 'Add Appointment'} onClose={onClose} wide>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-xs font-medium text-slate-500 mb-1">Phone Number</label>
          <input
            required
            value={form.phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="Type a registered client's mobile number"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
          {phoneSuggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-card overflow-hidden">
              {phoneSuggestions.map((c) => (
                <button
                  type="button"
                  key={c.ID}
                  onClick={() => pickSuggestion(c)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center justify-between"
                >
                  <span className="text-slate-700">{c['client name']}</span>
                  <span className="text-slate-400 text-xs">{c.phone}</span>
                </button>
              ))}
            </div>
          )}
          {form.phoneNumber.trim().length >= 3 && !phoneMatchedClient && phoneSuggestions.length === 0 && (
            <p className="text-xs text-amber-600 mt-1">No registered client matches this number.</p>
          )}
          {phoneMatchedClient && <p className="text-xs text-emerald-600 mt-1">Matched: {phoneMatchedClient['client name']}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Client</label>
          <select
            required
            value={form.clientName}
            onChange={(e) => selectClient(e.target.value)}
            disabled={clientsLoading}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm disabled:bg-slate-50"
          >
            <option value="">{clientsLoading ? 'Loading clients...' : 'Or select a registered client'}</option>
            {clients.map((c) => (
              <option key={c.ID} value={c['client name']}>{c['client name']}</option>
            ))}
          </select>
          {!clientsLoading && clients.length === 0 && (
            <p className="text-xs text-amber-600 mt-1">No clients found — add a client first.</p>
          )}
        </div>
        <Field label="Treatment Name" value={form.treatmentName} onChange={(v) => set('treatmentName', v)} />
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Preferred Date</label>
          <input
            type="date"
            required
            value={form.preferredDate}
            onChange={(e) => set('preferredDate', e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Preferred Time</label>
          <input
            type="time"
            value={form.preferredTime}
            onChange={(e) => set('preferredTime', e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
          <select value={form.status} onChange={(e) => set('status', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm">
            {APPOINTMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        {error && <p className="text-xs text-rose-500 md:col-span-2">{error}</p>}
        <div className="flex justify-end gap-2 pt-2 md:col-span-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
          <button disabled={saving || clientsLoading} type="submit" className="px-4 py-2 text-sm bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl hover:shadow-lift transition-shadow disabled:opacity-50">
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

function toDateInputValue(v) {
  if (!v) return '';
  const d = new Date(v);
  if (isNaN(d)) return '';
  return d.toISOString().slice(0, 10);
}
