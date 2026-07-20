'use client';
import { useEffect, useState } from 'react';
import { RefreshCw, Plus, Download, MessageSquare, Phone, UserPlus, CalendarPlus, Sigma, Pencil, Trash2 } from 'lucide-react';
import StatCard from '@/components/StatCard';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import DailyRecordFormModal from '@/components/DailyRecordFormModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { DAILY_RECORD_COLUMNS } from '@/lib/constants';
import { exportToExcel } from '@/lib/exportClient';
import { useCurrentUser } from '@/lib/useCurrentUser';

export default function DailyRecordsPage() {
  const { user } = useCurrentUser();
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  async function loadRows() {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), q, date: dateFilter });
    const res = await fetch(`/api/daily-records?${params}`);
    if (res.ok) {
      const data = await res.json();
      setRows(data.data);
      setTotalPages(data.totalPages);
    }
    setLoading(false);
  }

  useEffect(() => { setPage(1); }, [q, dateFilter]);
  useEffect(() => { loadRows(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [page, q, dateFilter]);

  const totals = rows.reduce(
    (acc, r) => ({
      messages: acc.messages + (Number(r.messages) || 0),
      calls: acc.calls + (Number(r.calls) || 0),
      leads: acc.leads + (Number(r.leads) || 0),
      appointmentsEntered: acc.appointmentsEntered + (Number(r.appointmentsEntered) || 0),
      total: acc.total + (Number(r.total) || 0),
    }),
    { messages: 0, calls: 0, leads: 0, appointmentsEntered: 0, total: 0 }
  );

  async function handleDelete() {
    if (!deleting) return;
    await fetch(`/api/daily-records/${deleting.ID}`, { method: 'DELETE' });
    setDeleting(null);
    loadRows();
  }

  async function handleExport() {
    const params = new URLSearchParams({ all: 'true', q, date: dateFilter });
    const res = await fetch(`/api/daily-records?${params}`);
    const data = await res.json();
    exportToExcel(data.data, DAILY_RECORD_COLUMNS, 'daily-records');
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-1">Daily Records</h1>
      <p className="text-sm text-slate-500 mb-6">Manually logged messages, calls, and leads per day (this page).</p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard label="Messages (this page)" value={totals.messages} icon={MessageSquare} />
        <StatCard label="Calls (this page)" value={totals.calls} accent="amber" icon={Phone} />
        <StatCard label="Leads (this page)" value={totals.leads} accent="green" icon={UserPlus} />
        <StatCard label="Appointments Entered (this page)" value={totals.appointmentsEntered} accent="amber" icon={CalendarPlus} />
        <StatCard label="Total (this page)" value={totals.total} icon={Sigma} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
            <SearchBar value={q} onChange={setQ} placeholder="Search records..." />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
            {dateFilter && (
              <button type="button" onClick={() => setDateFilter('')} className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700">
                Clear
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={loadRows} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50" title="Refresh">
              <RefreshCw size={16} />
            </button>
            <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-xl hover:bg-slate-50">
              <Download size={16} /> Export
            </button>
            <button onClick={() => { setEditing(null); setFormOpen(true); }} className="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl hover:shadow-lift transition-shadow">
              <Plus size={16} /> Add Record
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 bg-slate-50 border-b border-slate-100">
                {DAILY_RECORD_COLUMNS.map((c) => (
                  <th key={c.key} className="px-4 py-3 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">{c.label}</th>
                ))}
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={DAILY_RECORD_COLUMNS.length + 1} className="text-center py-8 text-slate-400">Loading...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={DAILY_RECORD_COLUMNS.length + 1} className="text-center py-8 text-slate-400">No records found</td></tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.ID} className="border-b border-slate-50 hover:bg-slate-50">
                    {DAILY_RECORD_COLUMNS.map((c) => (
                      <td key={c.key} className="px-4 py-3 whitespace-nowrap">{row[c.key]}</td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
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
        <DailyRecordFormModal initial={editing} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); loadRows(); }} />
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete record"
          message={`Are you sure you want to delete the record for ${deleting.date}? This cannot be undone.`}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
