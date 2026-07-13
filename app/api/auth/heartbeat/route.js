import { NextResponse } from 'next/server';
import { updateRowById } from '@/lib/googleSheets';
import { requireSession } from '@/lib/apiAuth';

export async function POST() {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await updateRowById('Users', session.id, { 'last active': new Date().toISOString() });
  } catch {
    // Best-effort — a missed heartbeat shouldn't break anything else.
  }

  return NextResponse.json({ success: true });
}
