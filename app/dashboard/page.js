'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, Users, UserCheck, UserX, Phone, CalendarClock, Activity, CheckCircle2, TrendingUp, ArrowRight } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { useCurrentUser } from '@/lib/useCurrentUser';
import AppointmentsTrendChart from '@/components/charts/AppointmentsTrendChart';
import AppointmentStatusChart from '@/components/charts/AppointmentStatusChart';
import ClientsGrowthChart from '@/components/charts/ClientsGrowthChart';
import ClientsByPlatformChart from '@/components/charts/ClientsByPlatformChart';

export default function DashboardPage() {
  const { user } = useCurrentUser();
  const [clientStats, setClientStats] = useState(null);
  const [apptStats, setApptStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);

  function loadStats() {
    fetch('/api/stats?type=clients').then((r) => r.json()).then(setClientStats);
    fetch('/api/stats?type=appointments').then((r) => r.json()).then(setApptStats);
    fetch('/api/stats?type=charts').then((r) => r.json()).then(setChartData);
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Overview and analytics for your clinic.</p>
        </div>
        <button
          onClick={loadStats}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Clients</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Clients" value={clientStats?.total ?? '—'} icon={Users} />
        <StatCard
          label="Active Clients"
          value={clientStats?.active ?? '—'}
          accent="green"
          icon={UserCheck}
          sub={clientStats ? `${clientStats.growth >= 0 ? '+' : ''}${clientStats.growth}% vs last month` : ''}
        />
        <StatCard label="Inactive Clients" value={clientStats?.inactive ?? '—'} accent="red" icon={UserX} />
        <StatCard label="Total Contact" value={clientStats?.totalContact ?? '—'} accent="amber" icon={Phone} />
      </div>

      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Appointments</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Today Appointments" value={apptStats?.today ?? '—'} icon={CalendarClock} />
        <StatCard label="Active Status" value={apptStats?.active ?? '—'} accent="amber" icon={Activity} />
        <StatCard label="Completed" value={apptStats?.completed ?? '—'} accent="green" icon={CheckCircle2} />
        <StatCard label="Total Volume" value={apptStats?.total ?? '—'} icon={TrendingUp} />
      </div>

      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {chartData ? (
          <>
            <AppointmentsTrendChart data={chartData.apptTrend} />
            <AppointmentStatusChart data={chartData.apptByStatus} />
            <ClientsGrowthChart data={chartData.clientsByMonth} />
            <ClientsByPlatformChart data={chartData.clientsByPlatform} />
          </>
        ) : (
          <div className="col-span-2 h-[240px] flex items-center justify-center text-sm text-slate-400 bg-white rounded-2xl border border-slate-100">
            Loading charts...
          </div>
        )}
      </div>

      <div className="flex items-center gap-5 mb-6">
        <Link href="/dashboard/clients" className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium">
          Go to Client List <ArrowRight size={14} />
        </Link>
        <Link href="/dashboard/appointments" className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium">
          Go to Appointment List <ArrowRight size={14} />
        </Link>
      </div>

      {user?.usertype === 'admin' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5">
          <p className="text-sm font-semibold text-slate-700 mb-1">Client inactivity check</p>
          <p className="text-xs text-slate-500 mb-3 max-w-2xl">
            Runs automatically every day — clients with no appointment (or, for brand-new clients, no
            activity since registration) in the last 2 months are marked Inactive. Booking a new
            appointment reactivates a client immediately. Use this button to run the check manually.
          </p>
          <button
            onClick={runInactivityCheck}
            disabled={running}
            className="flex items-center gap-2 px-3.5 py-2 text-sm border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={running ? 'animate-spin' : ''} /> {running ? 'Running...' : 'Run inactivity check now'}
          </button>
          {runResult && <p className="text-xs text-slate-500 mt-2">{runResult}</p>}
        </div>
      )}
    </div>
  );
}
