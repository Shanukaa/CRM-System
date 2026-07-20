'use client';
import { useEffect, useState } from 'react';
import { MessageSquare, Phone, UserPlus, CalendarPlus, Sigma } from 'lucide-react';
import StatCard from '@/components/StatCard';
import DailyActivityChart from '@/components/charts/DailyActivityChart';
import AppointmentsVsActivityChart from '@/components/charts/AppointmentsVsActivityChart';

export default function DailyRecordsAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/daily-records/stats')
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          setError(data.error || 'Failed to load analytics');
          return;
        }
        setStats(data);
      })
      .catch(() => setError('Failed to load analytics'));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-1">Daily Records Analytics</h1>
      <p className="text-sm text-slate-500 mb-6">Performance overview across all logged daily records.</p>

      {error ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5 text-sm text-rose-500">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatCard label="Total Messages" value={stats?.totals.messages ?? '—'} icon={MessageSquare} />
            <StatCard label="Total Calls" value={stats?.totals.calls ?? '—'} accent="amber" icon={Phone} />
            <StatCard label="Total Leads" value={stats?.totals.leads ?? '—'} accent="green" icon={UserPlus} />
            <StatCard label="Appointments Entered" value={stats?.totals.appointmentsEntered ?? '—'} accent="amber" icon={CalendarPlus} />
            <StatCard label="Grand Total" value={stats?.totals.total ?? '—'} icon={Sigma} />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {stats ? (
              <>
                <DailyActivityChart data={stats.trend} />
                <AppointmentsVsActivityChart data={stats.trend} />
              </>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-sm text-slate-400 bg-white rounded-2xl border border-slate-100">
                Loading charts...
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
