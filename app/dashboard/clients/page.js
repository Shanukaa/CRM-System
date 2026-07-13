'use client';
import { useEffect, useState } from 'react';
import { RefreshCw, Plus, Download, Users, UserCheck, UserX, Phone, Pencil, Trash2 } from 'lucide-react';
import StatCard from '@/components/StatCard';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import TableSettingsMenu from '@/components/TableSettingsMenu';
import ImportButton from '@/components/ImportButton';
import ClientFormModal from '@/components/ClientFormModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { CLIENT_COLUMNS } from '@/lib/constants';
import { exportToExcel } from '@/lib/exportClient';
import { formatDateTime } from '@/lib/format';
import { useCurrentUser } from '@/lib/useCurrentUser';

const DEFAULT_VISIBLE = CLIENT_COLUMNS.map((c) => c.key);
const STORAGE_KEY = 'clientTableColumns';

export default function ClientsPage() {
  const { user } = useCurrentUser();
  const [stats, setStats] = useState(null);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(DEFAULT_VISIBLE);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setVisible(JSON.parse(saved));
      } catch {}
    }
  }, []);

  function updateVisible(v) {
    setVisible(v);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  }
  function resetVisible() {
    setVisible(DEFAULT_VISIBLE);
    localStorage.removeItem(STORAGE_KEY);
  }

  async function loadStats() {
    const res = await fetch('/api/stats?type=clients');
    if (res.ok) setStats(await res.json());
  }

  async function loadRows() {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), q });
    const res = await fetch(`/api/clients?${params}`);
    if (res.ok) {
      const data = await res.json();
      setRows(data.data);
      setTotalPages(data.totalPages);
    }
    setLoading(false);
  }

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { setPage(1); }, [q]);
  useEffect(() => { loadRows(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [page, q]);

  async function handleDelete() {
    if (!deleting) return;
    await fetch(`/api/clients/${deleting.ID}`, { method: 'DELETE' });
    setDeleting(null);
    loadRows();
    loadStats();
  }

  async function handleExport() {
    const res = await fetch('/api/clients?all=true');
    const data = await res.json();
    exportToExcel(data.data, CLIENT_COLUMNS, 'clients');
  }

  const visibleCols = CLIENT_COLUMNS.filter((c) => visible.includes(c.key));
  const growthLabel = stats ? `${stats.growth >= 0 ? '+' : ''}${stats.growth}% vs last month` : '';

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-1">Client List</h1>
      <p className="text-sm text-slate-500 mb-6">Manage all clients registered in the system.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Clients" value={stats?.total ?? '—'} icon={Users} />
        <StatCard label="Active Clients" value={stats?.active ?? '—'} accent="green" icon={UserCheck} sub={growthLabel} />
        <StatCard label="Inactive Clients" value={stats?.inactive ?? '—'} accent="red" icon={UserX} />
        <StatCard label="Total Contact" value={stats?.totalContact ?? '—'} accent="amber" icon={Phone} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 border-b border-slate-100">
          <SearchBar value={q} onChange={setQ} placeholder="Search clients..." />
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => { loadRows(); loadStats(); }} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50" title="Refresh">
              <RefreshCw size={16} />
            </button>
            <ImportButton
              columns={CLIENT_COLUMNS.filter((c) => c.key !== 'created at')}
              templateName="clients"
              endpoint="/api/clients/import"
              mapRow={(row) => {
                const clientName = row['Client Name'];
                const phone = row['Phone'];
                if (!clientName || !phone) return null;
                return {
                  clientName,
                  phone,
                  gender: row['Gender'] || '',
                  language: row['Language'] || '',
                  platform: row['Registered Platform'] || '',
                  status: row['Status'] || 'Active',
                };
              }}
              onImported={() => { loadRows(); loadStats(); }}
            />
            <TableSettingsMenu allColumns={CLIENT_COLUMNS} visible={visible} onChange={updateVisible} onReset={resetVisible} />
            <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-xl hover:bg-slate-50">
              <Download size={16} /> Export
            </button>
            <button onClick={() => { setEditing(null); setFormOpen(true); }} className="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl hover:shadow-lift transition-shadow">
              <Plus size={16} /> Add Client
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 bg-slate-50 border-b border-slate-100">
                {visibleCols.map((c) => <th key={c.key} className="px-4 py-3 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">{c.label}</th>)}
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={visibleCols.length + 1} className="text-center py-8 text-slate-400">Loading...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={visibleCols.length + 1} className="text-center py-8 text-slate-400">No clients found</td></tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.ID} className="border-b border-slate-50 hover:bg-slate-50">
                    {visibleCols.map((c) => (
                      <td key={c.key} className="px-4 py-3 whitespace-nowrap">
                        {c.key === 'status' ? (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.status?.toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                            {row.status}
                          </span>
                        ) : c.key === 'created at' ? (
                          formatDateTime(row['created at'])
                        ) : (
                          row[c.key]
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button onClick={() => { setEditing(row); setFormOpen(true); }} title="Edit" className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50">
                          <Pencil size={15} />
                        </button>
                        {user?.usertype === 'admin' && (
                          <button onClick={() => setDeleting(row)} title="Delete" className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      {formOpen && (
        <ClientFormModal initial={editing} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); loadRows(); loadStats(); }} />
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete client"
          message={`Are you sure you want to delete ${deleting['client name']}? This cannot be undone.`}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
