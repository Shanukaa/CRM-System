'use client';
import Link from 'next/link';
import { Users, CalendarCheck, ArrowRight } from 'lucide-react';
import { useCurrentUser } from '@/lib/useCurrentUser';

export default function WelcomePage() {
  const { user } = useCurrentUser();

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 tracking-tight mb-1">
        Welcome{user?.username ? `, ${user.username}` : ''}
      </h1>
      <p className="text-sm text-slate-500 mb-8">Pick up where you left off, or jump into one of these.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <Link
          href="/dashboard/clients"
          className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5 transition-all hover:shadow-card hover:-translate-y-0.5"
        >
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-50 text-brand-600 mb-3">
            <Users size={18} />
          </span>
          <p className="text-sm font-semibold text-slate-800">Client List</p>
          <p className="text-xs text-slate-500 mt-1 mb-3">View, add, and manage clients.</p>
          <span className="flex items-center gap-1 text-xs text-brand-600 font-medium">
            Open <ArrowRight size={13} />
          </span>
        </Link>

        <Link
          href="/dashboard/appointments"
          className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5 transition-all hover:shadow-card hover:-translate-y-0.5"
        >
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 mb-3">
            <CalendarCheck size={18} />
          </span>
          <p className="text-sm font-semibold text-slate-800">Appointment List</p>
          <p className="text-xs text-slate-500 mt-1 mb-3">View, add, and manage appointments.</p>
          <span className="flex items-center gap-1 text-xs text-brand-600 font-medium">
            Open <ArrowRight size={13} />
          </span>
        </Link>
      </div>
    </div>
  );
}
