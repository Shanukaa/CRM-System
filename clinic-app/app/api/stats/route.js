import { NextResponse } from 'next/server';
import { getSheetRows } from '@/lib/googleSheets';
import { requireSession } from '@/lib/apiAuth';

export async function GET(req) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const type = new URL(req.url).searchParams.get('type');

  if (type === 'clients') return NextResponse.json(await clientStats());
  if (type === 'appointments') return NextResponse.json(await appointmentStats());
  if (type === 'users') {
    if (session.usertype !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json(await userStats());
  }

  return NextResponse.json({ error: 'Unknown stats type' }, { status: 400 });
}

async function clientStats() {
  const { rows } = await getSheetRows('Clients');
  const total = rows.length;
  const active = rows.filter((r) => (r.status || '').toLowerCase() === 'active').length;
  const inactive = total - active;
  const totalContact = rows.filter((r) => r.phone).length;

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const lastMonthDate = new Date(thisYear, thisMonth - 1, 1);

  const countInMonth = (m, y) =>
    rows.filter((r) => {
      const d = parseDate(r['created at']);
      return d && d.getMonth() === m && d.getFullYear() === y;
    }).length;

  const currentMonthCount = countInMonth(thisMonth, thisYear);
  const lastMonthCount = countInMonth(lastMonthDate.getMonth(), lastMonthDate.getFullYear());
  const growth =
    lastMonthCount === 0 ? (currentMonthCount > 0 ? 100 : 0) : Math.round(((currentMonthCount - lastMonthCount) / lastMonthCount) * 100);

  return { total, active, inactive, totalContact, currentMonthCount, lastMonthCount, growth };
}

async function appointmentStats() {
  const { rows } = await getSheetRows('Appointments');
  const todayStr = new Date().toDateString();

  const today = rows.filter((r) => {
    const d = parseDate(r['preferred date']);
    return d && d.toDateString() === todayStr;
  }).length;

  const active = rows.filter((r) => ['pending', 'confirmed'].includes((r.status || '').toLowerCase())).length;
  const completed = rows.filter((r) => (r.status || '').toLowerCase() === 'completed').length;
  const total = rows.length;

  return { today, active, completed, total };
}

async function userStats() {
  const { rows: users } = await getSheetRows('Users');
  const { rows: appts } = await getSheetRows('Appointments');
  const perf = users.map((u) => ({
    username: u.username,
    usertype: u.usertype,
    appointmentsCreated: appts.filter((a) => a['created by'] === u.username).length,
  }));
  return { perf };
}

function parseDate(str) {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d) ? null : d;
}
