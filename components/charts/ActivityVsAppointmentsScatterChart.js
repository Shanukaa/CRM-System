'use client';
import {
  ScatterChart,
  Scatter,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ZAxis,
} from 'recharts';

// Simple least-squares regression so we can draw a trend line through the
// activity-vs-appointments scatter — makes the relationship easy to read.
function linearRegression(points) {
  const n = points.length;
  if (n < 2) return null;
  const meanX = points.reduce((a, p) => a + p.activityTotal, 0) / n;
  const meanY = points.reduce((a, p) => a + p.appointmentsEntered, 0) / n;
  let num = 0;
  let den = 0;
  points.forEach((p) => {
    num += (p.activityTotal - meanX) * (p.appointmentsEntered - meanY);
    den += (p.activityTotal - meanX) ** 2;
  });
  if (den === 0) return null;
  const slope = num / den;
  const intercept = meanY - slope * meanX;
  return { slope, intercept };
}

export default function ActivityVsAppointmentsScatterChart({
  data,
  subtitle = 'Each dot is one day — total activity (messages + calls + leads) against appointments booked that day',
}) {
  const points = data || [];
  const reg = linearRegression(points);

  const maxX = points.reduce((m, p) => Math.max(m, p.activityTotal), 0);
  const trendLine = reg
    ? [
        { activityTotal: 0, trend: Math.max(reg.intercept, 0) },
        { activityTotal: maxX, trend: reg.intercept + reg.slope * maxX },
      ]
    : [];

  // Merge the two series onto one x-domain so ComposedChart can plot both.
  const chartData = [...points.map((p) => ({ ...p })), ...trendLine];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5">
      <p className="text-sm font-semibold text-slate-700">Activity vs Appointments</p>
      <p className="text-xs text-slate-400 mb-4">{subtitle}</p>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            type="number"
            dataKey="activityTotal"
            name="Total Activity"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            label={{ value: 'Total Activity', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#94a3b8' }}
          />
          <YAxis
            type="number"
            dataKey="appointmentsEntered"
            name="Appointments"
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <ZAxis range={[60, 60]} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
            labelStyle={{ color: '#475569', fontWeight: 600 }}
            formatter={(value, name) => [value, name === 'appointmentsEntered' ? 'Appointments' : name]}
            labelFormatter={() => ''}
          />
          <Legend
            verticalAlign="top"
            height={28}
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
          />
          <Scatter name="Days" data={points} dataKey="appointmentsEntered" fill="#f43f5e" />
          {reg && (
            <Line
              type="linear"
              dataKey="trend"
              data={trendLine}
              name="Trend"
              stroke="#6152f7"
              strokeWidth={2}
              dot={false}
              legendType="line"
              isAnimationActive={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
