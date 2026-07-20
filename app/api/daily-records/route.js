import { NextResponse } from 'next/server';
import { getSheetRows, appendRow } from '@/lib/googleSheets';
import { requireSession } from '@/lib/apiAuth';
import { withErrorHandling } from '@/lib/withErrorHandling';
import { v4 as uuidv4 } from 'uuid';

const PAGE_SIZE = 15;

export const GET = withErrorHandling(async (req) => {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const q = (searchParams.get('q') || '').toLowerCase().trim();
  const dateFilter = searchParams.get('date') || '';
  const all = searchParams.get('all') === 'true';

  const { rows } = await getSheetRows('Daily Records');
  let filtered = rows;
  if (q) {
    filtered = filtered.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
  }
  if (dateFilter) {
    filtered = filtered.filter((r) => normalizeDate(r.date) === dateFilter);
  }
  filtered = filtered.slice().reverse(); // most recently added first

  const total = filtered.length;
  const pageRows = all ? filtered : filtered.slice((page - 1) * PAGE_SIZE, (page - 1) * PAGE_SIZE + PAGE_SIZE);

  return NextResponse.json({
    data: pageRows.map(cleanRow),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  });
});

export const POST = withErrorHandling(async (req) => {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.date) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 });
  }

  const messages = toNonNegativeInt(body.messages);
  const calls = toNonNegativeInt(body.calls);
  const leads = toNonNegativeInt(body.leads);

  const record = {
    ID: uuidv4(),
    date: body.date,
    messages,
    calls,
    leads,
    total: messages + calls + leads, // always server-computed — never trust a client-supplied total
    'created by': session.username,
  };
  await appendRow('Daily Records', record);
  return NextResponse.json({ success: true, data: record });
});

function toNonNegativeInt(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function cleanRow(r) {
  const { _rowNumber, ...rest } = r;
  return rest;
}

function normalizeDate(v) {
  if (!v) return '';
  const d = new Date(v);
  return isNaN(d) ? v : d.toISOString().slice(0, 10);
}
