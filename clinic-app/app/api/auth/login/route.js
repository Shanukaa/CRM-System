import { NextResponse } from 'next/server';
import { getSheetRows } from '@/lib/googleSheets';
import { createSessionToken } from '@/lib/session';

export async function POST(req) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
  }

  const { rows } = await getSheetRows('Users');
  const user = rows.find((r) => r.username === username && r.password === password);
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const usertype = (user.usertype || '').toLowerCase();
  const token = await createSessionToken({ id: user.ID, username: user.username, usertype });

  const res = NextResponse.json({ success: true, usertype });
  res.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
  return res;
}
