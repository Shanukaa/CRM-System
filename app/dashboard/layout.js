import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySessionToken } from '@/lib/session';
import Sidebar from '@/components/Sidebar';

export default async function DashboardLayout({ children }) {
  const token = cookies().get('session')?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) redirect('/login');

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={session} />
      <main className="flex-1 p-6 pt-16 md:pt-6 md:ml-64">{children}</main>
    </div>
  );
}
