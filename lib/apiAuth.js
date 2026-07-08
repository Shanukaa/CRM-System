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
