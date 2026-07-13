'use client';
import { useEffect, useState } from 'react';
import { Users, CalendarDays, Flame, Syringe } from 'lucide-react';
import StatCard from '@/components/StatCard';
import LeadsTrendChart from '@/components/charts/LeadsTrendChart';
import LeadsByCityChart from '@/components/charts/LeadsByCityChart';
import LeadsByPlatformChart from '@/components/charts/LeadsByPlatformChart';

export default function LeadAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/leads/stats')
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          setError(data.error || 'Failed to load lead analytics');
          return;
        }
        setStats(data);
      })
      .catch(() => setError('Failed to load lead analytics'));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-1">Lead Analytics</h1>
      <p className="text-sm text-slate-500 mb-6">Combined insight across FAT Contouring and Body Fillers leads.</p>

      {error ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5 text-sm text-rose-500">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Leads" value={stats?.totalLeads ?? '—'} icon={Users} />
            <StatCard label="Today's Leads" value={stats?.todayLeads ?? '—'} accent="green" icon={CalendarDays} />
            <StatCard label="FAT Contouring" value={stats?.totalFat ?? '—'} accent="amber" icon={Flame} />
            <StatCard label="Body Fillers" value={stats?.totalBody ?? '—'} accent="amber" icon={Syringe} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {stats ? (
              <>
                <LeadsTrendChart data={stats.trend} />
                <LeadsByCityChart data={stats.byCity} />
                <LeadsByPlatformChart data={stats.byPlatform} />
              </>
            ) : (
              <div className="col-span-1 lg:col-span-2 h-[240px] flex items-center justify-center text-sm text-slate-400 bg-white rounded-2xl border border-slate-100">
                Loading charts...
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
