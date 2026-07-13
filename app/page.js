import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySessionToken } from '@/lib/session';

export default async function Home() {
  const token = cookies().get('session')?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) redirect('/login');
  redirect(session.usertype === 'admin' ? '/dashboard' : '/dashboard/welcome');
}
