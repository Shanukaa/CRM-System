import { deactivateStaleClients } from '../../lib/clientLifecycle.js';

export default async () => {
  try {
    const result = await deactivateStaleClients();
    console.log(`Inactivity check complete: checked ${result.checked}, deactivated ${result.deactivated}`);
    return new Response(JSON.stringify(result), { headers: { 'content-type': 'application/json' } });
  } catch (err) {
    console.error('Inactivity check failed:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
};

export const config = {
  schedule: '0 2 * * *', // every day at 02:00 UTC
};
