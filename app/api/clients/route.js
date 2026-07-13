import { NextResponse } from 'next/server';
import { getSheetRows, appendRow } from '@/lib/googleSheets';
import { requireSession } from '@/lib/apiAuth';
import { v4 as uuidv4 } from 'uuid';

const PAGE_SIZE = 15;

export async function GET(req) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const q = (searchParams.get('q') || '').toLowerCase().trim();
  const sortDir = searchParams.get('sort') === 'asc' ? 'asc' : 'desc';
  const all = searchParams.get('all') === 'true';

  const { rows } = await getSheetRows('Clients');
  let filtered = rows;
  if (q) {
    filtered = filtered.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
  }
  filtered = filtered.slice().sort((a, b) => {
    const da = parseDate(a['created at']);
    const db = parseDate(b['created at']);
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return sortDir === 'asc' ? da - db : db - da;
  });

  const total = filtered.length;
  const pageRows = all ? filtered : filtered.slice((page - 1) * PAGE_SIZE, (page - 1) * PAGE_SIZE + PAGE_SIZE);

  return NextResponse.json({
    data: pageRows.map(cleanRow),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  });
}

export async function POST(req) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.clientName || !body.phone) {
    return NextResponse.json({ error: 'Client name and phone are required' }, { status: 400 });
  }

  const { rows: existing } = await getSheetRows('Clients', { useCache: false });
  const phone = String(body.phone).trim();
  if (existing.some((r) => String(r.phone).trim() === phone)) {
    return NextResponse.json({ error: 'A client with this phone number already exists' }, { status: 409 });
  }

  const record = {
    ID: uuidv4(),
    'client name': body.clientName,
    phone,
    gender: body.gender || '',
    language: body.language || '',
    platform: body.platform || '',
    'created at': new Date().toISOString(),
    status: body.status || 'Active',
  };
  await appendRow('Clients', record);
  return NextResponse.json({ success: true, data: record });
}

function cleanRow(r) {
  const { _rowNumber, ...rest } = r;
  return rest;
}

function parseDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d) ? null : d;
}
