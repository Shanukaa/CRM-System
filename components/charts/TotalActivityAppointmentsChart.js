'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Y-axis ceiling always starts at 100 and grows in steps of 50
// (100 -> 150 -> 200 -> ...) whenever the data exceeds the current ceiling.
function getYAxisMax(data) {
  const BASE = 100;
  const STEP = 50;

  const highest = data.reduce((max, d) => {
    const value = Math.max(Number(d.appointmentsEntered) || 0, Number(d.activityTotal) || 0);
    return value > max ? value : max;
  }, 0);

  let max = BASE;
  while (highest > max) {
    max += STEP;
  }
  return max;
}

export default function TotalActivityAppointmentsChart({ data }) {
  const yAxisMax = getYAxisMax(data || []);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5">
      <p className="text-sm font-semibold text-slate-700">Total Activity & Appointments</p>
      <p className="text-xs text-slate-400 mb-4">Total activity vs appointments entered — last 14 days</p>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={1} />
          <YAxis
            allowDecimals={false}
            domain={[0, yAxisMax]}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} labelStyle={{ color: '#475569', fontWeight: 600 }} />
          <Legend
            verticalAlign="top"
            height={28}
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
          />
          <Line type="monotone" dataKey="activityTotal" name="Total Activity" stroke="#6152f7" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="appointmentsEntered" name="Appointments Entered" stroke="#f43f5e" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
