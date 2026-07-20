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
    return { date: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }), ...entry };
  });

  return NextResponse.json({ totals, trend, recordCount: rows.length });
});

function toDateKey(d) {
  if (!d) return '';
  return d.toISOString().slice(0, 10);
}

function normalizeDate(v) {
  if (!v) return '';
  const d = new Date(v);
  return isNaN(d) ? '' : d.toISOString().slice(0, 10);
}
