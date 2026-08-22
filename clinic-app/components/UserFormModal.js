'use client';
import { useState } from 'react';
import Modal from './Modal';
import { USER_TYPES } from '@/lib/constants';

export default function UserFormModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    username: initial?.username || '',
    nic: initial?.nic || '',
    password: '',
    usertype: initial?.usertype || USER_TYPES[1],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const url = initial ? `/api/users/${initial.ID}` : '/api/users';
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
    <Modal title={initial ? 'Edit User' : 'Add User'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Username" value={form.username} onChange={(v) => set('username', v)} required />
        <Field label="NIC" value={form.nic} onChange={(v) => set('nic', v)} />
        <Field
          label={initial ? 'Password (leave blank to keep unchanged)' : 'Password'}
          value={form.password}
          onChange={(v) => set('password', v)}
          required={!initial}
          type="password"
        />
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">User Type</label>
          <select value={form.usertype} onChange={(e) => set('usertype', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm capitalize">
            {USER_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
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

function Field({ label, value, onChange, required, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
    </div>
  );
}
