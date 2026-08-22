import { cookies } from 'next/headers';
import { verifySessionToken } from './session';

export async function requireSession() {
  const token = cookies().get('session')?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireAdmin() {
  const session = await requireSession();
  if (!session || session.usertype !== 'admin') return null;
  return session;
}

// The "social" role is restricted to Daily Records Analytics only, so every
// endpoint except that one (and auth endpoints) should use this instead of
// requireSession() — otherwise a social user could still call the API
// directly even though the UI/middleware hide those pages from them.
export async function requireStandardSession() {
  const session = await requireSession();
  if (!session || session.usertype === 'social') return null;
  return session;
}
