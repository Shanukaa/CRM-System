import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/apiAuth';

export async function GET() {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  return NextResponse.json({ user: session });
}
