'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { STATUS_COLORS } from './chartColors';

export default function AppointmentStatusChart({ data }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5">
      <p className="text-sm font-semibold text-slate-700">Appointment Status</p>
      <p className="text-xs text-slate-400 mb-4">Breakdown of all appointments</p>
      {total === 0 ? (
        <div className="h-[240px] flex items-center justify-center text-sm text-slate-400">No appointments yet</div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="status" innerRadius={55} outerRadius={85} paddingAngle={3}>
              {data.map((entry) => (
                <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#94a3b8'} stroke="none" />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
            <Legend
              verticalAlign="bottom"
              height={32}
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
