'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AppointmentsVsActivityChart({ data }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5">
      <p className="text-sm font-semibold text-slate-700">Appointments Entered vs Activity</p>
      <p className="text-xs text-slate-400 mb-4">Appointments entered compared to messages, calls, and leads — last 14 days</p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={1} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={28} />
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} labelStyle={{ color: '#475569', fontWeight: 600 }} cursor={{ fill: '#f8fafc' }} />
          <Legend
            verticalAlign="top"
            height={28}
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
          />
          <Bar dataKey="appointmentsEntered" name="Appointments Entered" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="messages" name="Messages" fill="#6152f7" radius={[4, 4, 0, 0]} />
          <Bar dataKey="calls" name="Calls" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          <Bar dataKey="leads" name="Leads" fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
