'use client';
import { useEffect, useState } from 'react';
import { MessageSquare, Phone, UserPlus, CalendarPlus, Sigma } from 'lucide-react';
import StatCard from '@/components/StatCard';
import ActivityImpactCard from '@/components/ActivityImpactCard';
import DailyActivityChart from '@/components/charts/DailyActivityChart';
import AppointmentsEnteredChart from '@/components/charts/AppointmentsEnteredChart';
import AppointmentsVsActivityChart from '@/components/charts/AppointmentsVsActivityChart';
import TotalActivityAppointmentsChart from '@/components/charts/TotalActivityAppointmentsChart';
import ActivityVsAppointmentsScatterChart from '@/components/charts/ActivityVsAppointmentsScatterChart';
import ActivityBreakdownTrendChart from '@/components/charts/ActivityBreakdownTrendChart';

export default function DailyRecordsAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [granularity, setGranularity] = useState('daily'); // 'daily' | 'monthly'

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

  const isMonthly = granularity === 'monthly';
  const trendData = stats ? (isMonthly ? stats.monthlyTrend : stats.trend) : [];
  const scatterData = stats ? (isMonthly ? stats.monthlyScatter : stats.scatter) : [];
  const periodLabel = isMonthly ? 'last 12 months' : 'last 30 days';
  const xAxisInterval = isMonthly ? 0 : 1;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1">
        <h1 className="text-xl font-bold text-slate-800">Daily Records Analytics</h1>
        <div className="inline-flex items-center bg-white border border-slate-200 rounded-xl p-1 self-start">
          <button
            type="button"
            onClick={() => setGranularity('daily')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              !isMonthly ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Daily
          </button>
          <button
            type="button"
            onClick={() => setGranularity('monthly')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              isMonthly ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>
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
                <TotalActivityAppointmentsChart
                  data={trendData}
                  subtitle={`Total activity vs appointments entered — ${periodLabel}`}
                  xAxisInterval={xAxisInterval}
                />
                <ActivityBreakdownTrendChart
                  data={trendData}
                  subtitle={`${isMonthly ? 'Monthly' : 'Daily'} breakdown of every activity type against appointments entered — ${periodLabel}`}
                  xAxisInterval={xAxisInterval}
                />
                <ActivityImpactCard impact={stats.impact} />
                <ActivityVsAppointmentsScatterChart
                  data={scatterData}
                  subtitle={`Each dot is one ${isMonthly ? 'month' : 'day'} — total activity (messages + calls + leads) against appointments booked in that ${isMonthly ? 'month' : 'day'}`}
                />
                <DailyActivityChart
                  data={trendData}
                  subtitle={`Total activity (messages + calls + leads) — ${periodLabel}`}
                  xAxisInterval={xAxisInterval}
                />
                <AppointmentsEnteredChart
                  data={trendData}
                  subtitle={`Appointments entered per ${isMonthly ? 'month' : 'day'} — ${periodLabel}`}
                  xAxisInterval={xAxisInterval}
                />
                <AppointmentsVsActivityChart
                  data={trendData}
                  subtitle={`Appointments entered compared to total activity (messages + calls + leads) — ${periodLabel}`}
                  xAxisInterval={xAxisInterval}
                />
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
