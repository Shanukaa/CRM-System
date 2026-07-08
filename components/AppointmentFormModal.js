'use client';
import { useEffect, useState } from 'react';
import Modal from './Modal';
import { APPOINTMENT_STATUSES } from '@/lib/constants';

export default function AppointmentFormModal({ initial, onClose, onSaved }) {
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(true);
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
  }

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
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Client</label>
          <select
            required
            value={form.clientName}
            onChange={(e) => selectClient(e.target.value)}
            disabled={clientsLoading}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm disabled:bg-gray-50"
          >
            <option value="">{clientsLoading ? 'Loading clients...' : 'Select a registered client'}</option>
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
          <label className="block text-xs font-medium text-gray-500 mb-1">Phone Number</label>
          <input
            value={form.phoneNumber}
            readOnly
            placeholder="Auto-filled from client"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Preferred Date</label>
          <input
            type="date"
            required
            value={form.preferredDate}
            onChange={(e) => set('preferredDate', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Preferred Time</label>
          <input
            type="time"
            value={form.preferredTime}
            onChange={(e) => set('preferredTime', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <select value={form.status} onChange={(e) => set('status', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
            {APPOINTMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        {error && <p className="text-xs text-rose-500 md:col-span-2">{error}</p>}
        <div className="flex justify-end gap-2 pt-2 md:col-span-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          <button disabled={saving || clientsLoading} type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
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

function toDateInputValue(v) {
  if (!v) return '';
  const d = new Date(v);
  if (isNaN(d)) return '';
  return d.toISOString().slice(0, 10);
}
