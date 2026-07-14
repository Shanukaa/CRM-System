import { NextResponse } from 'next/server';
import { getSheetRows } from '@/lib/googleSheets';
import { requireSession } from '@/lib/apiAuth';
import { withErrorHandling } from '@/lib/withErrorHandling';

const LEADS_SHEET_ID = process.env.GOOGLE_LEADS_SHEET_ID;

export const GET = withErrorHandling(async () => {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!LEADS_SHEET_ID) {
    return NextResponse.json(
      { error: 'GOOGLE_LEADS_SHEET_ID is not configured. Add it to your environment variables.' },
      { status: 500 }
    );
  }

  const [{ rows: fatRows }, { rows: bodyRows }] = await Promise.all([
    getSheetRows('FAT Contouring', { spreadsheetId: LEADS_SHEET_ID }),
    getSheetRows('Body Fillers', { spreadsheetId: LEADS_SHEET_ID }),
  ]);

  const allRows = [...fatRows, ...bodyRows];
  const todayKey = toDateKey(new Date());

  const totalFat = fatRows.length;
  const totalBody = bodyRows.length;
  const todayLeads =
    fatRows.filter((r) => toDateKey(parseDate(r.created_time)) === todayKey).length +
    bodyRows.filter((r) => toDateKey(parseDate(r.created_time)) === todayKey).length;

  // Leads by city (combined, case-insensitive grouping, top 10) — the geographic-origin chart.
  const cityMap = new Map();
  allRows.forEach((r) => {
    const raw = (r.city || '').trim();
    if (!raw) return;
    const key = raw.toLowerCase();
    if (!cityMap.has(key)) cityMap.set(key, { city: raw, count: 0 });
    cityMap.get(key).count++;
  });
  const byCity = Array.from(cityMap.values()).sort((a, b) => b.count - a.count).slice(0, 10);

  // Leads by platform (combined)
  const platformMap = new Map();
  allRows.forEach((r) => {
    const raw = (r.platform || '').trim() || 'Unspecified';
    platformMap.set(raw, (platformMap.get(raw) || 0) + 1);
  });
  const byPlatform = Array.from(platformMap.entries())
    .map(([platform, count]) => ({ platform, count }))
    .sort((a, b) => b.count - a.count);

  // 14-day trend, both tables as separate series
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d;
  });
  const trend = days.map((d) => {
    const key = toDateKey(d);
    return {
      date: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      fatContouring: fatRows.filter((r) => toDateKey(parseDate(r.created_time)) === key).length,
      bodyFillers: bodyRows.filter((r) => toDateKey(parseDate(r.created_time)) === key).length,
    };
  });

  return NextResponse.json({
    totalFat,
    totalBody,
    totalLeads: totalFat + totalBody,
    todayLeads,
    byCity,
    byPlatform,
    trend,
  });
});

function toDateKey(d) {
  if (!d) return '';
  return d.toISOString().slice(0, 10);
}

function parseDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d) ? null : d;
}
