'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatCard from '@/components/StatCard';

export default function DashboardPage() {
  const [clientStats, setClientStats] = useState(null);
  const [apptStats, setApptStats] = useState(null);

  useEffect(() => {
    fetch('/api/stats?type=clients').then((r) => r.json()).then(setClientStats);
    fetch('/api/stats?type=appointments').then((r) => r.json()).then(setApptStats);
  }, []);

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

      <div className="flex gap-4">
        <Link href="/dashboard/clients" className="text-sm text-indigo-600 hover:underline">Go to Client List →</Link>
        <Link href="/dashboard/appointments" className="text-sm text-indigo-600 hover:underline">Go to Appointment List →</Link>
      </div>
    </div>
  );
}
