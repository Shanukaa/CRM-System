'use client';
import { useEffect, useState } from 'react';
import { RefreshCw, Plus, Download, CalendarClock, Activity, CheckCircle2, TrendingUp } from 'lucide-react';
import StatCard from '@/components/StatCard';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import TableSettingsMenu from '@/components/TableSettingsMenu';
import ImportButton from '@/components/ImportButton';
import AppointmentFormModal from '@/components/AppointmentFormModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { APPOINTMENT_COLUMNS, APPOINTMENT_STATUSES } from '@/lib/constants';
import { exportToExcel } from '@/lib/exportClient';
import { useCurrentUser } from '@/lib/useCurrentUser';

const DEFAULT_VISIBLE = APPOINTMENT_COLUMNS.map((c) => c.key);
const STORAGE_KEY = 'appointmentTableColumns';

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-600',
  confirmed: 'bg-brand-50 text-brand-600',
  completed: 'bg-emerald-50 text-emerald-600',
  cancelled: 'bg-rose-50 text-rose-600',
};

export default function AppointmentsPage() {
  const { user } = useCurrentUser();
  const [stats, setStats] = useState(null);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(DEFAULT_VISIBLE);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setVisible(JSON.parse(saved)); } catch {}
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
    const res = await fetch('/api/stats?type=appointments');
    if (res.ok) setStats(await res.json());
  }

  async function loadRows() {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), q, date: dateFilter, status: statusFilter });
    const res = await fetch(`/api/appointments?${params}`);
    if (res.ok) {
      const data = await res.json();
      setRows(data.data);
      setTotalPages(data.totalPages);
    }
    setLoading(false);
  }

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { setPage(1); }, [q, dateFilter, statusFilter]);
  useEffect(() => { loadRows(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [page, q, dateFilter, statusFilter]);

  async function handleDelete() {
    if (!deleting) return;
    await fetch(`/api/appointments/${deleting.ID}`, { method: 'DELETE' });
    setDeleting(null);
    loadRows();
    loadStats();
  }

  async function handleExport() {
    const params = new URLSearchParams({ all: 'true', q, date: dateFilter, status: statusFilter });
    const res = await fetch(`/api/appointments?${params}`);
    const data = await res.json();
    exportToExcel(data.data, APPOINTMENT_COLUMNS, 'appointments');
  }

  const visibleCols = APPOINTMENT_COLUMNS.filter((c) => visible.includes(c.key));

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-1">Appointment List</h1>
      <p className="text-sm text-slate-500 mb-6">Manage all appointments booked in the system.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Today Appointments" value={stats?.today ?? '—'} icon={CalendarClock} />
        <StatCard label="Active Status" value={stats?.active ?? '—'} accent="amber" icon={Activity} />
        <StatCard label="Completed" value={stats?.completed ?? '—'} accent="green" icon={CheckCircle2} />
        <StatCard label="Total Volume" value={stats?.total ?? '—'} icon={TrendingUp} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
            <SearchBar value={q} onChange={setQ} placeholder="Search appointments..." />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              <option value="">All statuses</option>
              {APPOINTMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => { loadRows(); loadStats(); }} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50" title="Refresh">
              <RefreshCw size={16} />
            </button>
            <TableSettingsMenu allColumns={APPOINTMENT_COLUMNS} visible={visible} onChange={updateVisible} onReset={resetVisible} />
            <ImportButton
              columns={APPOINTMENT_COLUMNS.filter((c) => !['appointment number', 'created by'].includes(c.key))}
              templateName="appointments"
              endpoint="/api/appointments/import"
              mapRow={(row) => {
                const clientName = row['Client Name'];
                const preferredDate = row['Preferred Date'];
                if (!clientName || !preferredDate) return null;
                return {
                  clientName,
                  treatmentName: row['Treatment'] || '',
                  preferredDate,
                  preferredTime: row['Preferred Time'] || '',
                  platform: row['Booked Via'] || '',
                  status: row['Status'] || 'Pending',
                };
              }}
              onImported={() => { loadRows(); loadStats(); }}
            />
            <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-xl hover:bg-slate-50">
              <Download size={16} /> Export
            </button>
            <button onClick={() => { setEditing(null); setFormOpen(true); }} className="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl hover:shadow-lift transition-shadow">
              <Plus size={16} /> Add Appointment
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
                <tr><td colSpan={visibleCols.length + 1} className="text-center py-8 text-slate-400">No appointments found</td></tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.ID} className="border-b border-slate-50 hover:bg-slate-50">
                    {visibleCols.map((c) => (
                      <td key={c.key} className="px-4 py-3 whitespace-nowrap">
                        {c.key === 'status' ? (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[row.status?.toLowerCase()] || 'bg-slate-100 text-slate-500'}`}>
                            {row.status}
                          </span>
                        ) : (
                          row[c.key]
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button onClick={() => { setEditing(row); setFormOpen(true); }} className="text-brand-600 text-xs font-medium hover:underline">Edit</button>
                        {user?.usertype === 'admin' && (
                          <button onClick={() => setDeleting(row)} className="text-rose-500 text-xs font-medium hover:underline">Delete</button>
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
        <AppointmentFormModal initial={editing} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); loadRows(); loadStats(); }} />
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete appointment"
          message={`Are you sure you want to delete appointment ${deleting['appointment number']}? This cannot be undone.`}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
