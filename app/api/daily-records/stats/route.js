import { NextResponse } from 'next/server';
import { getSheetRows } from '@/lib/googleSheets';
import { requireSession } from '@/lib/apiAuth';
import { withErrorHandling } from '@/lib/withErrorHandling';

export const GET = withErrorHandling(async () => {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { rows } = await getSheetRows('Daily Records');

  const sum = (key) => rows.reduce((total, r) => total + (Number(r[key]) || 0), 0);
  const totals = {
    messages: sum('messages'),
    calls: sum('calls'),
    leads: sum('leads'),
    appointmentsEntered: sum('appointmentsEntered'),
    total: sum('total'),
  };

  // 14-day trend: messages/calls/leads/appointments entered per day
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d;
  });
  const byDateKey = new Map();
  rows.forEach((r) => {
    const key = normalizeDate(r.date);
    if (!key) return;
    const existing = byDateKey.get(key) || { messages: 0, calls: 0, leads: 0, appointmentsEntered: 0 };
    existing.messages += Number(r.messages) || 0;
    existing.calls += Number(r.calls) || 0;
    existing.leads += Number(r.leads) || 0;
    existing.appointmentsEntered += Number(r.appointmentsEntered) || 0;
    byDateKey.set(key, existing);
  });
  const trend = days.map((d) => {
    const key = toDateKey(d);
    const entry = byDateKey.get(key) || { messages: 0, calls: 0, leads: 0, appointmentsEntered: 0 };
    const activityTotal = entry.messages + entry.calls + entry.leads;
    return { date: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }), ...entry, activityTotal };
  });

  // Correlation analysis: how does activity relate to appointments booked?
  // Uses every day that has a record on file (not just the last 14) for a
  // more reliable read on the relationship.
  const allDays = Array.from(byDateKey.entries()).map(([key, v]) => ({
    date: key,
    ...v,
    activityTotal: v.messages + v.calls + v.leads,
  }));

  const appointmentsSeries = allDays.map((d) => d.appointmentsEntered);
  const correlation = {
    activity: pearson(allDays.map((d) => d.activityTotal), appointmentsSeries),
    messages: pearson(allDays.map((d) => d.messages), appointmentsSeries),
    calls: pearson(allDays.map((d) => d.calls), appointmentsSeries),
    leads: pearson(allDays.map((d) => d.leads), appointmentsSeries),
  };

  const strongestDriver = ['messages', 'calls', 'leads'].reduce((best, key) => {
    if (!best) return key;
    return Math.abs(correlation[key]) > Math.abs(correlation[best]) ? key : best;
  }, null);

  const totalActivity = totals.messages + totals.calls + totals.leads;
  const avgActivityPerAppointment = totals.appointmentsEntered > 0
    ? totalActivity / totals.appointmentsEntered
    : null;

  const scatter = allDays
    .filter((d) => d.activityTotal > 0 || d.appointmentsEntered > 0)
    .map((d) => ({
      date: new Date(d.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      activityTotal: d.activityTotal,
      appointmentsEntered: d.appointmentsEntered,
    }));

  return NextResponse.json({
    totals,
    trend,
    recordCount: rows.length,
    impact: { correlation, strongestDriver, avgActivityPerAppointment },
    scatter,
  });
});

// Pearson correlation coefficient between two equal-length numeric arrays.
function pearson(xs, ys) {
  const n = xs.length;
  if (n < 2) return 0;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const den = Math.sqrt(denX * denY);
  return den === 0 ? 0 : num / den;
}

function toDateKey(d) {
  if (!d) return '';
  return d.toISOString().slice(0, 10);
}

function normalizeDate(v) {
  if (!v) return '';
  const d = new Date(v);
  return isNaN(d) ? '' : d.toISOString().slice(0, 10);
}
