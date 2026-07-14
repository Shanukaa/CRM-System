import { NextResponse } from 'next/server';
import { getSheetRows, updateRowById, deleteRowById } from '@/lib/googleSheets';
import { requireSession, requireAdmin } from '@/lib/apiAuth';
import { withErrorHandling } from '@/lib/withErrorHandling';

export const PUT = withErrorHandling(async (req, { params }) => {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  if (body.phone !== undefined) {
    const phone = String(body.phone).trim();
    const { rows: existing } = await getSheetRows('Clients', { useCache: false });
    if (existing.some((r) => r.ID !== params.id && String(r.phone).trim() === phone)) {
      return NextResponse.json({ error: 'A client with this phone number already exists' }, { status: 409 });
    }
  }

  const updated = {};
  if (body.clientName !== undefined) updated['client name'] = body.clientName;
  if (body.phone !== undefined) updated.phone = String(body.phone).trim();
  if (body.gender !== undefined) updated.gender = body.gender;
  if (body.language !== undefined) updated.language = body.language;
  if (body.platform !== undefined) updated.platform = body.platform;
  if (body.status !== undefined) updated.status = body.status;

  try {
    await updateRowById('Clients', params.id, updated);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
});

export const DELETE = withErrorHandling(async (req, { params }) => {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    await deleteRowById('Clients', params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
});
