'use client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AppointmentsTrendChart({ data }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5">
      <p className="text-sm font-semibold text-slate-700">Appointment Volume</p>
      <p className="text-xs text-slate-400 mb-4">Last 14 days, by preferred date</p>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="apptTrendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6152f7" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#6152f7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={1} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={28} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
            labelStyle={{ color: '#475569', fontWeight: 600 }}
          />
          <Area type="monotone" dataKey="count" name="Appointments" stroke="#6152f7" strokeWidth={2} fill="url(#apptTrendFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
