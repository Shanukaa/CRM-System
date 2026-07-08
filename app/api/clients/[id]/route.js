import { NextResponse } from 'next/server';
import { updateRowById, deleteRowById } from '@/lib/googleSheets';
import { requireSession, requireAdmin } from '@/lib/apiAuth';

export async function PUT(req, { params }) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const updated = {};
  if (body.clientName !== undefined) updated['client name'] = body.clientName;
  if (body.phone !== undefined) updated.phone = body.phone;
  if (body.gender !== undefined) updated.gender = body.gender;
  if (body.language !== undefined) updated.language = body.language;
  if (body.status !== undefined) updated.status = body.status;

  try {
    await updateRowById('Clients', params.id, updated);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
}

export async function DELETE(req, { params }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    await deleteRowById('Clients', params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
}
