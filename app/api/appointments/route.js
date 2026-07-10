import { NextResponse } from 'next/server';
import { getSheetRows, appendRow, updateRowById } from '@/lib/googleSheets';
import { requireSession } from '@/lib/apiAuth';
import { v4 as uuidv4 } from 'uuid';

const PAGE_SIZE = 15;

export async function GET(req) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const q = (searchParams.get('q') || '').toLowerCase().trim();
  const dateFilter = searchParams.get('date') || '';
  const statusFilter = searchParams.get('status') || '';
  const all = searchParams.get('all') === 'true';

  const { rows } = await getSheetRows('Appointments');
  let filtered = rows;
  if (q) {
    filtered = filtered.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
  }
  if (statusFilter) {
    filtered = filtered.filter((r) => (r.status || '').toLowerCase() === statusFilter.toLowerCase());
  }
  if (dateFilter) {
    filtered = filtered.filter((r) => normalizeDate(r['preferred date']) === dateFilter);
  }
  filtered = filtered.slice().reverse();

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
  if (!body.clientName || !body.preferredDate) {
    return NextResponse.json({ error: 'Client name and preferred date are required' }, { status: 400 });
  }

  const { rows: clients } = await getSheetRows('Clients');
  const client = clients.find((c) => c['client name'] === body.clientName);
  if (!client) {
    return NextResponse.json({ error: 'Appointments can only be made for registered clients' }, { status: 400 });
  }

  const record = {
    ID: uuidv4(),
    'appointment number': `APT-${Date.now().toString().slice(-6)}`,
    'client name': body.clientName,
    'treatment name': body.treatmentName || '',
    'phone number': body.phoneNumber || '',
    'preferred date': body.preferredDate,
    'preferred time': body.preferredTime || '',
    status: body.status || 'Pending',
    'created by': session.username,
  };
  await appendRow('Appointments', record);

  // Booking an appointment means the client is engaged again — reactivate them if needed.
  if ((client.status || '').toLowerCase() !== 'active') {
    await updateRowById('Clients', client.ID, { status: 'Active' });
  }

  return NextResponse.json({ success: true, data: record });
}

function normalizeDate(v) {
  if (!v) return '';
  const d = new Date(v);
  return isNaN(d) ? v : d.toISOString().slice(0, 10);
}

function cleanRow(r) {
  const { _rowNumber, ...rest } = r;
  return rest;
}
