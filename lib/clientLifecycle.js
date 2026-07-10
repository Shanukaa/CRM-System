import { getSheetRows, batchUpdateColumn } from './googleSheets';

export const INACTIVITY_MONTHS = 2;

/**
 * Scans all currently-Active clients and flips any whose most recent appointment
 * (by preferred date), or registration date if they've never booked, is older than
 * INACTIVITY_MONTHS to "Inactive". Never touches clients that are already Inactive
 * (a manual admin choice there is left alone) and never promotes anyone back to
 * Active — that happens instantly when a client books a new appointment instead.
 */
export async function deactivateStaleClients() {
  const { rows: clients } = await getSheetRows('Clients', { useCache: false });
  const { rows: appointments } = await getSheetRows('Appointments', { useCache: false });

  const lastApptByClient = new Map();
  for (const a of appointments) {
    const name = a['client name'];
    const d = parseDate(a['preferred date']);
    if (!name || !d) continue;
    const existing = lastApptByClient.get(name);
    if (!existing || d > existing) lastApptByClient.set(name, d);
  }

  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - INACTIVITY_MONTHS);
  const updates = new Map();

  for (const c of clients) {
    if ((c.status || '').toLowerCase() !== 'active') continue;
    const reference = lastApptByClient.get(c['client name']) || parseDate(c['created at']);
    if (!reference) continue;
    if (reference.getTime() < cutoffDate.getTime()) {
      updates.set(c.ID, 'Inactive');
    }
  }

  const deactivated = await batchUpdateColumn('Clients', 'status', updates);
  return { checked: clients.length, deactivated };
}

function parseDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d) ? null : d;
}
