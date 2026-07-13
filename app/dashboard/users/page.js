'use client';
import { useEffect, useState } from 'react';
import { RefreshCw, Plus, Eye, EyeOff, UserCog, CalendarCheck2, Pencil, Trash2, Radio } from 'lucide-react';
import StatCard from '@/components/StatCard';
import UserFormModal from '@/components/UserFormModal';
import ConfirmDialog from '@/components/ConfirmDialog';

const ONLINE_WINDOW_MS = 5 * 60 * 1000; // consider "online" if active within the last 5 minutes

function isOnline(u) {
  const raw = u['last active'];
  if (!raw) return false;
  const d = new Date(raw);
  if (isNaN(d)) return false;
  return Date.now() - d.getTime() < ONLINE_WINDOW_MS;
}

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

  useEffect(() => {
    loadPerf();
    loadUsers();
    // Refresh periodically so "Online now" stays reasonably current while this page is open.
    const interval = setInterval(loadUsers, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function handleDelete() {
    if (!deleting) return;
    await fetch(`/api/users/${deleting.ID}`, { method: 'DELETE' });
    setDeleting(null);
    loadUsers();
    loadPerf();
  }

  const totalAppointmentsUpdated = perf.reduce((sum, p) => sum + (p.appointmentsCreated || 0), 0);
  const onlineCount = users.filter(isOnline).length;

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-1">Users</h1>
      <p className="text-sm text-slate-500 mb-6">Manage admin and employee accounts.</p>

      <h2 className="text-sm font-semibold text-slate-600 mb-3">User Performance</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Users" value={users.length || '—'} icon={UserCog} />
        <StatCard label="Online Now" value={onlineCount} accent="green" icon={Radio} />
        <StatCard label="Appointments Logged" value={totalAppointmentsUpdated} accent="amber" icon={CalendarCheck2} />
        {perf.slice(0, 1).map((p) => (
          <StatCard key={p.username} label={`${p.username}'s Appointments`} value={p.appointmentsCreated} accent="amber" />
        ))}
      </div>

      {perf.length > 1 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-4 mb-6">
          <p className="text-xs font-semibold text-slate-500 mb-3">Appointments logged per user</p>
          <div className="space-y-2">
            {perf.map((p) => (
              <div key={p.username} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{p.username} <span className="text-slate-400 capitalize">({p.usertype})</span></span>
                <span className="font-medium text-slate-800">{p.appointmentsCreated}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft">
        <div className="flex items-center justify-between gap-3 p-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">All Users</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => { loadUsers(); loadPerf(); }} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50" title="Refresh">
              <RefreshCw size={16} />
            </button>
            <button onClick={() => { setEditing(null); setFormOpen(true); }} className="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl hover:shadow-lift transition-shadow">
              <Plus size={16} /> Add User
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Username</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">NIC</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Password</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">User Type</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Last Login</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">No users found</td></tr>
              ) : (
                users.map((u) => {
                  const online = isOnline(u);
                  return (
                    <tr key={u.ID} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-3 whitespace-nowrap">{u.username}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{u.nic}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">{revealed[u.ID] ? u.password : '••••••••'}</span>
                          <button onClick={() => setRevealed((r) => ({ ...r, [u.ID]: !r[u.ID] }))} className="text-slate-400 hover:text-slate-600">
                            {revealed[u.ID] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${u.usertype === 'admin' ? 'bg-brand-50 text-brand-600' : 'bg-slate-100 text-slate-500'}`}>
                          {u.usertype}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${online ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {online ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500">{u['last login'] || 'Never'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button onClick={() => { setEditing(u); setFormOpen(true); }} title="Edit" className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => setDeleting(u)} title="Delete" className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
