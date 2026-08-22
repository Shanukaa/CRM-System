import { NextResponse } from 'next/server';
import { getSheetRows, appendRows } from '@/lib/googleSheets';
import { requireStandardSession } from '@/lib/apiAuth';
import { withErrorHandling } from '@/lib/withErrorHandling';
import { v4 as uuidv4 } from 'uuid';

const MAX_ROWS = 500;

export const POST = withErrorHandling(async (req) => {
  const session = await requireStandardSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { rows } = await req.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: 'No rows to import' }, { status: 400 });
  }
  if (rows.length > MAX_ROWS) {
    return NextResponse.json({ error: `Import limited to ${MAX_ROWS} rows at a time` }, { status: 400 });
  }

  const { rows: existing } = await getSheetRows('Daily Records');
  const existingDates = new Set(existing.map((r) => normalizeDate(r.date)));

  const valid = [];
  const seenInFile = new Set();
  let skipped = 0;

  rows.forEach((r) => {
    const dateKey = normalizeDate(r.date);
    if (!r.date || !dateKey || existingDates.has(dateKey) || seenInFile.has(dateKey)) {
      skipped++;
      return;
    }
    seenInFile.add(dateKey);

    const messages = toNonNegativeInt(r.messages);
    const calls = toNonNegativeInt(r.calls);
    const leads = toNonNegativeInt(r.leads);
    const appointmentsEntered = toNonNegativeInt(r.appointmentsEntered);

    valid.push({
      ID: uuidv4(),
      date: r.date,
      messages,
      calls,
      leads,
      appointmentsEntered,
      total: messages + calls + leads, // always server-computed — never trust a client-supplied total
    });
  });

  if (valid.length) await appendRows('Daily Records', valid);

  return NextResponse.json({ success: true, imported: valid.length, skipped });
});

function toNonNegativeInt(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function normalizeDate(v) {
  if (!v) return '';
  const d = new Date(v);
  return isNaN(d) ? '' : d.toISOString().slice(0, 10);
}
