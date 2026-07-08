'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, CalendarCheck, LogOut, UserCog, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Sidebar({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/clients', label: 'Client List', icon: Users },
    { href: '/dashboard/appointments', label: 'Appointment List', icon: CalendarCheck },
  ];
  if (user.usertype === 'admin') {
    links.push({ href: '/dashboard/users', label: 'Users', icon: UserCog });
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      <button className="md:hidden fixed top-4 left-4 z-40 bg-white p-2 rounded-lg shadow" onClick={() => setOpen(!open)}>
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      <aside
        className={`fixed z-30 top-0 left-0 h-full w-64 bg-white border-r border-gray-200 transform ${
          open ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-200`}
      >
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-lg font-bold text-indigo-600">Clinic Manager</h1>
          <p className="text-xs text-gray-500 mt-1">
            {user.username} · <span className="capitalize">{user.usertype}</span>
          </p>
        </div>
        <nav className="p-4 space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
          <button onClick={logout} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 w-full px-3 py-2 rounded-lg hover:bg-red-50">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
