import { NextResponse } from 'next/server';
import { getSheetRows, updateRowById, deleteRowById } from '@/lib/googleSheets';
import { requireSession, requireAdmin } from '@/lib/apiAuth';
import { withErrorHandling } from '@/lib/withErrorHandling';

export const PUT = withErrorHandling(async (req, { params }) => {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.date || body.messages === undefined || body.calls === undefined || body.leads === undefined) {
    return NextResponse.json({ error: 'Date, messages, calls, and leads are all required' }, { status: 400 });
  }

  const { rows } = await getSheetRows('Daily Records');
  const dateKey = normalizeDate(body.date);
  const duplicate = rows.some((r) => r.ID !== params.id && normalizeDate(r.date) === dateKey);
  if (duplicate) {
    return NextResponse.json({ error: 'A record for this date already exists. Please edit that record instead.' }, { status: 409 });
  }

  const messages = toNonNegativeInt(body.messages);
  const calls = toNonNegativeInt(body.calls);
  const leads = toNonNegativeInt(body.leads);

  try {
    await updateRowById('Daily Records', params.id, {
      date: body.date,
      messages,
      calls,
      leads,
      total: messages + calls + leads,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
});

export const DELETE = withErrorHandling(async (req, { params }) => {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    await deleteRowById('Daily Records', params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
});

function toNonNegativeInt(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function normalizeDate(v) {
  if (!v) return '';
  const d = new Date(v);
  return isNaN(d) ? v : d.toISOString().slice(0, 10);
}
