import { NextResponse } from 'next/server';
import { getSheetRows, appendRows, batchUpdateColumn } from '@/lib/googleSheets';
import { requireSession } from '@/lib/apiAuth';
import { v4 as uuidv4 } from 'uuid';

const MAX_ROWS = 500;

export async function POST(req) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { rows } = await req.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: 'No rows to import' }, { status: 400 });
  }
  if (rows.length > MAX_ROWS) {
    return NextResponse.json({ error: `Import limited to ${MAX_ROWS} rows at a time` }, { status: 400 });
  }

  const { rows: clients } = await getSheetRows('Clients');
  const clientByName = new Map(clients.map((c) => [c['client name'], c]));

  const valid = [];
  const toReactivate = new Map();
  let skipped = 0;

  rows.forEach((r, i) => {
    const client = clientByName.get(r.clientName);
    if (!r.clientName || !r.preferredDate || !client) {
      skipped++;
      return;
    }
    valid.push({
      ID: uuidv4(),
      'appointment number': `APT-${Date.now().toString().slice(-6)}-${i}`,
      'client name': r.clientName,
      'treatment name': r.treatmentName || '',
      'phone number': client.phone || '',
      'preferred date': r.preferredDate,
      'preferred time': r.preferredTime || '',
      platform: r.platform || '',
      status: r.status || 'Pending',
      'created by': session.username,
    });
    if ((client.status || '').toLowerCase() !== 'active') {
      toReactivate.set(client.ID, 'Active');
    }
  });

  if (valid.length) await appendRows('Appointments', valid);
  if (toReactivate.size) await batchUpdateColumn('Clients', 'status', toReactivate);

  return NextResponse.json({ success: true, imported: valid.length, skipped });
}
