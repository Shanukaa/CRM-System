'use client';
import { useEffect, useState } from 'react';
import { RefreshCw, Plus, Eye, EyeOff } from 'lucide-react';
import StatCard from '@/components/StatCard';
import UserFormModal from '@/components/UserFormModal';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function UsersPage() {
  const [perf, setPerf] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState({});
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  async function loadPerf() {
    const res = await fetch('/api/stats?type=users');
    if (res.ok) {
      const data = await res.json();
      setPerf(data.perf || []);
    }
  }

  async function loadUsers() {
    setLoading(true);
    const res = await fetch('/api/users');
    if (res.ok) {
      const data = await res.json();
      setUsers(data.data);
    }
    setLoading(false);
  }

  useEffect(() => { loadPerf(); loadUsers(); }, []);

  async function handleDelete() {
    if (!deleting) return;
    await fetch(`/api/users/${deleting.ID}`, { method: 'DELETE' });
    setDeleting(null);
    loadUsers();
    loadPerf();
  }

  const totalAppointmentsUpdated = perf.reduce((sum, p) => sum + (p.appointmentsCreated || 0), 0);

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-1">Users</h1>
      <p className="text-sm text-gray-500 mb-6">Manage admin and employee accounts.</p>

      <h2 className="text-sm font-semibold text-gray-600 mb-3">User Performance</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Users" value={users.length || '—'} />
        <StatCard label="Appointments Logged" value={totalAppointmentsUpdated} accent="green" />
        {perf.slice(0, 2).map((p) => (
          <StatCard key={p.username} label={`${p.username}'s Appointments`} value={p.appointmentsCreated} accent="amber" />
        ))}
      </div>

      {perf.length > 2 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
          <p className="text-xs font-semibold text-gray-500 mb-3">Appointments logged per user</p>
          <div className="space-y-2">
            {perf.map((p) => (
              <div key={p.username} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{p.username} <span className="text-gray-400 capitalize">({p.usertype})</span></span>
                <span className="font-medium text-gray-800">{p.appointmentsCreated}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between gap-3 p-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">All Users</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => { loadUsers(); loadPerf(); }} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50" title="Refresh">
              <RefreshCw size={16} />
            </button>
            <button onClick={() => { setEditing(null); setFormOpen(true); }} className="flex items-center gap-2 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <Plus size={16} /> Add User
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Username</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">NIC</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Password</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">User Type</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No users found</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.ID} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">{u.username}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{u.nic}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{revealed[u.ID] ? u.password : '••••••••'}</span>
                        <button onClick={() => setRevealed((r) => ({ ...r, [u.ID]: !r[u.ID] }))} className="text-gray-400 hover:text-gray-600">
                          {revealed[u.ID] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${u.usertype === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                        {u.usertype}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button onClick={() => { setEditing(u); setFormOpen(true); }} className="text-indigo-600 text-xs font-medium hover:underline">Edit</button>
                        <button onClick={() => setDeleting(u)} className="text-rose-500 text-xs font-medium hover:underline">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {formOpen && (
        <UserFormModal initial={editing} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); loadUsers(); loadPerf(); }} />
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete user"
          message={`Are you sure you want to delete ${deleting.username}? This cannot be undone.`}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
