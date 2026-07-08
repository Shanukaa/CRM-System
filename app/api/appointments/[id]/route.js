import { NextResponse } from 'next/server';
import { getSheetRows, updateRowById, deleteRowById } from '@/lib/googleSheets';
import { requireSession, requireAdmin } from '@/lib/apiAuth';

export async function PUT(req, { params }) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  if (body.clientName !== undefined) {
    const { rows: clients } = await getSheetRows('Clients');
    if (!clients.some((c) => c['client name'] === body.clientName)) {
      return NextResponse.json({ error: 'Appointments can only be made for registered clients' }, { status: 400 });
    }
  }

  const updated = {};
  if (body.clientName !== undefined) updated['client name'] = body.clientName;
  if (body.treatmentName !== undefined) updated['treatment name'] = body.treatmentName;
  if (body.phoneNumber !== undefined) updated['phone number'] = body.phoneNumber;
  if (body.preferredDate !== undefined) updated['preferred date'] = body.preferredDate;
  if (body.preferredTime !== undefined) updated['preferred time'] = body.preferredTime;
  if (body.status !== undefined) updated.status = body.status;

  try {
    await updateRowById('Appointments', params.id, updated);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
}

export async function DELETE(req, { params }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    await deleteRowById('Appointments', params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
}
