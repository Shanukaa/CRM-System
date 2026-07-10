'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { useCurrentUser } from '@/lib/useCurrentUser';

export default function DashboardPage() {
  const { user } = useCurrentUser();
  const [clientStats, setClientStats] = useState(null);
  const [apptStats, setApptStats] = useState(null);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);

  function loadStats() {
    fetch('/api/stats?type=clients').then((r) => r.json()).then(setClientStats);
    fetch('/api/stats?type=appointments').then((r) => r.json()).then(setApptStats);
  }

  useEffect(() => { loadStats(); }, []);

  async function runInactivityCheck() {
    setRunning(true);
    setRunResult(null);
    try {
      const res = await fetch('/api/clients/deactivate-stale', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to run check');
      setRunResult(`Checked ${data.checked} clients, deactivated ${data.deactivated}.`);
      loadStats();
    } catch (err) {
      setRunResult(err.message);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-1">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">Overview of your clinic activity.</p>

      <h2 className="text-sm font-semibold text-gray-600 mb-3">Clients</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Clients" value={clientStats?.total ?? '—'} />
        <StatCard
          label="Active Clients"
          value={clientStats?.active ?? '—'}
          accent="green"
          sub={clientStats ? `${clientStats.growth >= 0 ? '+' : ''}${clientStats.growth}% vs last month` : ''}
        />
        <StatCard label="Inactive Clients" value={clientStats?.inactive ?? '—'} accent="red" />
        <StatCard label="Total Contact" value={clientStats?.totalContact ?? '—'} accent="amber" />
      </div>

      <h2 className="text-sm font-semibold text-gray-600 mb-3">Appointments</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Today Appointments" value={apptStats?.today ?? '—'} />
        <StatCard label="Active Status" value={apptStats?.active ?? '—'} accent="amber" />
        <StatCard label="Completed" value={apptStats?.completed ?? '—'} accent="green" />
        <StatCard label="Total Volume" value={apptStats?.total ?? '—'} />
      </div>

      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/clients" className="text-sm text-indigo-600 hover:underline">Go to Client List →</Link>
        <Link href="/dashboard/appointments" className="text-sm text-indigo-600 hover:underline">Go to Appointment List →</Link>
      </div>

      {user?.usertype === 'admin' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm font-semibold text-gray-700 mb-1">Client inactivity check</p>
          <p className="text-xs text-gray-500 mb-3">
            Runs automatically every day — clients with no appointment (or, for brand-new clients, no
            activity since registration) in the last 2 months are marked Inactive. Booking a new
            appointment reactivates a client immediately. Use this button to run the check manually.
          </p>
          <button
            onClick={runInactivityCheck}
            disabled={running}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={running ? 'animate-spin' : ''} /> {running ? 'Running...' : 'Run inactivity check now'}
          </button>
          {runResult && <p className="text-xs text-gray-500 mt-2">{runResult}</p>}
        </div>
      )}
    </div>
  );
}
