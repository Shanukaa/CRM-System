import { NextResponse } from 'next/server';
import { updateRowById, deleteRowById } from '@/lib/googleSheets';
import { requireAdmin } from '@/lib/apiAuth';
import { withErrorHandling } from '@/lib/withErrorHandling';

export const PUT = withErrorHandling(async (req, { params }) => {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const updated = {};
  if (body.username !== undefined) updated.username = body.username;
  if (body.nic !== undefined) updated.nic = body.nic;
  if (body.usertype !== undefined) updated.usertype = body.usertype;
  if (body.password) updated.password = body.password; // leave unchanged if blank

  try {
    await updateRowById('Users', params.id, updated);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
});

export const DELETE = withErrorHandling(async (req, { params }) => {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    await deleteRowById('Users', params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
});
