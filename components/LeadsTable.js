'use client';
import { useEffect, useState } from 'react';
import { RefreshCw, Download, Users, CalendarDays } from 'lucide-react';
import SearchBar from './SearchBar';
import Pagination from './Pagination';
import TableSettingsMenu from './TableSettingsMenu';
import StatCard from './StatCard';
import LeadEditModal from './LeadEditModal';
import { exportToExcel } from '@/lib/exportClient';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function LeadsTable({ title, subtitle, tableSlug, columns, storageKey, defaultVisible, editableColumns = [] }) {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(null);
  const [todayCount, setTodayCount] = useState(null);
  const [q, setQ] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(defaultVisible);
  const [editing, setEditing] = useState(null);

  const editableFields = columns.filter((c) => editableColumns.includes(c.key));

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try { setVisible(JSON.parse(saved)); } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateVisible(v) {
    setVisible(v);
    localStorage.setItem(storageKey, JSON.stringify(v));
  }
  function resetVisible() {
    setVisible(defaultVisible);
    localStorage.removeItem(storageKey);
  }

  async function loadRows() {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), q, date: dateFilter });
    const res = await fetch(`/api/leads/${tableSlug}?${params}`);
    if (res.ok) {
      const data = await res.json();
      setRows(data.data);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    }
    setLoading(false);
  }

  async function loadTodayCount() {
    const params = new URLSearchParams({ page: '1', date: todayStr() });
    const res = await fetch(`/api/leads/${tableSlug}?${params}`);
    if (res.ok) {
      const data = await res.json();
      setTodayCount(data.total);
    }
  }

  useEffect(() => { loadTodayCount(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  useEffect(() => { setPage(1); }, [q, dateFilter]);
  useEffect(() => { loadRows(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [page, q, dateFilter]);

  function refreshAll() {
    loadRows();
    loadTodayCount();
  }

  async function handleExport() {
    const params = new URLSearchParams({ all: 'true', q, date: dateFilter });
    const res = await fetch(`/api/leads/${tableSlug}?${params}`);
    const data = await res.json();
    exportToExcel(data.data, columns, tableSlug);
  }

  const visibleCols = columns.filter((c) => visible.includes(c.key));

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-1">{title}</h1>
      <p className="text-sm text-slate-500 mb-6">{subtitle}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Leads" value={total ?? '—'} icon={Users} />
        <StatCard label="Today's Leads" value={todayCount ?? '—'} accent="green" icon={CalendarDays} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
            <SearchBar value={q} onChange={setQ} placeholder="Search leads..." />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              title="Search by date (results sort oldest to newest)"
              className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
            <button
              type="button"
              onClick={() => setDateFilter(todayStr())}
              className="px-3 py-2 text-sm border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              Today
            </button>
            {dateFilter && (
              <button type="button" onClick={() => setDateFilter('')} className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700">
                Clear
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={refreshAll} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50" title="Refresh">
              <RefreshCw size={16} />
            </button>
            <TableSettingsMenu allColumns={columns} visible={visible} onChange={updateVisible} onReset={resetVisible} />
            <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-xl hover:bg-slate-50">
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 bg-slate-50 border-b border-slate-100">
                {visibleCols.map((c) => (
                  <th key={c.key} className="px-4 py-3 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">{c.label}</th>
                ))}
                {editableFields.length > 0 && <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={visibleCols.length + 1 || 1} className="text-center py-8 text-slate-400">Loading...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={visibleCols.length + 1 || 1} className="text-center py-8 text-slate-400">No leads found</td></tr>
              ) : (
                rows.map((row) => (
                  <tr key={row._row} className="border-b border-slate-50 hover:bg-slate-50">
                    {visibleCols.map((c) => (
                      <td key={c.key} className="px-4 py-3 whitespace-nowrap">{row[c.key]}</td>
                    ))}
                    {editableFields.length > 0 && (
                      <td className="px-4 py-3">
                        <button onClick={() => setEditing(row)} className="text-brand-600 text-xs font-medium hover:underline">Edit</button>
                      </td>
                    )}
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

      {editing && (
        <LeadEditModal
          row={editing}
          fields={editableFields}
          tableSlug={tableSlug}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); loadRows(); }}
        />
      )}
    </div>
  );
}
