import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/apiAuth';
import { deactivateStaleClients } from '@/lib/clientLifecycle';
import { withErrorHandling } from '@/lib/withErrorHandling';

export const POST = withErrorHandling(async () => {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const result = await deactivateStaleClients();
  return NextResponse.json({ success: true, ...result });
});
