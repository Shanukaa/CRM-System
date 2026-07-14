import { NextResponse } from 'next/server';
import { getSheetRows, appendRow } from '@/lib/googleSheets';
import { requireAdmin } from '@/lib/apiAuth';
import { withErrorHandling } from '@/lib/withErrorHandling';
import { v4 as uuidv4 } from 'uuid';

export const GET = withErrorHandling(async () => {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { rows } = await getSheetRows('Users');
  return NextResponse.json({
    data: rows.map((r) => {
      const { _rowNumber, ...rest } = r;
      return rest;
    }),
  });
});

export const POST = withErrorHandling(async (req) => {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  if (!body.username || !body.password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
  }

  const { rows } = await getSheetRows('Users', { useCache: false });
  if (rows.some((r) => r.username === body.username)) {
    return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
  }

  const record = {
    ID: uuidv4(),
    username: body.username,
    nic: body.nic || '',
    password: body.password,
    usertype: body.usertype || 'employee',
  };
  await appendRow('Users', record);
  return NextResponse.json({ success: true });
});
