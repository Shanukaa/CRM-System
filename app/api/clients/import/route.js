import { NextResponse } from 'next/server';
import { getSheetRows, appendRows } from '@/lib/googleSheets';
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

  const { rows: existing } = await getSheetRows('Clients', { useCache: false });
  const seenPhones = new Set(existing.map((r) => String(r.phone).trim()).filter(Boolean));

  const now = new Date().toISOString();
  const valid = [];
  let skipped = 0;

  for (const r of rows) {
    const phone = r.phone ? String(r.phone).trim() : '';
    if (!r.clientName || !phone || seenPhones.has(phone)) {
      skipped++;
      continue;
    }
    seenPhones.add(phone);
    valid.push({
      ID: uuidv4(),
      'client name': r.clientName,
      phone,
      gender: r.gender || '',
      language: r.language || '',
      platform: r.platform || '',
      'created at': now,
      status: r.status || 'Active',
    });
  }

  if (valid.length) await appendRows('Clients', valid);

  return NextResponse.json({ success: true, imported: valid.length, skipped });
}
